import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';
import Authereum from 'authereum';
import Torus from '@toruslabs/torus-embed';
import type { setWeb3WalletState, web3ModalState, web3WalletState, setAccountState } from 'common/wallet-context';

export async function setUpWeb3Modal(setWeb3Wallet: setWeb3WalletState, setAccount: setAccountState) {
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
    cacheProvider: true, // optional
    providerOptions, // required
  });

  if (web3Modal.cachedProvider) {
    await connecToWallet(setWeb3Wallet, web3Modal, setAccount);
  }

  return web3Modal;
}

export async function connecToWallet(
  setWeb3Wallet: setWeb3WalletState,
  web3Modal: web3ModalState,
  setAccount: setAccountState
) {
  const provider = await web3Modal?.connect();

  const web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();

  if (window.ethereum && window.ethereum.isMetamask) {
    // handle metamask account change
    window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
      setAccount(newAccounts[0]);
    });

    // window.ethereum.on('chainChanged', () => {
    //   // Handle the new chain.
    //   // Correctly handling chain changes can be complicated.
    //   // We recommend reloading the page unless you have good reason not to.
    //   window.location.reload();
    // });

    // extremely recommended by metamask
    window.ethereum.on('chainChanged', () => window.location.reload());
  }

  setAccount(accounts[0]);
  setWeb3Wallet(web3);
}

export async function disconnecWallet(
  web3Wallet: any,
  web3Modal: web3ModalState,
  setWeb3Wallet: setWeb3WalletState,
  setAccount: setAccountState
) {
  if (web3Wallet && web3Wallet.currentProvider && web3Wallet.currentProvider.close) {
    await web3Wallet.currentProvider.close();
  }

  await web3Modal?.clearCachedProvider();

  setAccount('');
  setWeb3Wallet(null);
}
