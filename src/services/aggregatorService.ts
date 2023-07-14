/* eslint-disable no-await-in-loop */
import { BigNumber, Signer, utils } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import isUndefined from 'lodash/isUndefined';

// MOCKS
import { SwapOption, SwapOptionWithTx, Token, PositionVersions } from '@types';
import { TransactionReceipt, TransactionRequest } from '@ethersproject/providers';
import { toToken } from '@common/utils/currency';
import { Interface } from '@ethersproject/abi';
import ERC20ABI from '@abis/erc20.json';
import WRAPPEDABI from '@abis/weth.json';
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken } from '@common/mocks/tokens';
import { quoteResponseToSwapOption } from '@common/utils/quotes';
import { QuoteResponse } from '@mean-finance/sdk/dist/services/quotes/types';
import { NULL_ADDRESS, ONE_DAY } from '@constants';
import { GasKeys, SORT_MOST_PROFIT, SwapSortOptions } from '@constants/aggregator';
import GraphqlService from './graphql';
import ContractService from './contractService';
import WalletService from './walletService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import SafeService from './safeService';
import SimulationService from './simulationService';

export default class AggregatorService {
  signer: Signer;

  contractService: ContractService;

  walletService: WalletService;

  sdkService: SdkService;

  apolloClient: Record<PositionVersions, Record<number, GraphqlService>>;

  providerService: ProviderService;

  safeService: SafeService;

  simulationService: SimulationService;

  constructor(
    walletService: WalletService,
    contractService: ContractService,
    sdkService: SdkService,
    DCASubgraph: Record<PositionVersions, Record<number, GraphqlService>>,
    providerService: ProviderService,
    safeService: SafeService,
    simulationService: SimulationService
  ) {
    this.contractService = contractService;
    this.walletService = walletService;
    this.sdkService = sdkService;
    this.apolloClient = DCASubgraph;
    this.providerService = providerService;
    this.safeService = safeService;
    this.simulationService = simulationService;
  }

  getSigner() {
    return this.signer;
  }

  async addGasLimit(tx: TransactionRequest): Promise<TransactionRequest> {
    const gasUsed = await this.providerService.estimateGas(tx);

    return {
      ...tx,
      gasLimit: gasUsed.mul(BigNumber.from(130)).div(BigNumber.from(100)), // 30% more
    };
  }

  async swap(route: SwapOptionWithTx) {
    const transactionToSend = await this.addGasLimit(route.tx);

    return this.providerService.sendTransaction(transactionToSend);
  }

  async swapPermit2(
    route: SwapOptionWithTx,
    signature?: { nonce: BigNumber; deadline: number; v: number; r: Buffer; s: Buffer; rawSignature: string }
  ) {
    const meanPermit2Instance = await this.contractService.getMeanPermit2Instance();
    const address = this.walletService.getAccount();

    let populatedTransaction;

    if (route.type === 'buy') {
      populatedTransaction = await meanPermit2Instance.populateTransaction.buyOrderSwap(
        {
          // Deadline
          deadline: signature?.deadline || Math.floor(Date.now() / 1000) + ONE_DAY.toNumber(),
          // Take from caller
          tokenIn: route.sellToken.address === PROTOCOL_TOKEN_ADDRESS ? NULL_ADDRESS : route.sellToken.address,
          maxAmountIn: route.maxSellAmount.amount,
          nonce: signature?.nonce || BigNumber.from(0),
          signature: signature?.rawSignature || '0x',
          // Swapp approval
          allowanceTarget: route.swapper.allowanceTarget,
          // Swap execution
          swapper: route.tx.to,
          swapData: route.tx.data,
          // Swap validation
          tokenOut: route.buyToken.address === PROTOCOL_TOKEN_ADDRESS ? NULL_ADDRESS : route.buyToken.address,
          amountOut: route.minBuyAmount.amount,
          // Transfer token out
          transferOut: [{ recipient: route.transferTo || address, shareBps: 0 }],
          unspentTokenInRecipient: NULL_ADDRESS,
        },
        { value: route.sellToken.address === PROTOCOL_TOKEN_ADDRESS ? route.maxSellAmount.amount : BigNumber.from(0) }
      );
    } else {
      populatedTransaction = await meanPermit2Instance.populateTransaction.sellOrderSwap(
        {
          // Deadline
          deadline: signature?.deadline || Math.floor(Date.now() / 1000) + ONE_DAY.toNumber(),
          // Take from caller
          tokenIn: route.sellToken.address === PROTOCOL_TOKEN_ADDRESS ? NULL_ADDRESS : route.sellToken.address,
          amountIn: route.maxSellAmount.amount,
          nonce: signature?.nonce || BigNumber.from(0),
          signature: signature?.rawSignature || '0x',
          // Swapp approval
          allowanceTarget: route.swapper.allowanceTarget,
          // Swap execution
          swapper: route.tx.to,
          swapData: route.tx.data,
          // Swap validation
          tokenOut: route.buyToken.address === PROTOCOL_TOKEN_ADDRESS ? NULL_ADDRESS : route.buyToken.address,
          minAmountOut: route.minBuyAmount.amount,
          // Transfer token out
          transferOut: [{ recipient: route.transferTo || address, shareBps: 0 }],
        },
        { value: route.sellToken.address === PROTOCOL_TOKEN_ADDRESS ? route.maxSellAmount.amount : BigNumber.from(0) }
      );
    }

    const transactionToSend = await this.addGasLimit(populatedTransaction);

    return this.providerService.sendTransaction(transactionToSend);
  }

