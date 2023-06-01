import { getPoolFeeForUniV3, getXCallCallData, prepareSwapAndXCall } from '@connext/chain-abstraction';
import { DestinationCallDataParams, Swapper, SwapAndXCallParams } from '@connext/chain-abstraction/dist/types';
import { SdkConfig, create } from '@connext/sdk';
import { NETWORKS, SUPPORTED_CHAINS_BY_CONNEXT } from '@constants';
import { find } from 'lodash';
import WalletService from './walletService';

interface DomainID {
  [key: number]: string;
}

export default class ConnextService {
  walletService: WalletService;

  sdkConfig: SdkConfig;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
  }

  sdkInit() {
    const domainConfig: { [domainId: string]: { providers: string[] } } = {};

    const domainChainIds = Object.entries(SUPPORTED_CHAINS_BY_CONNEXT)
      .filter(([key]) => typeof key === 'number')
      .map(([key, value]) => ({ domainId: value.domainId, chainId: key }));

    domainChainIds.forEach((obj) => {
      domainConfig[obj.domainId] = { providers: [this.getRPCURL(parseInt(obj.chainId, 10))] };
    });

    const sdkConfig: SdkConfig = {
      signerAddress: this.walletService.getAccount(),
      network: 'mainnet', // can change it to testnet as well
      chains: domainConfig,
    };
    this.sdkConfig = sdkConfig;
    return sdkConfig;
  }

  getRPCURL(chainID: number) {
    const network = find(NETWORKS, { chainId: chainID });
    if (network) {
      return network.rpc[0];
    }
    throw Error('Network not supported');
  }

  async getCalculatedRelayerFees(originDomain: string, destinationDomain: string) {
    const { sdkBase } = await create(this.sdkConfig);
    const relayerFees = await sdkBase.estimateRelayerFee({
      originDomain,
      destinationDomain,
      isHighPriority: true,
    });
    return relayerFees.toString();
  }

  async getPoolFeeForUniV3Helper(domainID: string, token0: string, token1: string, rpcURL: string) {
    try {
      const poolFee = await getPoolFeeForUniV3(domainID, rpcURL, token0, token1);
      return poolFee;
    } catch (err) {
      throw Error('Failed to fetch Pool Fees');
    }
  }

  async getXCallCallDataHelper(domainID: string, forwardCallData: string, params: DestinationCallDataParams) {
    const swapper = Swapper.UniV3;
    return getXCallCallData(domainID, swapper, forwardCallData, params);
  }

  async prepareSwapAndXCallHelper(swapAndXCallParams: SwapAndXCallParams, signerAddress: string) {
    return prepareSwapAndXCall(swapAndXCallParams, signerAddress);
  }

  async getEstimateAmountReceived(
    originDomain: string,
    destinationDomain: string,
    originToken: string,
    amount: number
  ) {
    const { sdkBase } = await create(this.sdkConfig);
    const estimateReceived = await sdkBase.calculateAmountReceived(
      originDomain,
      destinationDomain,
      originToken,
      amount
    );
    return estimateReceived;
  }

  getNativeUSDCAddress(networkName: number) {
    const USDC_ADDRESS: DomainID = {
      1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      137: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      42161: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      100: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
      56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    };
    return USDC_ADDRESS[networkName];
  }

  async getTransferStatus(transactionHash: string) {
    try {
      const { sdkUtils } = await create(this.sdkConfig);
      const params: { transactionHash: string } = {
        transactionHash,
      };
      const transferStatus = await sdkUtils.getTransfers(params);
      if (!transferStatus) {
        throw Error('Failed to fetch transfer status');
      }
      return transferStatus;
    } catch (err) {
      throw Error(err);
    }
  }
}
