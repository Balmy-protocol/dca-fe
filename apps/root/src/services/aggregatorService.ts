import { Abi, Address, ContractEventName, DecodeEventLogReturnType, TransactionRequest, decodeEventLog } from 'viem';
import {
  SwapOption,
  SwapOptionWithTx,
  Token,
  TransactionReceipt,
  TransactionRequestWithChain,
  PreparedTransactionRequest,
} from '@types';
import { toToken } from '@common/utils/currency';
import ERC20ABI from '@abis/erc20';
import WRAPPEDABI from '@abis/weth';
import { getProtocolToken } from '@common/mocks/tokens';
import { categorizeError, quoteResponseToSwapOption } from '@common/utils/quotes';
import { EstimatedQuoteResponse, QuoteResponse, QuoteResponseWithTx } from '@balmy/sdk/dist/services/quotes/types';
import { GasKeys, SORT_MOST_PROFIT, SwapSortOptions, TimeoutKey } from '@constants/aggregator';
import { compact } from 'lodash';
import ContractService from './contractService';
import WalletService from './walletService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import SafeService from './safeService';
import SimulationService from './simulationService';
import EventService from './analyticsService';
import { EstimatedQuoteResponseWithTx } from '@balmy/sdk';

export default class AggregatorService {
  contractService: ContractService;

  walletService: WalletService;

  sdkService: SdkService;

  providerService: ProviderService;

  safeService: SafeService;

  simulationService: SimulationService;

  eventService: EventService;

  constructor(
    walletService: WalletService,
    contractService: ContractService,
    sdkService: SdkService,
    providerService: ProviderService,
    safeService: SafeService,
    simulationService: SimulationService,
    eventService: EventService
  ) {
    this.contractService = contractService;
    this.walletService = walletService;
    this.sdkService = sdkService;
    this.providerService = providerService;
    this.safeService = safeService;
    this.simulationService = simulationService;
    this.eventService = eventService;
  }

  async addGasLimit(tx: TransactionRequestWithChain): Promise<TransactionRequestWithChain> {
    const gasUsed = await this.providerService.estimateGas(tx);

    return {
      ...tx,
      gas: (gasUsed * 130n) / 100n, // 30% more
    };
  }

  async swap(route: SwapOptionWithTx) {
    const transactionToSend = await this.addGasLimit({
      ...(route.tx as PreparedTransactionRequest),
      chainId: route.chainId,
    });

    return this.providerService.sendTransaction(transactionToSend);
  }

  async approveAndSwapSafe(route: SwapOptionWithTx) {
    const account = route.tx.from as Address;
    const approveTx = await this.walletService.buildApproveSpecificTokenTx(
      account,
      route.sellToken,
      route.swapper.allowanceTarget as Address,
      BigInt(route.sellAmount.amount)
    );

    return this.safeService.submitMultipleTxs([approveTx, route.tx as TransactionRequest]);
  }

  async buildSwapOptions({ options, recipient }: { options: SwapOption[]; recipient: Address }) {
    return this.sdkService.buildSwapOptions(options, recipient);
  }

