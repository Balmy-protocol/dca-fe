import { BigNumber, ethers } from 'ethers';
import find from 'lodash/find';
import {
  AUTOMATIC_CHAIN_CHANGING_WALLETS,
  NETWORKS,
  LATEST_VERSION,
  DEFAULT_NETWORK_FOR_VERSION,
  CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH,
} from '@constants';
import { TransactionRequestWithFrom } from '@types';
import { getNetwork as getStringNetwork, Provider, Network } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import { getProviderInfo } from '@common/utils/provider-info';
import AccountService from './accountService';
import { timeoutPromise } from '@mean-finance/sdk';

interface ProviderWithChainId extends Provider {
  chainId: string;
}

export default class ProviderService {
  accountService: AccountService;

  providerInfo: { id: string; logo: string; name: string };

  constructor(accountService: AccountService) {
    this.accountService = accountService;
  }

  setProviderInfo(provider: Provider, privyWallet?: boolean) {
    this.providerInfo = getProviderInfo(provider, privyWallet);

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

  async estimateGas(tx: TransactionRequestWithFrom): Promise<BigNumber> {
    const signer = await this.accountService.getWalletSigner(tx.from);

    return signer.estimateGas(tx);
  }

  async sendTransaction(transactionToSend: TransactionRequestWithFrom) {
    const signer = await this.accountService.getWalletSigner(transactionToSend.from);

    return signer.sendTransaction(transactionToSend);
  }

  async getSigner(address?: string) {
    if (!address) {
      const activeWalletSigner = await this.accountService.getActiveWalletSigner();

      if (!activeWalletSigner) {
        throw new Error('No active wallet');
      }

      return activeWalletSigner;
    }

    return this.accountService.getWalletSigner(address);
  }

  async sendTransactionWithGasLimit(tx: TransactionRequestWithFrom) {
    const gasUsed = await this.estimateGas(tx);

    const transactionToSend = {
      ...tx,
      gasLimit: gasUsed.mul(BigNumber.from(130)).div(BigNumber.from(100)), // 30% more
    };

    const signer = await this.accountService.getWalletSigner(tx.from);

    return signer.sendTransaction(transactionToSend);
  }

  async getBalance(address: string) {
    const provider = await this.accountService.getWalletProvider(address);

    return provider.getBalance(address);
  }

  getProviderInfo() {
    return this.providerInfo;
  }

  async getNetwork() {
    try {
      const provider = await this.getProvider();
      let network;
      if (provider?.getNetwork) {
        network = await timeoutPromise(provider?.getNetwork(), '1s');

        return network;
      }

      if ((provider as ProviderWithChainId)?.chainId) {
        network = await Promise.resolve({
          chainId: parseInt((provider as ProviderWithChainId)?.chainId, 16),
          defaultProvider: true,
        });

        return network;
      }
    } catch {}

    return Promise.resolve(DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION]);
  }

  async getProvider(network?: Network) {
    const activeWalletProvider = await this.accountService.getActiveWalletProvider();

    if (activeWalletProvider) {
      return activeWalletProvider;
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

  async getGasPrice() {
    const provider = await this.getProvider();

    return provider.getGasPrice();
  }

  async getTransactionReceipt(txHash: string) {
    const provider = await this.accountService.getActiveWalletProvider();
    return provider?.getTransactionReceipt(txHash);
  }

  async getTransaction(txHash: string) {
    const provider = await this.accountService.getActiveWalletProvider();
    return provider?.getTransaction(txHash);
  }

  async waitForTransaction(txHash: string) {
    const provider = await this.accountService.getActiveWalletProvider();
    return provider?.waitForTransaction(txHash);
  }

  async getBlockNumber() {
    const provider = await this.accountService.getActiveWalletProvider();
    return provider?.getBlockNumber();
  }

  async on(eventName: ethers.providers.EventType, listener: ethers.providers.Listener) {
    const provider = await this.accountService.getActiveWalletProvider();

    provider?.on(eventName, listener);
  }

  async off(eventName: ethers.providers.EventType) {
    const provider = await this.accountService.getActiveWalletProvider();

    return provider?.off(eventName);
  }

  handleAccountChange() {
    window.location.reload();
  }

  handleChainChanged(newChainId: string) {
    const providerInfo = this.getProviderInfo();

    if (window.location.pathname === '/' || window.location.pathname.startsWith('/create')) {
      window.history.pushState({}, '', `/create/${parseInt(newChainId, 16)}`);
    }

    if (!CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH.includes(providerInfo.name)) {
      window.location.reload();
    }
  }

  async addEventListeners() {
    const provider = await this.getProvider();
    const providerInfo = this.getProviderInfo();

    try {
      if (provider) {
        // ff's fuck metamask
        if (providerInfo && providerInfo.name === 'MetaMask' && window.ethereum && window.ethereum.on) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          window.ethereum.on('accountsChanged', () => this.handleAccountChange());

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          window.ethereum.on('chainChanged', (newChainId: string) => this.handleChainChanged(newChainId));
        }
        // handle metamask account change
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        provider.on('accountsChanged', () => this.handleAccountChange());

        // extremely recommended by metamask
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        provider.on('chainChanged', (newChainId: string) => this.handleChainChanged(newChainId));
      }
    } catch (e) {
      console.error('Avoidable error when initializing metamask events', e);
    }
  }

  async addNetwork(newChainId: number, callbackBeforeReload?: () => void) {
    const providerInfo = this.getProviderInfo();

    try {
      const provider = await this.accountService.getActiveWalletProvider();
      const network = find(NETWORKS, { chainId: newChainId });

      if (network) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await provider?.send('wallet_addEthereumChain', [
          {
            chainId: `0x${newChainId.toString(16)}`,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            rpcUrls: network.rpc,
          },
        ]);
        await provider?.send('wallet_switchEthereumChain', [{ chainId: `0x${newChainId.toString(16)}` }]);
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
      const provider = await this.accountService.getActiveWalletProvider();
      const response: { code?: number; message?: string } | null = (await provider?.send('wallet_switchEthereumChain', [
        { chainId: `0x${newChainId.toString(16)}` },
      ])) as { code?: number; message?: string } | null;

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

    console.log(providerInfo);
    if (AUTOMATIC_CHAIN_CHANGING_WALLETS.includes(providerInfo.name) || forceChangeNetwork) {
      return this.changeNetwork(newChainId, callbackBeforeReload);
    }

    return Promise.resolve();
  }
}