  async approveAndSwapSafe(route: SwapOptionWithTx) {
    const approveTx = await this.walletService.buildApproveSpecificTokenTx(
      route.sellToken,
      route.swapper.allowanceTarget,
      BigNumber.from(route.sellAmount.amount)
    );

    return this.safeService.submitMultipleTxs([approveTx, route.tx]);
  }

  async getSwapOptions(
    from: Token,
    to: Token,
    sellAmount?: BigNumber,
    buyAmount?: BigNumber,
    sorting?: SwapSortOptions,
    transferTo?: string | null,
    slippage?: number,
    gasSpeed?: GasKeys,
    takerAddress?: string,
    chainId?: number,
    disabledDexes?: string[],
    usePermit2 = false
  ) {
    const currentNetwork = await this.providerService.getNetwork();

    const isOnNetwork = !chainId || currentNetwork.chainId === chainId;
    let shouldValidate = !buyAmount && isOnNetwork;

    const network = chainId || currentNetwork.chainId;

    if (takerAddress && sellAmount) {
      // const preAllowanceTarget = await this.sdkService.getAllowanceTarget();
      // const allowance = await this.walletService.getSpecificAllowance(from, preAllowanceTarget);

      // if (parseUnits(allowance.allowance, from.decimals).lt(sellAmount)) {
      //   shouldValidate = false;
      // }

      if (shouldValidate) {
        // If user does not have the balance do not validate tx
        const balance = await this.walletService.getBalance(from.address);

        if (balance.lt(sellAmount)) {
          shouldValidate = false;
        }
      }
    }

    const swapOptionsResponse = await this.sdkService.getSwapOptions(
      from.address,
      to.address,
      sellAmount,
      buyAmount,
      sorting,
      transferTo,
      slippage,
      gasSpeed,
      takerAddress,
      !shouldValidate,
      network,
      disabledDexes,
      usePermit2
    );

    const filteredOptions = swapOptionsResponse.filter((option) => !('failed' in option)) as QuoteResponse[];

    const protocolToken = getProtocolToken(network);

    const sellToken = from.address === protocolToken.address ? protocolToken : toToken(from);
    const buyToken = to.address === protocolToken.address ? protocolToken : toToken(to);

    let sortedOptions = filteredOptions.map<SwapOption>((quoteResponse) => ({
      ...quoteResponseToSwapOption(quoteResponse),
      transferTo,
      sellToken,
      buyToken,
    }));

    if (usePermit2 && from.address === protocolToken.address && takerAddress) {
      sortedOptions = await this.simulationService.simulateQuotes(
        sortedOptions,
        sorting || SORT_MOST_PROFIT,
        undefined,
        buyAmount
      );
    }

    return sortedOptions;
  }

