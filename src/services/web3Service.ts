import { ethers, Signer } from 'ethers';
import { ExternalProvider, Provider, Network } from '@ethersproject/providers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Torus from '@toruslabs/torus-embed';
import find from 'lodash/find';
import { AxiosInstance } from 'axios';
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal';
import { ArcxAnalyticsSdk } from '@arcxmoney/analytics';
import { DUMMY_ARCX_CLIENT } from 'utils/dummy-arcx-client';

// MOCKS
import { NETWORKS, PositionVersions } from 'config/constants';

import { getProviderInfo } from 'web3modal';
import { setupAxiosClient } from 'state';
import GraphqlService from './graphql';
import injectedConnector from './InjectedConnector';
import ContractService from './contractService';
import TransactionService from './transactionService';
import PriceService from './priceService';
import PositionService from './positionService';
import PairService from './pairService';
import WalletService from './walletService';
import YieldService from './yieldService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';

const WALLET_CONNECT_KEY = 'walletconnect';

export default class Web3Service {
  client: ethers.providers.Web3Provider;

  modal: SafeAppWeb3Modal;

  signer: Signer;

  apolloClient: Record<PositionVersions, Record<number, GraphqlService>>;

  uniClient: Record<PositionVersions, Record<number, GraphqlService>>;

  network: Network;

  account: string;

  setAccountCallback: React.Dispatch<React.SetStateAction<string>>;

  axiosClient: AxiosInstance;

  providerInfo: { id: string; logo: string; name: string };

  loadedAsSafeApp: boolean;

  isConnected: boolean;

  contractService: ContractService;

  transactionService: TransactionService;

  priceService: PriceService;

  yieldService: YieldService;

  positionService: PositionService;

  pairService: PairService;

  walletService: WalletService;

  meanApiService: MeanApiService;

  arcxSdk: ArcxAnalyticsSdk;

  providerService: ProviderService;

  constructor(
    DCASubgraphs?: Record<PositionVersions, Record<number, GraphqlService>>,
    UNISubgraphs?: Record<PositionVersions, Record<number, GraphqlService>>,
    setAccountCallback?: React.Dispatch<React.SetStateAction<string>>,
    client?: ethers.providers.Web3Provider,
    modal?: SafeAppWeb3Modal
  ) {
    if (setAccountCallback) {
      this.setAccountCallback = setAccountCallback;
    }

    if (client) {
      this.client = client;
    }
    if (modal) {
      this.modal = modal;
    }
    if (DCASubgraphs) {
      this.apolloClient = DCASubgraphs;
    }
    if (UNISubgraphs) {
      this.uniClient = UNISubgraphs;
    }

    this.loadedAsSafeApp = false;

    this.axiosClient = setupAxiosClient();

    // initialize services
    this.providerService = new ProviderService(client);
    // this.contractService = new ContractService(this.providerService); //
    this.contractService = new ContractService(client); // pasar a this.provider en vez de client
    this.transactionService = new TransactionService(client);
    this.walletService = new WalletService(this.contractService, this.axiosClient, this.providerService);
    this.meanApiService = new MeanApiService(
      this.walletService,
      this.contractService,
      this.axiosClient,
      this.providerService,
      client
    );
    this.pairService = new PairService(
      this.walletService,
      this.contractService,
      this.meanApiService,
      this.providerService,
      this.apolloClient,
      this.uniClient
    );
    this.yieldService = new YieldService(this.walletService, this.axiosClient, client);
    this.positionService = new PositionService(
      this.walletService,
      this.pairService,
      this.contractService,
      this.meanApiService,
      this.apolloClient,
      this.providerService
    );
    this.priceService = new PriceService(this.walletService, this.contractService, this.axiosClient, client);
  }

  setArcxClient(newArcxClient: ArcxAnalyticsSdk) {
    this.arcxSdk = newArcxClient;
  }

  getArcxClient() {
    return this.arcxSdk || DUMMY_ARCX_CLIENT;
  }

  getContractService() {
    return this.contractService;
  }

  getMeanApiService() {
    return this.meanApiService;
  }

  getProviderInfo() {
    return this.providerInfo;
  }

  getTransactionService() {
    return this.transactionService;
  }

  getPositionService() {
    return this.positionService;
  }

  getWalletService() {
    return this.walletService;
  }

  getPriceService() {
    return this.priceService;
  }

  getYieldService() {
    return this.yieldService;
  }

  getPairService() {
    return this.pairService;
  }

  getModal() {
    return this.modal;
  }

  getUNIGraphqlClient() {
    return this.uniClient;
  }

  getDCAGraphqlClient() {
    return this.apolloClient;
  }

  // GETTERS AND SETTERS
  setClient(client: ethers.providers.Web3Provider) {
    this.client = client;

    // [TODO] Refactor so there is only one source of truth
    // set client for services
    this.contractService.setClient(client);
    this.transactionService.setClient(client);
    this.providerService.setProvider(client);
  }

