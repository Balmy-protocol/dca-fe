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
  const swapAndXCallParams = {
    originDomain,
    destinationDomain,
    fromAsset, // BNB
    toAsset, // USDC
    amountIn: amountIn.toString(),
    to,
    relayerFeeInNativeAsset, // 0.001 BNB
    callData,
  };
  return swapAndXCallParams;
};
