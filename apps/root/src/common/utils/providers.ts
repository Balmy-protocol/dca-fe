import { WalletClient } from 'viem';

export const getSignerChainId = async (signer: WalletClient) => {
  let signerChain = signer.chain?.id;
  if (!signerChain && signer.getChainId) {
    try {
      signerChain = await signer.getChainId();
    } catch (e) {
      console.error('getChainId does not exist on the signer', e);
    }
  }

  return signerChain;
};