  setSigner(signer: Signer) {
    this.signer = signer;

    // [TODO] Refactor so there is only one source of truth
    this.providerService.setSigner(signer);
  }

  getLoadedAsSafeApp() {
    return this.loadedAsSafeApp;
  }

  setLoadedAsSafeApp(loadedAsSafeApp: boolean) {
    this.loadedAsSafeApp = loadedAsSafeApp;
  }

  setModal(modal: SafeAppWeb3Modal) {
    this.modal = modal;
  }

  setAccount(account: string) {
    this.account = account;
  }

  setNetwork(chainId: number) {
    const foundNetwork = find(NETWORKS, { chainId });
    if (foundNetwork) {
      this.network = foundNetwork;
    }

    // [TODO] Refactor so there is only one source of truth
    this.contractService.setNetwork(chainId);
  }

  getAccount() {
    return this.account;
  }

  getSigner() {
    return this.signer;
  }

  async getSignSupport() {
    const isSafeApp = await this.modal.isSafeApp();
    return !isSafeApp;
  }

  // BOOTSTRAP
  async connect(suppliedProvider?: Provider) {
    const provider: Provider = suppliedProvider || ((await this.modal?.requestProvider()) as Provider);

    this.providerInfo = getProviderInfo(provider);
    this.providerService.setProviderInfo(getProviderInfo(provider));
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    const ethersProvider = new ethers.providers.Web3Provider(provider as ExternalProvider);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = ethersProvider.getSigner();

    this.providerService.setProvider(ethersProvider);
    this.providerService.setSigner(signer);

    this.setClient(ethersProvider);
    this.setSigner(signer);

    const account = await this.signer.getAddress();

    // provider.on('network', (newNetwork: number, oldNetwork: null | number) => {
    //   // When a Provider makes its initial connection, it emits a "network"
    //   // event with a null oldNetwork along with the newNetwork. So, if the
    //   // oldNetwork exists, it represents a changing network

    //   console.log('network', newNetwork, oldNetwork);
    //   if (oldNetwork) {
    //     window.location.reload();
    //   }
    // });

    // await Promise.all([this.positionService.fetchCurrentPositions(account), this.positionService.fetchPastPositions(account)]);

    this.setAccount(account);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.walletService.setAccount(undefined, this.setAccountCallback);

    this.setNetwork((await this.providerService.getNetwork()).chainId);

    try {
      const arcxClient = this.getArcxClient();

      const network = await ethersProvider.getNetwork();

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      arcxClient.connectWallet({
        chain: network.chainId,
        account,
      });
    } catch (e) {
      console.error('Error sending connectWallet event to arcx', e);
    }
  }

  disconnect() {
    this.modal?.clearCachedProvider();

    this.setAccount('');

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.walletService.setAccount(null, this.setAccountCallback);

    localStorage.removeItem(WALLET_CONNECT_KEY);
    this.setClient(new ethers.providers.Web3Provider({}));
    this.providerService.setProvider(new ethers.providers.Web3Provider({}));
  }

  async setUpModal() {
    const rpc = Object.keys(NETWORKS).reduce((a, name) => {
      const { chainId, rpc: rpcArray } = NETWORKS[name];
      const rpcUrl = rpcArray[0];
      if (chainId !== 1 && rpcUrl) {
        return {
          ...a,
          [chainId]: rpcUrl,
        };
      }
      return a;
    }, {});

    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: '5744aff1d49f4eee923c5f3e5af4cc1c', // required
          rpc,
        },
      },
      // frame: {
      //   package: ethProvider as WalletConnectProvider,
      // },
      'custom-bitkeep': {
        display: {
          logo: 'data:image/png;base64,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',
          name: 'Bitkeep',
          description: 'Connect with your Bitkeep wallet',
        },
        package: injectedConnector,
        connector: injectedConnector,
      },
      torus: {
        package: Torus, // required
      },
    };

    const web3Modal = new SafeAppWeb3Modal({
      cacheProvider: true, // optional
      providerOptions, // required
    });

    this.setModal(web3Modal);

    const loadedAsSafeApp = await web3Modal.isSafeApp();

    this.transactionService.setLoadedAsSafeApp(loadedAsSafeApp);
    this.meanApiService.setLoadedAsSafeApp(loadedAsSafeApp);
    this.setLoadedAsSafeApp(loadedAsSafeApp);

    try {
      if (process.env.ARCX_KEY) {
        const arcxSDK = await ArcxAnalyticsSdk.init(process.env.ARCX_KEY, {
          trackPages: true, // default - automatically trigger PAGE event if the url changes after click
          cacheIdentity: true, // default - caches identity of users in their browser's local storage
        });

        this.setArcxClient(arcxSDK);
      }
    } catch (e) {
      console.error('Error initializing arcx client');
    }

    try {
      if (web3Modal.cachedProvider || loadedAsSafeApp) {
        const provider = (await this.modal?.requestProvider()) as Provider;
        await this.connect(provider);
      }
    } catch (e) {
      console.error('Avoidable error when initializing connect', e);
    }

    await this.providerService.addEventListeners();
  }
}
