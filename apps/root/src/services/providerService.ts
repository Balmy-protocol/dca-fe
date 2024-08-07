import find from 'lodash/find';
import {
  NON_AUTOMATIC_CHAIN_CHANGING_WALLETS,
  NETWORKS,
  LATEST_VERSION,
  DEFAULT_NETWORK_FOR_VERSION,
  CHAIN_CHANGING_WALLETS_WITH_REFRESH,
} from '@constants';
import { Address, PublicClient, WalletClient } from 'viem';
import { SubmittedTransaction, Token, TransactionRequestWithChain, WalletStatus } from '@types';
import AccountService from './accountService';
import SdkService from './sdkService';
import { viemTransactionTypeToSdkStype } from '@common/utils/wagmi';

export default class ProviderService {
  accountService: AccountService;

  sdkService: SdkService;

  chainChangedCallback: ((network: number) => void) | undefined;

  constructor(accountService: AccountService, sdkService: SdkService) {
    this.accountService = accountService;
    this.sdkService = sdkService;
  }

  setChainChangedCallback(chainChangedCallback?: (network: number) => void) {
    this.chainChangedCallback = chainChangedCallback;
  }

  async estimateGas(tx: TransactionRequestWithChain): Promise<bigint> {
    return this.sdkService.sdk.gasService.estimateGas({
      chainId: tx.chainId,
      tx: { ...tx, to: tx.to || undefined, type: viemTransactionTypeToSdkStype(tx) },
    });
  }

  async sendTransaction(transactionToSend: TransactionRequestWithChain): Promise<SubmittedTransaction> {
    const signer = this.accountService.getWalletSigner(transactionToSend.from);
    const hash = await signer.sendTransaction({ ...transactionToSend, account: transactionToSend.from, chain: null });
    return {
      hash,
      from: transactionToSend.from,
      chainId: transactionToSend.chainId,
    };
  }

  getBaseWalletSigner(address?: string) {
    if (!address) {
      return this.accountService.getActiveWalletSigner();
    } else {
      return this.accountService.getWalletSigner(address);
    }
  }

  async getSigner(address?: string, chainId?: number) {
    if (!this.accountService.getUser()) return undefined;
    let signer = this.getBaseWalletSigner(address);

    if (!signer) {
      throw new Error('No signer found');
    }

    if (chainId) {
      let signerChain = signer.chain?.id;
      if (!signerChain && signer.getChainId) {
        try {
          signerChain = await signer.getChainId();
        } catch (e) {
          console.error('getChainId does not exist on the signer', e);
        }
      }

      if (signerChain !== chainId) {
        await this.changeNetwork(chainId, undefined, signer);
        signer = this.getBaseWalletSigner(address);
      }
    }

    return signer;
  }

  async sendTransactionWithGasLimit(tx: TransactionRequestWithChain): Promise<SubmittedTransaction> {
    const gasUsed = await this.estimateGas(tx);

    const transactionToSend = {
      ...tx,
      gasLimit: (gasUsed * 130n) / 100n, // 30% more
    };
    const signer = await this.getSigner(tx.from, tx.chainId);

    if (!signer) {
      throw new Error('No signer found');
    }

    const hash = await signer.sendTransaction({ ...transactionToSend, account: transactionToSend.from, chain: null });
    return {
      hash,
      from: transactionToSend.from,
      chainId: tx.chainId,
    };
  }

  async getBalance(address: Address, chainId: number) {
    const provider = this.getProvider(chainId);

    return provider.getBalance({ address });
  }

