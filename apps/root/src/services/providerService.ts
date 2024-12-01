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
import WalletClientsService from './walletClientsService';

export default class ProviderService {
  accountService: AccountService;

  sdkService: SdkService;

  chainChangedCallback: ((network: number) => void) | undefined;

  walletClientService: WalletClientsService;

  constructor(accountService: AccountService, sdkService: SdkService, walletClientService: WalletClientsService) {
    this.accountService = accountService;
    this.sdkService = sdkService;
    this.walletClientService = walletClientService;
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
    const signer = await this.getSigner(transactionToSend.from, transactionToSend.chainId);
    if (!signer) {
      throw new Error('Provider Service: No signer found');
    }
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
    let signer = await this.getBaseWalletSigner(address);

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
        signer = await this.getBaseWalletSigner(address);
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

  async getBlockTimestamp(chainId: number, blockNumber: bigint) {
    const provider = this.getProvider(chainId);
    const blockOne = await provider.getBlock({
      blockNumber,
    });
    return Number(blockOne.timestamp);
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

  async addNetwork(newChainId: number, callbackBeforeReload?: () => void) {
    try {
      const signer = await this.getSigner();

      if (!signer) {
        throw new Error('No signer found');
      }

      const providerInfo = this.walletClientService.getProviderInfo(signer.account?.address || '0x0');

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
        if (providerInfo?.name && CHAIN_CHANGING_WALLETS_WITH_REFRESH.includes(providerInfo.name)) {
          window.location.reload();
        }
      }
    } catch (addError) {
      console.error('Error adding new chain to metamask');
    }
  }

  async changeNetwork(newChainId: number, callbackBeforeReload?: () => void, providedProvider?: WalletClient) {
    try {
      const signer = providedProvider || (await this.accountService.getActiveWalletSigner());

      if (!signer) {
        throw new Error('No signer found');
      }
      const [walletAddress] = await signer.getAddresses();
      const wallet = this.accountService.getWallet(walletAddress);

      if (wallet.status !== WalletStatus.connected) {
        return;
      }

      const providerInfo = this.walletClientService.getProviderInfo(walletAddress);

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
    const signer = await this.getBaseWalletSigner(address);

    if (!signer) {
      return;
    }

    let wallet;
    if (address) {
      wallet = this.accountService.getWallet(address);
    } else {
      wallet = this.accountService.getActiveWallet();
    }

    const providerInfo = this.walletClientService.getProviderInfo((address as Address) || wallet?.address || '0x0');

    if ((providerInfo && !NON_AUTOMATIC_CHAIN_CHANGING_WALLETS.includes(providerInfo.name)) || forceChangeNetwork) {
      return this.changeNetwork(newChainId, callbackBeforeReload, signer);
    }

    return Promise.resolve();
  }
}
