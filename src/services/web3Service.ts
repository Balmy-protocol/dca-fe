import { ethers, Signer } from 'ethers';
import { ExternalProvider, Provider, Network } from '@ethersproject/providers';
import { Web3Modal } from '@web3modal/standalone';
import { EthereumClient } from '@web3modal/ethereum';
import { configureChains, createClient, Client, Connector } from 'wagmi';
import { arbitrum, mainnet, polygon, optimism } from 'wagmi/chains';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { publicProvider } from 'wagmi/providers/public';

import find from 'lodash/find';
import { AxiosInstance } from 'axios';
import { ArcxAnalyticsSdk } from '@arcxmoney/analytics';
import { DUMMY_ARCX_CLIENT } from 'utils/dummy-arcx-client';

// MOCKS
import { NETWORKS, PositionVersions } from 'config/constants';

import { getProviderInfo } from 'web3modal';
import { setupAxiosClient } from 'state';
import GraphqlService from './graphql';
import ContractService from './contractService';
import TransactionService from './transactionService';
import PriceService from './priceService';
import PositionService from './positionService';
import PairService from './pairService';
import WalletService from './walletService';
import YieldService from './yieldService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';
import AggregatorService from './aggregatorService';
import SdkService from './sdkService';
import ErrorService from './errorService';
import SimulationService from './simulationService';
import SafeService from './safeService';

const WALLET_CONNECT_KEY = 'walletconnect';

export default class Web3Service {
  client: ethers.providers.Web3Provider;

  modal: Web3Modal;

  signer: Signer;

  ethClient: EthereumClient;

  wagmiClient: Client;

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

  aggregatorService: AggregatorService;

  pairService: PairService;

  walletService: WalletService;

  meanApiService: MeanApiService;

  arcxSdk: ArcxAnalyticsSdk;

  providerService: ProviderService;

  sdkService: SdkService;

  errorService: ErrorService;

  simulationService: SimulationService;

  safeService: SafeService;

  constructor(
    DCASubgraphs?: Record<PositionVersions, Record<number, GraphqlService>>,
    UNISubgraphs?: Record<PositionVersions, Record<number, GraphqlService>>,
    setAccountCallback?: React.Dispatch<React.SetStateAction<string>>,
    client?: ethers.providers.Web3Provider,
    modal?: Web3Modal
  ) {
    if (setAccountCallback) {
      this.setAccountCallback = setAccountCallback;
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
    this.safeService = new SafeService();
    this.contractService = new ContractService(this.providerService);
    this.transactionService = new TransactionService(this.contractService, this.providerService);
    this.walletService = new WalletService(this.contractService, this.axiosClient, this.providerService);
    this.meanApiService = new MeanApiService(this.contractService, this.axiosClient, this.providerService);
    this.pairService = new PairService(
      this.walletService,
      this.contractService,
      this.meanApiService,
      this.providerService,
      this.apolloClient,
      this.uniClient
    );
    this.yieldService = new YieldService(this.walletService, this.providerService, this.axiosClient);
    this.sdkService = new SdkService(this.walletService, this.providerService, this.axiosClient);
    this.aggregatorService = new AggregatorService(
      this.walletService,
      this.contractService,
      this.sdkService,
      this.apolloClient,
      this.providerService,
      this.safeService
    );
    this.positionService = new PositionService(
      this.walletService,
      this.pairService,
      this.contractService,
      this.meanApiService,
      this.safeService,
      this.apolloClient,
      this.providerService
    );
    this.priceService = new PriceService(
      this.walletService,
      this.contractService,
      this.axiosClient,
      this.providerService
    );
    this.errorService = new ErrorService(this.meanApiService);
    this.simulationService = new SimulationService(this.meanApiService, this.providerService);
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

  getSdkService() {
    return this.sdkService;
  }

  getSafeService() {
    return this.safeService;
  }

  getSimulationService() {
    return this.simulationService;
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

  getAggregatorService() {
    return this.aggregatorService;
  }

  getErrorService() {
    return this.errorService;
  }

  getWalletService() {
    return this.walletService;
  }

  getProviderService() {
    return this.providerService;
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

  setModal(modal: Web3Modal) {
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

  getSignSupport() {
    const isSafeApp = false;
    return !isSafeApp;
  }

  // BOOTSTRAP
  async connect(suppliedProvider?: Provider, connector?: Connector<Provider>) {
    const connectorProvider = await connector?.getProvider();

    if (!suppliedProvider && !connectorProvider) {
      return;
    }

    const provider: Provider = (suppliedProvider || connectorProvider) as Provider;

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

    await this.sdkService.resetProvider();

    await this.providerService.addEventListeners();

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
    // this.modal?.clearCachedProvider();

    this.wagmiClient.connector?.disconnect();

    this.wagmiClient.clearState();
    this.wagmiClient.storage.removeItem('connected');

    this.setAccount('');

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.walletService.setAccount(null, this.setAccountCallback);

    localStorage.removeItem(WALLET_CONNECT_KEY);
    this.setClient(new ethers.providers.Web3Provider({}));
    this.providerService.setProvider(new ethers.providers.Web3Provider({}));
  }

  async setUpModal() {
    const { chains, provider, webSocketProvider } = configureChains(
      [polygon, optimism, arbitrum, mainnet],
      [
        // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
        publicProvider(),
      ]
    );

    const { connectors } = getDefaultWallets({
      appName: 'My RainbowKit App',
      chains,
    });

    const wagmiClient = createClient({
      autoConnect: true,
      connectors,
      provider,
      webSocketProvider,
    });

    // await wagmiClient.autoConnect();

    this.wagmiClient = wagmiClient;

    wagmiClient.subscribe(
      (state) => ({
        connector: state.connector,
        status: state.status,
      }),
      (curr, prev) => {
        if (prev.status !== 'connected' && curr.status === 'connected') {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.connect(undefined, curr.connector);
        }
      }
    );

    const loadedAsSafeApp = false;

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

    // try {
    //   if (web3Modal.cachedProvider || loadedAsSafeApp) {
    //     const provider = (await this.modal?.requestProvider()) as Provider;
    //     await this.connect(provider);
    //   }
    // } catch (e) {
    //   console.error('Avoidable error when initializing connect', e);
    // }
    return { wagmiClient, chains };
  }
}
