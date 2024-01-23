import { configureChains, createConfig, Connector, Chain, Config } from 'wagmi';
import { WalletClient } from 'viem';
import { getAllChains } from '@mean-finance/sdk';
import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
  argentWallet,
  safeWallet,
  ledgerWallet,
  braveWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  mainnet,
  polygon,
  bsc,
  avalanche,
  fantom,
  arbitrum,
  optimism,
  celo,
  gnosis,
  klaytn,
  aurora,
  cronos,
  okc,
  harmonyOne,
  boba,
  moonriver,
  moonbeam,
  evmos,
  canto,
  polygonZkEvm,
} from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { publicProvider } from 'wagmi/providers/public';
import { NetworkStruct, PositionVersions } from '@types';

import find from 'lodash/find';
import { AxiosInstance } from 'axios';
import { ArcxAnalyticsSdk } from '@arcxmoney/analytics';
import { DUMMY_ARCX_CLIENT } from '@common/utils/dummy-arcx-client';
import { chainToWagmiNetwork } from '@common/utils/parsing';

// MOCKS
import { NETWORKS, UNSUPPORTED_WAGMI_CHAIN } from '@constants';

import { bitkeepWallet, frameWallet, rabbyWallet, ripioWallet } from '@constants/custom-wallets';
import { setupAxiosClient } from '@state/axios';
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
import EventService from './eventService';
import CampaignService from './campaignService';
import Permit2Service from './permit2Service';
import AccountService from './accountService';
import LabelService from './labelService';
import ContactListService from './conctactListService';

const WALLET_CONNECT_KEY = 'walletconnect';

export default class Web3Service {
  wagmiClient: Config;

  apolloClient: Record<PositionVersions, Record<number, GraphqlService>>;

  network: NetworkStruct;

  account: string;

  setAccountCallback: React.Dispatch<React.SetStateAction<string>>;

  axiosClient: AxiosInstance;

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

  eventService: EventService;

  simulationService: SimulationService;

  safeService: SafeService;

  campaignService: CampaignService;

  permit2Service: Permit2Service;

  accountService: AccountService;

  labelService: LabelService;

  contactListService: ContactListService;

  constructor(
    DCASubgraphs?: Record<PositionVersions, Record<number, GraphqlService>>,
    setAccountCallback?: React.Dispatch<React.SetStateAction<string>>
  ) {
    if (setAccountCallback) {
      this.setAccountCallback = setAccountCallback;
    }
    if (DCASubgraphs) {
      this.apolloClient = DCASubgraphs;
    }

    this.loadedAsSafeApp = false;

    this.axiosClient = setupAxiosClient();

    // initialize services
    this.safeService = new SafeService();
    this.meanApiService = new MeanApiService(this.axiosClient);
    this.accountService = new AccountService(this, this.meanApiService);
    this.labelService = new LabelService(this.meanApiService, this.accountService);
    this.sdkService = new SdkService(this.axiosClient);
    this.providerService = new ProviderService(this.accountService, this.sdkService);
    this.contractService = new ContractService(this.providerService);
    this.walletService = new WalletService(this.contractService, this.providerService);
    this.contactListService = new ContactListService(
      this.accountService,
      this.providerService,
      this.meanApiService,
      this.contractService,
      this.walletService,
      this.labelService
    );
    this.eventService = new EventService(this.providerService, this.accountService);
    this.pairService = new PairService(
      this.walletService,
      this.contractService,
      this.meanApiService,
      this.providerService,
      this.apolloClient
    );
    this.yieldService = new YieldService(this.providerService, this.axiosClient);
    this.transactionService = new TransactionService(
      this.contractService,
      this.providerService,
      this.sdkService,
      this.meanApiService,
      this.accountService
    );
    this.permit2Service = new Permit2Service(
      this.walletService,
      this.contractService,
      this.sdkService,
      this.providerService
    );
    this.positionService = new PositionService(
      this.walletService,
      this.pairService,
      this.contractService,
      this.meanApiService,
      this.safeService,
      this.providerService,
      this.permit2Service,
      this.sdkService,
      this.accountService
    );
    this.priceService = new PriceService(
      this.walletService,
      this.contractService,
      this.axiosClient,
      this.providerService,
      this.sdkService
    );
    this.errorService = new ErrorService(this.meanApiService);
    this.simulationService = new SimulationService(
      this.meanApiService,
      this.providerService,
      this.contractService,
      this.sdkService,
      this.eventService
    );
    this.campaignService = new CampaignService(
      this.meanApiService,
      this.priceService,
      this.providerService,
      this.sdkService
    );
    this.aggregatorService = new AggregatorService(
      this.walletService,
      this.contractService,
      this.sdkService,
      this.apolloClient,
      this.providerService,
      this.safeService,
      this.simulationService,
      this.eventService
    );
  }

