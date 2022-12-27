import { BigNumber, ethers, Signer } from 'ethers';
import find from 'lodash/find';
import { NETWORKS, LATEST_VERSION, DEFAULT_NETWORK_FOR_VERSION } from 'config/constants';
import { getNetwork as getStringNetwork, Provider, Network, TransactionRequest } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';

export default class ProviderService {
  provider: ethers.providers.Web3Provider;

  signer: Signer;

  providerInfo: { id: string; logo: string; name: string };

  constructor(provider?: ethers.providers.Web3Provider) {
    if (provider) {
      this.provider = provider;
    }
  }

  setProvider(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
  }

  setSigner(signer: Signer) {
    this.signer = signer;
  }

  setProviderInfo(providerInfo: { id: string; logo: string; name: string }) {
    this.providerInfo = providerInfo;
  }

  async estimateGas(tx: TransactionRequest): Promise<BigNumber> {
    return this.signer.estimateGas(tx);
  }

  sendTransaction(transactionToSend: TransactionRequest) {
    return this.signer.sendTransaction(transactionToSend);
  }

  getSigner() {
    return this.signer;
  }

  getAddress() {
    return this.signer.getAddress();
  }

  getBalance() {
    return this.signer.getBalance();
  }

  getProviderInfo() {
    return this.providerInfo;
  }

  async getNetwork() {
    const provider = await this.getBaseProvider();
    if (provider?.getNetwork) {
      return provider.getNetwork();
    }
    return Promise.resolve(DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION]);
  }

  getProvider(network?: Network) {
    if (this.signer) {
      return this.signer;
    }

    return this.getBaseProvider(network);
  }

  getGasPrice() {
    return this.provider.getGasPrice();
  }

  getBaseProvider(network?: Network) {
    if (this.provider) {
      return this.provider;
    }

    if (network) {
      try {
        return ethers.getDefaultProvider(getStringNetwork(network.name), {
          infura: 'd729b4ddc49d4ce88d4e23865cb74217',
          etherscan: '4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF',
        });
      } catch {
        return detectEthereumProvider() as Promise<Provider>;
      }
    } else {
      return detectEthereumProvider() as Promise<Provider>;
    }
  }

  async addEventListeners() {
    const provider = await this.getBaseProvider();
    const providerInfo = this.getProviderInfo();
    try {
      if (provider) {
        // ff's fuck metamask
        if (providerInfo.name === 'MetaMask') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          window.ethereum.on('accountsChanged', () => {
            window.location.reload();
          });

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          window.ethereum.on('chainChanged', (newChainId: string) => {
            if (window.location.pathname === '/' || window.location.pathname.startsWith('/create')) {
              window.history.pushState({}, '', `/create/${parseInt(newChainId, 16)}`);
            }

            window.location.reload();
          });
        }
        // handle metamask account change
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        provider.on('accountsChanged', () => {
          window.location.reload();
        });

        // extremely recommended by metamask
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        provider.on('chainChanged', (newChainId: string) => {
          if (window.location.pathname === '/' || window.location.pathname.startsWith('/create')) {
            window.history.pushState({}, '', `/create/${parseInt(newChainId, 16)}`);
          }

          window.location.reload();
        });
      }
    } catch (e) {
      console.error('Avoidable error when initializing metamask events', e);
    }
  }

  async changeNetwork(newChainId: number, callbackBeforeReload?: () => void) {
    try {
      await this.provider.send('wallet_switchEthereumChain', [{ chainId: `0x${newChainId.toString(16)}` }]);
      if (callbackBeforeReload) {
        callbackBeforeReload();
      }
      window.location.reload();
    } catch (switchError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (switchError.code === 4902 || switchError.message === 'Chain does not exist') {
        try {
          const network = find(NETWORKS, { chainId: newChainId });

          if (network) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await this.provider.send('wallet_addEthereumChain', [
              {
                chainId: `0x${newChainId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: network.rpc,
              },
            ]);
            await this.provider.send('wallet_switchEthereumChain', [{ chainId: `0x${newChainId.toString(16)}` }]);
            if (callbackBeforeReload) {
              callbackBeforeReload();
            }
            window.location.reload();
          }
        } catch (addError) {
          console.error('Error adding new chain to metamask');
        }
      }
    }
  }
}
