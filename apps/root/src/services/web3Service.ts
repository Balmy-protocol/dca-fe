import { configureChains, createConfig, Chain, Config } from 'wagmi';
import { Address } from 'viem';
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
  okxWallet,
  zerionWallet,
  coreWallet,
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
import { NetworkStruct } from '@types';

import find from 'lodash/find';
import { AxiosInstance } from 'axios';
import { ArcxAnalyticsSdk } from '@arcxmoney/analytics';
import { DUMMY_ARCX_CLIENT } from '@common/utils/dummy-arcx-client';
import { chainToWagmiNetwork } from '@common/utils/parsing';

// MOCKS
import { UNSUPPORTED_WAGMI_CHAIN } from '@constants';

import { bitkeepWallet, frameWallet, rabbyWallet, ripioWallet } from '@constants/custom-wallets';
import { setupAxiosClient } from '@state/axios';
import ContractService from './contractService';
import TransactionService from './transactionService';
import PriceService from './priceService';
import PositionService from './positionService';
import PairService from './pairService';
import WalletService from './walletService';
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

export default class Web3Service {
  wagmiClient: Config;

  network: NetworkStruct;

  account: string;

  setAccountCallback: React.Dispatch<React.SetStateAction<string>>;

  axiosClient: AxiosInstance;

  loadedAsSafeApp: boolean;

  isConnected: boolean;

  contractService: ContractService;

  transactionService: TransactionService;

  priceService: PriceService;

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

  constructor(setAccountCallback?: React.Dispatch<React.SetStateAction<string>>) {
    if (setAccountCallback) {
      this.setAccountCallback = setAccountCallback;
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
    this.pairService = new PairService(this.sdkService);
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

  getLoadedAsSafeApp() {
    return this.loadedAsSafeApp;
  }

  setLoadedAsSafeApp(loadedAsSafeApp: boolean) {
    this.loadedAsSafeApp = loadedAsSafeApp;
  }

  setAccount(account: string) {
    this.account = account;
    if (this.setAccountCallback) {
      this.setAccountCallback(account);
    }
  }

  getSignSupport() {
    return !this.loadedAsSafeApp;
  }

  // BOOTSTRAP
  arcXConnect(account: Address, chainId: number) {
    try {
      const arcxClient = this.getArcxClient();

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      arcxClient.wallet({
        account,
        chainId,
      });
    } catch (e) {
      console.error('Error sending connectWallet event to arcx', e);
    }
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
          zerionWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          metaMaskWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          walletConnectWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          okxWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          rainbowWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
          coinbaseWallet({ chains, appName: 'Mean Finance' }),
          braveWallet({ chains }),
        ],
      },
      {
        groupName: 'More',
        wallets: [
          coreWallet({ chains, projectId: process.env.WC_PROJECT_ID as string }),
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
        if (prev.status !== 'connected' && curr.status === 'connected') {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.accountService
            .logInUser(curr.connector, curr.connectors)
            .catch((e) => console.error('Error while connecting external user', e));
        }

        if (curr.status === 'connected' && prev.status === 'connected' && curr.account !== prev.account) {
          // this.providerService.handleAccountChange();
          void this.accountService.updateWallet({ connector: curr.connector });
        }

        if (
          curr.chainId &&
          curr.status === 'connected' &&
          prev.status === 'connected' &&
          curr.account === prev.account &&
          curr.chainId !== prev.chainId
        ) {
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

    return { wagmiClient, chains };
  }

  logOutUser() {
    this.positionService.logOutUser();
    this.contactListService.logOutUser();
    this.labelService.logOutUser();
    this.transactionService.logOutUser();
    this.setAccount('');
  }
}
