/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return */
const ConnectToInjected = async () => {
  let provider = null;
  if (typeof window.ethereum !== 'undefined') {
    provider = window.ethereum;
    try {
      await provider.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      throw new Error('User Rejected');
    }
  } else if (window.web3) {
    provider = window.web3.currentProvider;
  } else {
    throw new Error('No Web3 Provider found');
  }
  return provider;
};

export default ConnectToInjected;
/* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return */
