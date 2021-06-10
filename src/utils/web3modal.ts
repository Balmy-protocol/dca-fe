import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Authereum from 'authereum';
import Torus from '@toruslabs/torus-embed';

export async function setUpWeb3Modal() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: '5744aff1d49f4eee923c5f3e5af4cc1c', // required
      },
    },
    authereum: {
      package: Authereum, // required
    },
    torus: {
      package: Torus, // required
    },
  };

  const web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: false, // optional
    providerOptions, // required
  });

  web3Modal.clearCachedProvider();

  const provider = await web3Modal.connect();

  // const web3 = new Web3(provider);
  // web3Modal.toggleModal();
}
