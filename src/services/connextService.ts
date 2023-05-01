import { getPoolFeeForUniV3, getXCallCallData, prepareSwapAndXCall } from '@connext/chain-abstraction';
import { DestinationCallDataParams, Swapper, SwapAndXCallParams } from '@connext/chain-abstraction/dist/types';
import { SdkConfig, create } from '@connext/sdk';

type Networks = {
  [key: string]: string;
  mainnet: string;
  polygon: string;
  optimism: string;
  arbitrum: string;
  gnosis: string;
  bsc: string;
};

export default class ConnextService {
  sdkConfig: SdkConfig;

  originDomain: string;

  destinationDomain: string;

  originrpcURL: string;

  destinationRpcURL: string;

  signerAdress: string;

  constructor(
    signerAddress: string | null,
    originDomain: string,
    originrpcURL: string,
    destinationDomain: string,
    destinantionRpcURL: string
  ) {
    this.originDomain = originDomain;
    this.destinationDomain = destinationDomain;
    this.originrpcURL = originrpcURL;
    this.destinationRpcURL = destinantionRpcURL;
    this.signerAdress = signerAddress as string;
  }

  async getCalculatedRelayerFees() {
    this.sdkConfig = {
      signerAddress: this.signerAdress,
      network: 'testnet',
      chains: {
        [this.originDomain]: {
          // dummy domain ID for testnets,
          providers: [this.originrpcURL],
        },
        [this.destinationDomain]: {
          // dummy domain ID for testnets
          providers: [this.destinationRpcURL],
        },
      },
    };
    const { sdkBase } = await create(this.sdkConfig);
    const { originDomain, destinationDomain } = this;
    const relayerFees = await sdkBase.estimateRelayerFee({
      originDomain,
      destinationDomain,
    });
    return relayerFees.toString();
  }

  async getPoolFeeForUniV3Helper(domainID: string, token0: string, token1: string, rpcURL: string) {
    if (!rpcURL || !token0 || !token1) {
      return null;
    }
    const poolFee = await getPoolFeeForUniV3(domainID, rpcURL, token0, token1);
    return poolFee;
  }

  async getXCallCallDataHelper(domainID: string, forwardCallData: string, params: DestinationCallDataParams) {
    const swapper = Swapper.UniV3;
    const callDataForMeantTarget = await getXCallCallData(domainID, swapper, forwardCallData, params);
    return callDataForMeantTarget;
  }

  async prepareSwapAndXCallHelper(swapAndXCallParams: SwapAndXCallParams, signerAddress: string) {
    const txRequest = await prepareSwapAndXCall(swapAndXCallParams, signerAddress);
    return txRequest;
  }

  getDomainID(networkName: string): string {
    const domainID: Networks = {
      mainnet: '6648936',
      polygon: '1886350457',
      optimism: '1869640809',
      arbitrum: '1634886255',
      gnosis: '6778479',
      bsc: '6450786',
    };

    return domainID[networkName];
  }

  getNativeUSDCAddress(networkName: string) {
    const USDC_ADDRESS: Networks = {
      mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      polygon: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      optimism: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      arbitrum: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      gnosis: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
      bsc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    };
    return USDC_ADDRESS[networkName];
  }
}
