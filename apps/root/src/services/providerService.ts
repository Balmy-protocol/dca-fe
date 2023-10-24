import { BigNumber, ethers } from 'ethers';
import find from 'lodash/find';
import {
  AUTOMATIC_CHAIN_CHANGING_WALLETS,
  NETWORKS,
  LATEST_VERSION,
  DEFAULT_NETWORK_FOR_VERSION,
  CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH,
} from '@constants';
import { TransactionRequestWithFrom, WalletStatus } from '@types';
import { getNetwork as getStringNetwork, Provider, Network, Web3Provider } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import AccountService from './accountService';
import { timeoutPromise } from '@mean-finance/sdk';

interface ProviderWithChainId extends Provider {
  chainId: string;
}

export default class ProviderService {
  accountService: AccountService;

  constructor(accountService: AccountService) {
    this.accountService = accountService;
  }

  async estimateGas(tx: TransactionRequestWithFrom): Promise<BigNumber> {
    const signer = await this.accountService.getWalletSigner(tx.from);

    return signer.estimateGas(tx);
  }

  async sendTransaction(transactionToSend: TransactionRequestWithFrom) {
    const signer = await this.accountService.getWalletSigner(transactionToSend.from);

    return signer.sendTransaction(transactionToSend);
  }

  async getWalletProvider(address?: string) {
    let provider: Web3Provider | undefined;
    if (!address) {
      provider = await this.accountService.getActiveWalletProvider();

      if (!provider) {
        throw new Error('No active wallet');
      }
    } else {
      provider = await this.accountService.getWalletProvider(address);

      if (!provider) {
        throw new Error('No wallet provider found');
      }
    }

    return provider;
  }

  async getSigner(address?: string, chainId?: number) {
    let provider = await this.getWalletProvider(address);

    if (chainId && provider.network.chainId !== chainId) {
      await this.changeNetwork(chainId, undefined, provider);
      provider = await this.getWalletProvider(address);
    }

    return provider.getSigner();
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

  async getNetwork() {
    try {
      const provider = await this.getProvider();
      let network;
      if (provider?.getNetwork) {
        network = await timeoutPromise(provider?.getNetwork(), '1s');

        if (network) {
          return network;
        }
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

  async handleChainChanged(newChainId: string) {
    const provider = await this.getProvider();

    if (!provider) {
      throw new Error('no provider found');
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const providerInfo = this.accountService.getActiveWallet()?.providerInfo!;

    if (window.location.pathname === '/' || window.location.pathname.startsWith('/create')) {
      window.history.pushState({}, '', `/create/${parseInt(newChainId, 16)}`);
    }

    if (!CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH.includes(providerInfo.name)) {
      window.location.reload();
    }
  }

  async addEventListeners() {
    const provider = await this.getProvider();
    const providerInfo = this.accountService.getActiveWallet()?.providerInfo;

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
    try {
      const provider = await this.accountService.getActiveWalletProvider();

      if (!provider) {
        throw new Error('No provider found');
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      const providerInfo = this.accountService.getActiveWallet()?.providerInfo!;

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

        await provider.getNetwork();
      }
    } catch (addError) {
      console.error('Error adding new chain to metamask');
    }
  }

  async changeNetwork(newChainId: number, callbackBeforeReload?: () => void, providedProvider?: Web3Provider) {
    try {
      const provider = providedProvider || (await this.accountService.getActiveWalletProvider());

      if (!provider) {
        throw new Error('No provider found');
      }
      const walletAddress = await provider.getSigner().getAddress();
      const wallet = this.accountService.getWallet(walletAddress);

      if (wallet.status !== WalletStatus.connected) {
        return;
      }

      const providerInfo = wallet.providerInfo;

      await wallet.switchChain(newChainId);
      // const response: { code?: number; message?: string } | null = (await provider?.send('wallet_switchEthereumChain', [
      //   { chainId: `0x${newChainId.toString(16)}` },
      // ])) as { code?: number; message?: string } | null;

      // if (
      //   response &&
      //   ((response.code && response.code === 4902) || (response.message && response.message === 'Chain does not exist'))
      // ) {
      //   await this.addNetwork(newChainId, callbackBeforeReload);
      //   return;
      // }

      if (callbackBeforeReload) {
        callbackBeforeReload();
      }

      if (providerInfo && !CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH.includes(providerInfo.name)) {
        window.location.reload();
      }

      await provider.getNetwork();
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
    const provider = await this.accountService.getActiveWalletProvider();
    if (!provider) {
      return;
    }

    const walletAddress = await provider.getSigner().getAddress();
    const providerInfo = this.accountService.getWallet(walletAddress).providerInfo;

    if ((providerInfo && AUTOMATIC_CHAIN_CHANGING_WALLETS.includes(providerInfo.name)) || forceChangeNetwork) {
      return this.changeNetwork(newChainId, callbackBeforeReload);
    }

    return Promise.resolve();
  }
}