  async getNetwork(address?: string) {
    const signer = await this.getSigner(address);
    if (signer) {
      const chainId = await signer?.getChainId();
      const foundNetwork = find(NETWORKS, { chainId: chainId });

      return foundNetwork!;
    }

    return Promise.resolve(DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION]);
  }

  getProvider(chainId: number) {
    return this.sdkService.sdk.providerService.getViemPublicClient({ chainId }) as PublicClient;
  }

  async getGasPrice(chainId: number) {
    const provider = this.getProvider(chainId);

    return provider.getGasPrice();
  }

  async getGasCost(tx: TransactionRequestWithChain) {
    const gasEstimation = await this.sdkService.sdk.gasService.estimateGas({
      chainId: tx.chainId,
      tx: {
        ...tx,
        type: viemTransactionTypeToSdkStype(tx),
      },
    });

    return this.sdkService.sdk.gasService.calculateGasCost({
      chainId: tx.chainId,
      gasEstimation,
      tx: {
        ...tx,
        type: viemTransactionTypeToSdkStype(tx),
      },
    });
  }

  async getTransactionReceipt(txHash: Address, chainId: number) {
    const provider = this.getProvider(chainId);
    return provider?.getTransactionReceipt({ hash: txHash });
  }

  async getTransaction(txHash: Address, chainId: number) {
    const provider = this.getProvider(chainId);
    return provider?.getTransaction({ hash: txHash });
  }

  waitForTransaction(txHash: Address, chainId: number) {
    const provider = this.getProvider(chainId);
    return provider.waitForTransactionReceipt({ hash: txHash });
  }

  async getBlockNumber(chainId: number) {
    const provider = this.getProvider(chainId);
    return provider?.getBlockNumber();
  }

  onBlock(chainId: number, listener: (block: bigint) => void) {
    const provider = this.getProvider(chainId);

    return provider.watchBlocks({
      onBlock: (block) => listener(block.number),
    });
  }

  handleAccountChange() {
    window.location.reload();
  }

  handleChainChanged(newChainId: number) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const providerInfo = this.accountService.getActiveWallet()?.providerInfo!;

    if (this.chainChangedCallback) {
      this.chainChangedCallback(newChainId);
    }

    if (window.location.pathname.startsWith('/create')) {
      window.history.pushState({}, '', `/create/${newChainId}`);
    }

    if (CHAIN_CHANGING_WALLETS_WITH_REFRESH.includes(providerInfo.name)) {
      window.location.reload();
    }
  }

  async addNetwork(newChainId: number, callbackBeforeReload?: () => void) {
    try {
      const signer = await this.getSigner();

      if (!signer) {
        throw new Error('No signer found');
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      const providerInfo = this.accountService.getActiveWallet()?.providerInfo!;

      const network = find(NETWORKS, { chainId: newChainId });

      if (network) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await signer.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${newChainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency as Token,
              rpcUrls: network.rpc,
            },
          ],
        });
        await signer.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${newChainId.toString(16)}` }],
        });
        if (callbackBeforeReload) {
          callbackBeforeReload();
        }
        if (CHAIN_CHANGING_WALLETS_WITH_REFRESH.includes(providerInfo.name)) {
          window.location.reload();
        }
      }
    } catch (addError) {
      console.error('Error adding new chain to metamask');
    }
  }

  async changeNetwork(newChainId: number, callbackBeforeReload?: () => void, providedProvider?: WalletClient) {
    try {
      const signer = providedProvider || this.accountService.getActiveWalletSigner();

      if (!signer) {
        throw new Error('No signer found');
      }
      const [walletAddress] = await signer.getAddresses();
      const wallet = this.accountService.getWallet(walletAddress);

      if (wallet.status !== WalletStatus.connected) {
        return;
      }

      const providerInfo = wallet.providerInfo;

      const response: { code?: number; message?: string } | null = await signer.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${newChainId.toString(16)}` }],
      });

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

      if (providerInfo && CHAIN_CHANGING_WALLETS_WITH_REFRESH.includes(providerInfo.name)) {
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
    address?: string,
    callbackBeforeReload?: () => void,
    forceChangeNetwork?: boolean
  ) {
    const signer = this.getBaseWalletSigner(address);

    if (!signer) {
      return;
    }

    let wallet;
    if (address) {
      wallet = this.accountService.getWallet(address);
    } else {
      wallet = this.accountService.getActiveWallet();
    }

    const providerInfo = wallet?.providerInfo;

    if ((providerInfo && !NON_AUTOMATIC_CHAIN_CHANGING_WALLETS.includes(providerInfo.name)) || forceChangeNetwork) {
      return this.changeNetwork(newChainId, callbackBeforeReload, signer);
    }

    return Promise.resolve();
  }
}
