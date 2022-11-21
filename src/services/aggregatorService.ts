/* eslint-disable no-await-in-loop */
import { BigNumber, Signer } from 'ethers';
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal';

// MOCKS
import { PositionVersions } from 'config/constants';
import { RawSwapOption, SwapOption, Token } from 'types';
import { TransactionRequest } from '@ethersproject/providers';
import GraphqlService from './graphql';
import ContractService from './contractService';
import WalletService from './walletService';
import MeanApiService from './meanApiService';

export default class AggregatorService {
  modal: SafeAppWeb3Modal;

  signer: Signer;

  contractService: ContractService;

  walletService: WalletService;

  meanApiService: MeanApiService;

  apolloClient: Record<PositionVersions, Record<number, GraphqlService>>;

  constructor(
    walletService: WalletService,
    contractService: ContractService,
    meanApiService: MeanApiService,
    DCASubgraph: Record<PositionVersions, Record<number, GraphqlService>>
  ) {
    this.contractService = contractService;
    this.walletService = walletService;
    this.meanApiService = meanApiService;
    this.apolloClient = DCASubgraph;
  }

  getSigner() {
    return this.signer;
  }

  async addGasLimit(tx: TransactionRequest): Promise<TransactionRequest> {
    const signer = this.walletService.getSigner();

    const gasUsed = await signer.estimateGas(tx);

    return {
      ...tx,
      gasLimit: gasUsed.mul(BigNumber.from(130)).div(BigNumber.from(100)), // 30% more
    };
  }

  async swap(route: SwapOption) {
    const singer = this.walletService.getSigner();

    const transactionToSend = await this.addGasLimit(route.tx);

    return singer.sendTransaction(transactionToSend);
  }

  async getSwapOptions(
    from: Token,
    to: Token,
    sellAmount?: BigNumber,
    buyAmount?: BigNumber,
    sorting?: string,
    transferTo?: string | null
  ) {
    const swapOptionsResponse = await this.meanApiService.getSwapOptions(
      from.address,
      to.address,
      sellAmount,
      buyAmount,
      sorting,
      transferTo
    );

    const filteredOptions: RawSwapOption[] = swapOptionsResponse.quotes.filter(
      (option) => !('failed' in option)
    ) as RawSwapOption[];

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
        swapper: { allowanceTarget, address, id, logoURI },
        type,
        tx,
      }) => ({
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
          logoURI,
        },
        type,
        tx,
      })
    );
  }
}

/* eslint-enable no-await-in-loop */