  async getSwapOptions({
    from,
    to,
    sellAmount,
    buyAmount,
    sorting,
    transferTo,
    slippage,
    gasSpeed,
    takerAddress,
    chainId,
    disabledDexes,
    usePermit2 = false,
    sourceTimeout = TimeoutKey.patient,
  }: {
    from: Token;
    to: Token;
    chainId: number;
    sellAmount?: bigint;
    buyAmount?: bigint;
    sorting?: SwapSortOptions;
    transferTo?: string | null;
    slippage?: number;
    gasSpeed?: GasKeys;
    takerAddress?: Address;
    disabledDexes?: string[];
    usePermit2?: boolean;
    sourceTimeout?: TimeoutKey;
  }) {
    const balance = await this.walletService.getBalance({ account: takerAddress, token: from });

    let isOnNetwork = false;
    try {
      isOnNetwork = !chainId || (await this.providerService.getNetwork(takerAddress))?.chainId === chainId;
    } catch {}

    const shouldValidate = takerAddress && isOnNetwork && !!sellAmount && balance >= sellAmount;

    let hasEnoughForSwap = !!sellAmount && balance >= sellAmount;

    const swapOptionsResponse = await this.sdkService.getSwapOptions({
      from: from.address,
      to: to.address,
      sellAmount,
      buyAmount,
      sortQuotesBy: sorting,
      recipient: transferTo,
      slippagePercentage: slippage,
      gasSpeed,
      takerAddress,
      skipValidation: !shouldValidate,
      chainId,
      disabledDexes,
      usePermit2,
      sourceTimeout,
    });

    const validOptions = compact(
      swapOptionsResponse.map((option) => {
        if ('failed' in option) {
          // eslint-disable-next-line no-void
          void this.eventService.trackEvent('Aggregator - Fetching quote error', {
            source: option.source.id,
            sourceTimeout,
            errorType: categorizeError(option.error as string),
          });
          return null;
        }
        // eslint-disable-next-line no-void
        void this.eventService.trackEvent('Aggregator - Fetching quote successfull', {
          source: option.source.id,
          sourceTimeout,
        });
        return option;
      }) as QuoteResponse[]
    );

    const protocolToken = getProtocolToken(chainId);

    const sellToken = from.address === protocolToken.address ? protocolToken : toToken(from);
    const buyToken = to.address === protocolToken.address ? protocolToken : toToken(to);

    let sortedOptions = validOptions.map<SwapOption>((quoteResponse) => ({
      ...quoteResponseToSwapOption({
        ...quoteResponse,
        sellToken: {
          ...quoteResponse.sellToken,
          ...sellToken,
        },
        buyToken: {
          ...quoteResponse.buyToken,
          ...buyToken,
        },
        transferTo: transferTo as Address,
      }),
    }));

    if (buyAmount) {
      hasEnoughForSwap = sortedOptions.some((option) => balance >= option.sellAmount.amount);
    }

    if (usePermit2 && from.address === protocolToken.address && takerAddress && hasEnoughForSwap) {
      const builtOptions = await this.buildSwapOptions({ options: sortedOptions, recipient: takerAddress });
      const parsedOptions = sortedOptions.map((option) => ({ ...option, tx: builtOptions[option.swapper.id] }));

      sortedOptions = await this.simulationService.simulateQuotes({
        user: takerAddress,
        quotes: parsedOptions.filter((option) => !!option.tx),
        sorting: sorting || SORT_MOST_PROFIT,
        chainId,
        minimumReceived: buyAmount,
        recipient: transferTo as Address,
      });
    }
    return sortedOptions;
  }

  async getSwapOptionsPromise({
    from,
    to,
    sellAmount,
    buyAmount,
    sorting,
    transferTo,
    slippage,
    gasSpeed,
    takerAddress,
    chainId,
    disabledDexes,
    usePermit2 = false,
    sourceTimeout = TimeoutKey.patient,
  }: {
    from: Token;
    to: Token;
    chainId: number;
    sellAmount?: bigint;
    buyAmount?: bigint;
    sorting?: SwapSortOptions;
    transferTo?: string | null;
    slippage?: number;
    gasSpeed?: GasKeys;
    takerAddress?: Address;
    disabledDexes?: string[];
    usePermit2?: boolean;
    sourceTimeout?: TimeoutKey;
  }) {
    const balance = await this.walletService.getBalance({ account: takerAddress, token: from });

    let isOnNetwork = false;
    try {
      isOnNetwork = !chainId || (await this.providerService.getNetwork(takerAddress))?.chainId === chainId;
    } catch {}

    const shouldValidate = takerAddress && isOnNetwork && !!sellAmount && balance >= sellAmount;

    const swapOptionsResponse = this.sdkService.getSwapOptionsPromise({
      from: from.address,
      to: to.address,
      sellAmount,
      buyAmount,
      sortQuotesBy: sorting,
      recipient: transferTo,
      slippagePercentage: slippage,
      gasSpeed,
      takerAddress,
      skipValidation: !shouldValidate,
      chainId,
      disabledDexes,
      usePermit2,
      sourceTimeout,
    });

    const handledOptions = Object.entries(swapOptionsResponse).reduce<
      Record<string, Promise<EstimatedQuoteResponseWithTx | EstimatedQuoteResponse | QuoteResponse | null>>
    >((acc, [key, promise]) => {
      // eslint-disable-next-line no-param-reassign
      acc[key] = promise.catch(() => null);
      return acc;
    }, {});

    if (usePermit2) {
      // eslint-disable-next-line no-param-reassign
      return handledOptions as Record<string, Promise<EstimatedQuoteResponseWithTx | null>>;
    } else if (takerAddress) {
      const result: Record<string, Promise<QuoteResponseWithTx | null>> = {};
      const txs = this.sdkService.sdk.quoteService.buildTxs({
        quotes: swapOptionsResponse as Record<string, Promise<QuoteResponse>>,
      });
      const quotes = swapOptionsResponse as Record<string, Promise<QuoteResponse>>;

      for (const sourceId in quotes) {
        result[sourceId] = Promise.all([quotes[sourceId], txs[sourceId]])
          .then(([quote, tx]) => ({
            ...quote,
            tx,
          }))
          .catch(() => null);
      }

      return result;
    }

    return handledOptions as Record<string, Promise<EstimatedQuoteResponse | null>>;
  }

