import { ethers } from 'ethers';

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
  const fromAssetOrigin =
    fromAsset === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ? ethers.constants.AddressZero : fromAsset;
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
