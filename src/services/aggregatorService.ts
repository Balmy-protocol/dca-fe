/* eslint-disable no-await-in-loop */
import { BigNumber, Signer } from 'ethers';
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal';

// MOCKS
import { PositionVersions } from 'config/constants';
import { RawSwapOption, SwapOption, Token } from 'types';
import { TransactionRequest } from '@ethersproject/providers';
import { toToken } from 'utils/currency';
import { parseUnits } from '@ethersproject/units';
import { getProtocolToken } from 'mocks/tokens';
import { GasKeys } from 'config/constants/aggregator';
import GraphqlService from './graphql';
import ContractService from './contractService';
import WalletService from './walletService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';

export default class AggregatorService {
  modal: SafeAppWeb3Modal;

  signer: Signer;

  contractService: ContractService;

  walletService: WalletService;

  meanApiService: MeanApiService;

  apolloClient: Record<PositionVersions, Record<number, GraphqlService>>;

  providerService: ProviderService;

  constructor(
    walletService: WalletService,
    contractService: ContractService,
    meanApiService: MeanApiService,
    DCASubgraph: Record<PositionVersions, Record<number, GraphqlService>>,
    providerService: ProviderService
  ) {
    this.contractService = contractService;
    this.walletService = walletService;
    this.meanApiService = meanApiService;
    this.apolloClient = DCASubgraph;
    this.providerService = providerService;
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

  async swap(route: SwapOption) {
    const transactionToSend = await this.addGasLimit(route.tx);

    return this.providerService.sendTransaction(transactionToSend);
  }

  async getSwapOptions(
    from: Token,
    to: Token,
    sellAmount?: BigNumber,
    buyAmount?: BigNumber,
    sorting?: string,
    transferTo?: string | null,
    slippage?: number,
    gasSpeed?: GasKeys,
    takerAddress?: string
  ) {
    let shouldValidate = !buyAmount;

    if (takerAddress && sellAmount) {
      const preAllowanceTarget = await this.meanApiService.getAllowanceTarget();
      const allowance = await this.walletService.getSpecificAllowance(from, preAllowanceTarget);

      if (parseUnits(allowance.allowance, from.decimals).lt(sellAmount)) {
        shouldValidate = false;
      }

      if (shouldValidate) {
        // If user does not have the balance do not validate tx
        const balance = await this.walletService.getBalance(from.address);

        if (balance.lt(sellAmount)) {
          shouldValidate = false;
        }
      }
    }

    const swapOptionsResponse = await this.meanApiService.getSwapOptions(
      from.address,
      to.address,
      sellAmount,
      buyAmount,
      sorting,
      transferTo,
      slippage,
      gasSpeed,
      takerAddress,
      !shouldValidate
    );

    const filteredOptions: RawSwapOption[] = swapOptionsResponse.quotes.filter(
      (option) => !('failed' in option)
    ) as RawSwapOption[];

    const network = await this.walletService.getNetwork();

    const protocolToken = getProtocolToken(network.chainId);

    const sellToken =
      swapOptionsResponse.sellToken.address === protocolToken.address
        ? protocolToken
        : toToken(swapOptionsResponse.sellToken);
    const buyToken =
      swapOptionsResponse.buyToken.address === protocolToken.address
        ? protocolToken
        : toToken(swapOptionsResponse.buyToken);

    return filteredOptions.map<SwapOption>(
      ({
        sellAmount: {
          amount: sellAmountAmount,
          amountInUnits: sellAmountAmountInUnits,
          amountInUSD: sellAmountAmountInUsd,
        },
        buyAmount: {
          amount: buyAmountAmount,
          amountInUnits: buyAmountAmountInUnits,
          amountInUSD: buyAmountAmountInUsd,
        },
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
        gas: { estimatedGas, estimatedCost, estimatedCostInUnits, estimatedCostInUSD, gasTokenSymbol },
        swapper: { allowanceTarget, address, id, logoURI, name },
        type,
        tx,
      }) => ({
        sellToken,
        buyToken,
        sellAmount: {
          amount: BigNumber.from(sellAmountAmount),
          amountInUnits: Number(sellAmountAmountInUnits),
          amountInUSD: sellAmountAmountInUsd,
        },
        buyAmount: {
          amount: BigNumber.from(buyAmountAmount),
          amountInUnits: Number(buyAmountAmountInUnits),
          amountInUSD: buyAmountAmountInUsd,
        },
        maxSellAmount: {
          amount: BigNumber.from(maxSellAmountAmount),
          amountInUnits: Number(maxSellAmountAmountInUnits),
          amountInUSD: maxSellAmountAmountInUsd,
        },
        minBuyAmount: {
          amount: BigNumber.from(minBuyAmountAmount),
          amountInUnits: Number(minBuyAmountAmountInUnits),
          amountInUSD: minBuyAmountAmountInUsd,
        },
        gas: {
          estimatedGas: BigNumber.from(estimatedGas),
          estimatedCost: BigNumber.from(estimatedCost),
          estimatedCostInUnits,
          estimatedCostInUSD,
          gasTokenSymbol,
        },
        swapper: {
          allowanceTarget,
          address,
          id,
          name,
          logoURI,
        },
        type,
        tx,
      })
    );
  }
}

/* eslint-enable no-await-in-loop */