  setSetAccountFallback(accountCallback: React.Dispatch<React.SetStateAction<string>>) {
    this.setAccountCallback = accountCallback;
  }

  setArcxClient(newArcxClient: ArcxAnalyticsSdk) {
    this.arcxSdk = newArcxClient;
  }

  getArcxClient() {
    return this.arcxSdk || DUMMY_ARCX_CLIENT;
  }

  getAccountService() {
    return this.accountService;
  }

  getLabelService() {
    return this.labelService;
  }

  getContactListService() {
    return this.contactListService;
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

  getEventService() {
    return this.eventService;
  }

  getCampaignService() {
    return this.campaignService;
  }

  getPermit2Service() {
    return this.permit2Service;
  }

  getDCAGraphqlClient() {
    return this.apolloClient;
  }

  getLoadedAsSafeApp() {
    return this.loadedAsSafeApp;
  }

  setLoadedAsSafeApp(loadedAsSafeApp: boolean) {
    this.loadedAsSafeApp = loadedAsSafeApp;
  }

  setAccount(account: string) {
    this.account = account;
  }

  setNetwork(chainId: number) {
    const foundNetwork = find(NETWORKS, { chainId });
    if (foundNetwork) {
      this.network = foundNetwork;
    }
  }

  getSignSupport() {
    return !this.loadedAsSafeApp;
  }

  // BOOTSTRAP
  async connect(suppliedProvider?: WalletClient, connector?: Connector, chainId?: number) {
    const connectorProvider = await connector?.getWalletClient();

    if (!suppliedProvider && !connectorProvider) {
      return;
    }

    const providerToUser = suppliedProvider || connectorProvider;

    const mainAccount = providerToUser?.account;

    if (!mainAccount) {
      throw new Error('Account not found on wallet client');
    }

    const account = mainAccount.address;

    this.setAccount(account);

    try {
      if (chainId) {
        await this.walletService.changeNetworkAutomatically(chainId, account, () => this.setNetwork(chainId));
      } else {
        const providerNetwork = await this.providerService.getNetwork(account);
        const providerChainId = providerNetwork.chainId;
        this.setNetwork(providerChainId);
      }
    } catch (e) {
      console.error('Error changing network', e);
    }

    this.setAccountCallback(account);

    try {
      const arcxClient = this.getArcxClient();

      const network = await providerToUser.getChainId();

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      arcxClient.wallet({
        chainId: network,
        account,
      });
    } catch (e) {
      console.error('Error sending connectWallet event to arcx', e);
    }
  }

  disconnect() {
    // this.modal?.clearCachedProvider();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.wagmiClient.connector?.disconnect();

    this.wagmiClient.clearState();
    this.wagmiClient.storage.removeItem('connected');

    this.setAccount('');

    void this.accountService.logoutUser();

    this.setAccountCallback('');

    localStorage.removeItem(WALLET_CONNECT_KEY);
  }

  setUpModal() {
    const sdkChains = getAllChains();

    const addedNetworks: Chain[] = [];

    UNSUPPORTED_WAGMI_CHAIN.forEach((chainId) => {
      const found = find(sdkChains, { chainId });
      if (found) {
        addedNetworks.push(chainToWagmiNetwork(found));
      }
    });

    const { chains, publicClient, webSocketPublicClient } = configureChains(
      [
        mainnet,
        polygon,
        bsc,
        avalanche,
        fantom,
        arbitrum,
        optimism,
        celo,
        gnosis,
        klaytn,
        aurora,
        cronos,
        okc,
        harmonyOne,
        boba,
        moonriver,
        moonbeam,
        evmos,
        canto,
        polygonZkEvm,
        ...addedNetworks,
      ],
      [
        // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
        publicProvider(),
      ]
    );

    const connectors = connectorsForWallets([
      {
        groupName: 'Popular',
        wallets: [
          injectedWallet({ chains }),
          frameWallet({ chains }),
          rabbyWallet({ chains }),
          metaMaskWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          walletConnectWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          rainbowWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          coinbaseWallet({ chains, appName: 'Mean Finance' }),
          braveWallet({ chains }),
        ],
      },
      {
        groupName: 'More',
        wallets: [
          trustWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          ripioWallet({ chains }),
          argentWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          safeWallet({ chains }),
          ledgerWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          bitkeepWallet({ chains }),
        ],
      },
    ]);

    const wagmiClient = createConfig({
      autoConnect: true,
      connectors,
      publicClient,
      webSocketPublicClient,
    });

    // await wagmiClient.autoConnect();

    this.wagmiClient = wagmiClient;

    wagmiClient.subscribe(
      (state) => ({
        connector: state.connector,
        status: state.status,
        chainId: state.data?.chain?.id,
        account: state.data?.account,
        data: state.data,
        connectors: state.connectors,
      }),
      (curr, prev) => {
        // console.log(curr.status);
        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // const logConnectors = async (passedConnectors: Connector<any, any, any>[], connect: boolean) => {
        //   let index = 0;
        //   for (const conn of passedConnectors) {
        //     try {
        //       const isAuthorized = await conn.isAuthorized();
        //       const acc = await conn.getAccount();
        //       console.log('Connector', isAuthorized, acc, conn.id, conn.name, index)

        //       if (connect && index === 4) {
        //         console.log('trying to connect');
        //         await conn.connect();
        //         console.log('connected');
        //       }
        //     } catch(e) {
        //       console.log('error connector', e, index);
        //     }

        //     index++;
        //   }
        // }
        // void logConnectors(curr.connectors, curr.status === 'disconnected');
        if (prev.status !== 'connected' && curr.status === 'connected') {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.accountService
            .logInUser(curr.connector)
            .then(() => {
              void this.contactListService.initializeAliasesAndContacts();
              void this.transactionService.fetchTransactionsHistory();
              return;
            })
            .catch((e) => console.error('Error while connecting external user', e));
        }

        if (curr.status === 'connected' && prev.status === 'connected' && curr.account !== prev.account) {
          // this.providerService.handleAccountChange();
          void this.accountService.updateWallet({ connector: curr.connector });
        }

        if (curr.chainId && curr.chainId !== prev.chainId) {
          this.providerService.handleChainChanged(curr.chainId);
        }
      }
    );

    this.safeService
      .isSafeApp()
      .then((loadedAsSafeApp) => {
        this.transactionService.setLoadedAsSafeApp(loadedAsSafeApp);
        this.meanApiService.setLoadedAsSafeApp(loadedAsSafeApp);
        this.setLoadedAsSafeApp(loadedAsSafeApp);

        return;
      })
      .catch((e) => console.error('Error getting isSafeApp', e));

    if (process.env.ARCX_KEY) {
      ArcxAnalyticsSdk.init(process.env.ARCX_KEY, {
        trackPages: true, // default - automatically trigger PAGE event if the url changes after click
        cacheIdentity: true, // default - caches identity of users in their browser's local storage
      })
        .then((arcxSDK) => this.setArcxClient(arcxSDK))
        .catch((e) => console.error('Error initializing arcx client', e));
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