  findTransferValue(
    txReceipt: TransactionReceipt,
    tokenAddress: string,
    {
      from,
      notFrom,
      to,
      notTo,
    }: {
      from?: { address: string };
      notFrom?: { address: string };
      to?: { address: string };
      notTo?: { address: string }[];
    }
  ) {
    const logs = this.findLogs(
      txReceipt,
      ERC20ABI,
      'Transfer',
      tokenAddress,
      (log) =>
        (!from || ('from' in log.args && log.args.from.toLowerCase() === from.address.toLowerCase())) &&
        (!to || ('to' in log.args && log.args.to.toLowerCase() === to.address.toLowerCase())) &&
        (!notFrom || ('from' in log.args && log.args.from.toLowerCase() !== notFrom.address.toLowerCase())) &&
        (!notTo ||
          !notTo.some(({ address }) => 'to' in log.args && address.toLowerCase() === log.args.to.toLowerCase()))
    );
    const wrappedWithdrawLogs = this.findLogs(
      txReceipt,
      WRAPPEDABI,
      'Withdrawal',
      tokenAddress,
      (log) =>
        (!to || ('src' in log.args && log.args.src.toLowerCase() === to.address.toLowerCase())) &&
        (!notTo ||
          !notTo.some(({ address }) => 'src' in log.args && address.toLowerCase() === log.args.src.toLowerCase()))
    );
    const wrappedDepositLogs = this.findLogs(
      txReceipt,
      WRAPPEDABI,
      'Deposit',
      tokenAddress,
      (log) =>
        (!to || ('dst' in log.args && log.args.dst.toLowerCase() === to.address.toLowerCase())) &&
        (!notTo ||
          !notTo.some(({ address }) => 'dst' in log.args && address.toLowerCase() === log.args.dst.toLowerCase()))
    );

    const fullLogs = [...logs, ...wrappedDepositLogs, ...wrappedWithdrawLogs];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return fullLogs.map((log) => {
      if ('value' in log.args) {
        return log.args.value;
      }
      if ('wad' in log.args) {
        return log.args.wad;
      }

      return 0n;
    });
  }

  findLogs<TAbi extends Abi | readonly unknown[], TEventName extends string | undefined>(
    txReceipt: TransactionReceipt,
    contractAbi: TAbi,
    eventName: TEventName,
    byAddress: string,
    extraFilter?: (_: DecodeEventLogReturnType<TAbi, ContractEventName<TAbi>>) => boolean
  ): DecodeEventLogReturnType<TAbi>[] {
    const result: DecodeEventLogReturnType<TAbi, ContractEventName<TAbi>>[] = [];
    const { logs } = txReceipt;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < logs.length; i++) {
      if (logs[i].address.toLowerCase() === byAddress.toLowerCase()) {
        try {
          const parsedLog = decodeEventLog({
            abi: contractAbi,
            ...logs[i],
          });
          if (parsedLog.eventName === eventName) {
            // @ts-expect-error typescript magic
            if (!extraFilter || extraFilter(parsedLog)) {
              // @ts-expect-error typescript magic
              result.push(parsedLog);
            }
          }
        } catch (e) {
          // Skipping any event not included in our ABI
          console.error(
            `Error trying to find logs for ${txReceipt.transactionHash} at ${txReceipt.chainId} network:`,
            e
          );
        }
      }
    }

    return result;
  }
}