  async getSwapOption(
    quote: SwapOption,
    takerAddress: string,
    transferTo?: string | null,
    slippage?: number,
    gasSpeed?: GasKeys,
    chainId?: number,
    usePermit2?: boolean
  ) {
    const currentNetwork = await this.providerService.getNetwork();

    const isBuyOrder = quote.type === 'buy';

    const isOnNetwork = !chainId || currentNetwork.chainId === chainId;
    let shouldValidate = !isBuyOrder && isOnNetwork;

    const network = chainId || currentNetwork.chainId;

    if (takerAddress && !isBuyOrder) {
      // const preAllowanceTarget = await this.sdkService.getAllowanceTarget();
      // const allowance = await this.walletService.getSpecificAllowance(from, preAllowanceTarget);

      // if (parseUnits(allowance.allowance, from.decimals).lt(sellAmount)) {
      //   shouldValidate = false;
      // }

      if (shouldValidate) {
        // If user does not have the balance do not validate tx
        const balance = await this.walletService.getBalance(quote.sellToken.address);

        if (balance.lt(quote.sellAmount.amount)) {
          shouldValidate = false;
        }
      }
    }

    const swapOptionResponse = await this.sdkService.getSwapOption(
      quote,
      takerAddress,
      network,
      transferTo,
      slippage,
      gasSpeed,
      !shouldValidate,
      usePermit2
    );

    const { sellToken, buyToken } = quote;

    const {
      sellAmount: {
        amount: sellAmountAmount,
        amountInUnits: sellAmountAmountInUnits,
        amountInUSD: sellAmountAmountInUsd,
      },
      buyAmount: { amount: buyAmountAmount, amountInUnits: buyAmountAmountInUnits, amountInUSD: buyAmountAmountInUsd },
      maxSellAmount: {
        amount: maxSellAmountAmount,
        amountInUnits: maxSellAmountAmountInUnits,
        amountInUSD: maxSellAmountAmountInUsd,
      },
      minBuyAmount: {
        amount: minBuyAmountAmount,
        amountInUnits: minBuyAmountAmountInUnits,
        amountInUSD: minBuyAmountAmountInUsd,
      },
      gas,
      source: { allowanceTarget, logoURI, name, id },
      type,
      tx,
    } = swapOptionResponse;

    return {
      id: uuidv4(),
      sellToken,
      buyToken,
      transferTo,
      sellAmount: {
        amount: BigNumber.from(sellAmountAmount),
        amountInUnits: sellAmountAmountInUnits,
        amountInUSD: Number(sellAmountAmountInUsd) || 0,
      },
      buyAmount: {
        amount: BigNumber.from(buyAmountAmount),
        amountInUnits: buyAmountAmountInUnits,
        amountInUSD: Number(buyAmountAmountInUsd) || 0,
      },
      maxSellAmount: {
        amount: BigNumber.from(maxSellAmountAmount),
        amountInUnits: maxSellAmountAmountInUnits,
        amountInUSD: Number(maxSellAmountAmountInUsd) || 0,
      },
      minBuyAmount: {
        amount: BigNumber.from(minBuyAmountAmount),
        amountInUnits: minBuyAmountAmountInUnits,
        amountInUSD: Number(minBuyAmountAmountInUsd) || 0,
      },
      gas: gas && {
        estimatedGas: BigNumber.from(gas.estimatedGas),
        estimatedCost: BigNumber.from(gas.estimatedCost),
        estimatedCostInUnits: gas.estimatedCostInUnits,
        estimatedCostInUSD: (!isUndefined(gas.estimatedCostInUSD) && Number(gas.estimatedCostInUSD)) || undefined,
        gasTokenSymbol: gas.gasTokenSymbol,
      },
      swapper: {
        allowanceTarget,
        name,
        logoURI,
        id,
      },
      type,
      tx,
    };
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
      new Interface(ERC20ABI),
      'Transfer',
      (log) =>
        (!from || log.args.from === from.address) &&
        (!to || log.args.to === to.address) &&
        (!notFrom || log.args.from !== notFrom.address) &&
        (!notTo || !notTo.some(({ address }) => address === log.args.to)),
      tokenAddress
    );
    const wrappedWithdrawLogs = this.findLogs(
      txReceipt,
      new Interface(WRAPPEDABI),
      'Withdrawal',
      (log) =>
        (!to || log.args.dst === to.address) && (!notTo || !notTo.some(({ address }) => address === log.args.dst)),
      tokenAddress
    );
    const wrappedDepositLogs = this.findLogs(
      txReceipt,
      new Interface(WRAPPEDABI),
      'Deposit',
      (log) =>
        (!to || log.args.dst === to.address) && (!notTo || !notTo.some(({ address }) => address === log.args.dst)),
      tokenAddress
    );

    const fullLogs = [...logs, ...wrappedDepositLogs, ...wrappedWithdrawLogs];

    return fullLogs.map((log) => BigNumber.from(log.args.value || log.args.wad || 0));
  }

  findLogs(
    txReceipt: TransactionReceipt,
    contractInterface: utils.Interface,
    eventTopic: string,
    extraFilter?: (_: utils.LogDescription) => boolean,
    byAddress?: string
  ): utils.LogDescription[] {
    const result: utils.LogDescription[] = [];
    const { logs } = txReceipt;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < logs.length; i++) {
      // eslint-disable-next-line no-plusplus
      for (let x = 0; x < logs[i].topics.length; x++) {
        if (
          (!byAddress || logs[i].address.toLowerCase() === byAddress.toLowerCase()) &&
          logs[i].topics[x] === contractInterface.getEventTopic(eventTopic)
        ) {
          const parsedLog = contractInterface.parseLog(logs[i]);
          if (!extraFilter || extraFilter(parsedLog)) {
            result.push(parsedLog);
          }
        }
      }
    }
    return result;
  }
}

/* eslint-enable no-await-in-loop */
