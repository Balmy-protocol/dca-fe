import { ethers } from 'ethers';
import { PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import { DestinationCallDataParams, Swapper, SwapAndXCallParams } from '@connext/chain-abstraction/dist/types';

interface Permissions {
  operator: string;
  permissions: number[];
}

export const getSwapAndXcallParams = (
  originDomain: string,
  destinationDomain: string,
  fromAsset: string,
  toAsset: string,
  amountIn: string,
  to: string, // mean target address.
  callData: string,
  relayerFeeInNativeAsset: string
) => {
  const fromAssetOrigin = fromAsset === PROTOCOL_TOKEN_ADDRESS ? ethers.constants.AddressZero : fromAsset;
  const swapAndXCallParams = {
    originDomain,
    destinationDomain,
    fromAsset: fromAssetOrigin, // BNB
    toAsset, // USDC
    amountIn: amountIn.toString(),
    to,
    relayerFeeInNativeAsset, // 0.001 BNB
    callData,
  };
  return swapAndXCallParams;
};

export const getForwardFunctionCallHelper = (
  from: string,
  to: string,
  amountOfSwaps: ethers.BigNumber,
  swapInterval: ethers.BigNumber,
  owner: string,
  permissions: Permissions[]
) => {
  const { defaultAbiCoder } = ethers.utils;
  const encodedData = defaultAbiCoder.encode(
    ['address', 'address', 'uint256', 'uint32', 'address', 'tuple(address operator,uint256[] permissions)[]'],
    [from, to, amountOfSwaps, swapInterval, owner, permissions]
  );
  return encodedData;
};

export const getDestinationCallDataParams = (signerAddress: string, token: string, poolFee: string) => {
  const params: DestinationCallDataParams = {
    fallback: signerAddress,
    swapForwarderData: {
      toAsset: token,
      swapData: {
        amountOutMin: '0',
        poolFee,
      },
    },
  };
  return params;
};
