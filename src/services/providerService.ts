import { BigNumber, ethers, Signer } from 'ethers';
import find from 'lodash/find';
import {
  AUTOMATIC_CHAIN_CHANGING_WALLETS,
  NETWORKS,
  LATEST_VERSION,
  DEFAULT_NETWORK_FOR_VERSION,
  CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH,
} from 'config';
import { getNetwork as getStringNetwork, Provider, Network, TransactionRequest } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import { getProviderInfo } from 'web3modal';

interface ProviderWithChainId extends Provider {
  chainId: string;
}

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

  setProviderInfo(provider: Provider) {
    this.providerInfo = getProviderInfo(provider);

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (this.providerInfo.id === 'walletconnect' && provider.connector && provider.connector.peerMeta) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        this.providerInfo.name = provider.connector.peerMeta.name;
      }
    } catch {
      console.error('Failed to set providerInfo name for wc');
    }
  }

  async estimateGas(tx: TransactionRequest): Promise<BigNumber> {
    return this.signer.estimateGas(tx);
  }

  sendTransaction(transactionToSend: TransactionRequest) {
    return this.signer.sendTransaction(transactionToSend);
  }

  async sendTransactionWithGasLimit(tx: TransactionRequest) {
    const gasUsed = await this.estimateGas(tx);

    const transactionToSend = {
      ...tx,
      gasLimit: gasUsed.mul(BigNumber.from(130)).div(BigNumber.from(100)), // 30% more
    };

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
      return provider?.getNetwork();
    }

    if ((provider as ProviderWithChainId)?.chainId) {
      return Promise.resolve({
        chainId: parseInt((provider as ProviderWithChainId)?.chainId, 16),
        defaultProvider: true,
      });
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

  getIsConnected() {
    return !!this.provider;
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

  getTransactionReceipt(txHash: string) {
    return this.provider.getTransactionReceipt(txHash);
  }

  getTransaction(txHash: string) {
    return this.provider.getTransaction(txHash);
  }

  waitForTransaction(txHash: string) {
    return this.provider.waitForTransaction(txHash);
  }

  getBlockNumber() {
    return this.provider.getBlockNumber();
  }

  on(eventName: ethers.providers.EventType, listener: ethers.providers.Listener) {
    this.provider.on(eventName, listener);
  }

  off(eventName: ethers.providers.EventType) {
    return this.provider.off(eventName);
  }

  async addEventListeners() {
    const provider = await this.getBaseProvider();
    const providerInfo = this.getProviderInfo();

    try {
      if (provider) {
        // ff's fuck metamask
        if (providerInfo && providerInfo.name === 'MetaMask' && window.ethereum && window.ethereum.on) {
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

          if (!CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH.includes(providerInfo.name)) {
            window.location.reload();
          }
        });
      }
    } catch (e) {
      console.error('Avoidable error when initializing metamask events', e);
    }
  }

  async addNetwork(newChainId: number, callbackBeforeReload?: () => void) {
    const providerInfo = this.getProviderInfo();

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
        if (!CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH.includes(providerInfo.name)) {
          window.location.reload();
        }
      }
    } catch (addError) {
      console.error('Error adding new chain to metamask');
    }
  }

  async changeNetwork(newChainId: number, callbackBeforeReload?: () => void) {
    const providerInfo = this.getProviderInfo();

    try {
      const response: { code?: number; message?: string } | null = (await this.provider.send(
        'wallet_switchEthereumChain',
        [{ chainId: `0x${newChainId.toString(16)}` }]
      )) as { code?: number; message?: string } | null;

      if (
        response &&
        ((response.code && response.code === 4902) || (response.message && response.message === 'Chain does not exist'))
      ) {
        await this.addNetwork(newChainId, callbackBeforeReload);
        return;
      }

      if (callbackBeforeReload) {
        callbackBeforeReload();
      }

      if (!CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH.includes(providerInfo.name)) {
        window.location.reload();
      }
    } catch (switchError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (switchError.code === 4902 || switchError.message === 'Chain does not exist') {
        await this.addNetwork(newChainId, callbackBeforeReload);
      }
    }
  }

  async attempToAutomaticallyChangeNetwork(
    newChainId: number,
    callbackBeforeReload?: () => void,
    forceChangeNetwork?: boolean
  ) {
    const providerInfo = this.getProviderInfo();

    if (AUTOMATIC_CHAIN_CHANGING_WALLETS.includes(providerInfo.name) || forceChangeNetwork) {
      return this.changeNetwork(newChainId, callbackBeforeReload);
    }

    return Promise.resolve();
  }
}
