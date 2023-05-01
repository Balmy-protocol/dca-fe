import { DestinationCallDataParams } from '@connext/chain-abstraction/dist/types';

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
