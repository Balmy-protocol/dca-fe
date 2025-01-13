import { Config } from 'wagmi';
import { NetworkStruct } from '@types';

import { AxiosInstance } from 'axios';
import { setupAxiosClient } from '@state/axios';
import { SavedCustomConfig } from '@state/base-types';
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
import AnalyticsService from './analyticsService';
import CampaignService from './campaignService';
import Permit2Service from './permit2Service';
import AccountService, { WalletActionType } from './accountService';
import LabelService from './labelService';
import ContactListService from './conctactListService';
import getWagmiConfig from './wagmiConfig';
import { EarnService } from './earnService';
import WalletClientsService from './walletClientsService';
import { reconnect } from '@wagmi/core';
import TierService from './tierService';

/* eslint-disable */
let deepDiffMapper = (function () {
  return {
    VALUE_CREATED: 'created',
    VALUE_UPDATED: 'updated',
    VALUE_DELETED: 'deleted',
    VALUE_UNCHANGED: 'unchanged',
    map: function (obj1: { [x: string]: any } | undefined, obj2: { [x: string]: any }) {
      if (this.isFunction(obj1) || this.isFunction(obj2)) {
        throw 'Invalid argument. Function given, object expected.';
      }
      if (this.isValue(obj1) || this.isValue(obj2)) {
        return {
          // @ts-ignore
          type: this.compareValues(obj1, obj2),
          previous: obj1,
          new: obj2,
        };
      }

      let diff = {};
      for (var key in obj1) {
        if (this.isFunction(obj1[key])) {
          continue;
        }

        let value2 = undefined;
        if (obj2[key] !== undefined) {
          value2 = obj2[key];
        }
        // @ts-ignore
        diff[key] = this.map(obj1[key], value2);
      }
      for (var key in obj2) {
        // @ts-ignore
        if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
          continue;
        }
        // @ts-ignore
        diff[key] = this.map(undefined, obj2[key]);
      }

      return diff;
    },
    compareValues: function (value1: { getTime: () => any } | undefined, value2: { getTime: () => any } | undefined) {
      if (value1 === value2) {
        return this.VALUE_UNCHANGED;
      }
      // @ts-ignore
      if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
        return this.VALUE_UNCHANGED;
      }
      if (value1 === undefined) {
        return this.VALUE_CREATED;
      }
      if (value2 === undefined) {
        return this.VALUE_DELETED;
      }
      return this.VALUE_UPDATED;
    },
    isFunction: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Function]';
    },
    isArray: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Array]';
    },
    isDate: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Date]';
    },
    isObject: function (x: any) {
      return Object.prototype.toString.call(x) === '[object Object]';
    },
    isValue: function (x: any) {
      return !this.isObject(x) && !this.isArray(x);
    },
  };
})();
/* eslint-enable */

export default class Web3Service {
  wagmiClient: Config;

  network: NetworkStruct;

  account: string;

  onUpdateConfig: (config: Partial<SavedCustomConfig>) => void;

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

  providerService: ProviderService;

  sdkService: SdkService;

  errorService: ErrorService;

  analyticsService: AnalyticsService;

  simulationService: SimulationService;

  safeService: SafeService;

  campaignService: CampaignService;

  permit2Service: Permit2Service;

  accountService: AccountService;

  labelService: LabelService;

  contactListService: ContactListService;

  earnService: EarnService;

  walletClientsService: WalletClientsService;

  tierService: TierService;

  constructor() {
    this.loadedAsSafeApp = false;

    this.axiosClient = setupAxiosClient();

    // initialize services
    this.safeService = new SafeService();
    this.meanApiService = new MeanApiService(this.axiosClient);
    this.walletClientsService = new WalletClientsService(this);
    this.tierService = new TierService(this, this.meanApiService);
    this.accountService = new AccountService(this, this.meanApiService, this.walletClientsService, this.tierService);
    this.sdkService = new SdkService(this.axiosClient);
    this.providerService = new ProviderService(this.accountService, this.sdkService, this.walletClientsService);
    this.contractService = new ContractService(this.providerService);
    this.earnService = new EarnService(
      this.sdkService,
      this.accountService,
      this.providerService,
      this.contractService,
      this.meanApiService
    );
    this.labelService = new LabelService(
      this.meanApiService,
      this.accountService,
      this.providerService,
      this.contractService
    );
    this.walletService = new WalletService(this.contractService, this.providerService);
    this.contactListService = new ContactListService(
      this.accountService,
      this.providerService,
      this.meanApiService,
      this.contractService,
      this.walletService,
      this.labelService
    );
    this.analyticsService = new AnalyticsService(this.providerService, this.accountService);
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
      this.analyticsService,
      this.walletService
    );
    this.campaignService = new CampaignService(
      this.meanApiService,
      this.priceService,
      this.providerService,
      this.sdkService,
      this.contractService
    );
    this.aggregatorService = new AggregatorService(
      this.walletService,
      this.contractService,
      this.sdkService,
      this.providerService,
      this.safeService,
      this.simulationService,
      this.analyticsService
    );
  }

  setOnUpdateConfig(onUpdateConfig: (config: Partial<SavedCustomConfig>) => void) {
    this.onUpdateConfig = onUpdateConfig;
  }

  getTierService() {
    return this.tierService;
  }

  getAccountService() {
    return this.accountService;
  }

  getWalletsClientService() {
    return this.walletClientsService;
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

  getAnalyticsService() {
    return this.analyticsService;
  }

  getCampaignService() {
    return this.campaignService;
  }

  getPermit2Service() {
    return this.permit2Service;
  }

  getEarnService() {
    return this.earnService;
  }

  getLoadedAsSafeApp() {
    return this.loadedAsSafeApp;
  }

  setLoadedAsSafeApp(loadedAsSafeApp: boolean) {
    this.loadedAsSafeApp = loadedAsSafeApp;
  }

  getSignSupport() {
    return !this.loadedAsSafeApp;
  }

  setUpModal() {
    const wagmiClient = getWagmiConfig();

    this.accountService.setWalletActionType(WalletActionType.connect);
    void this.accountService.logInUser();
    this.wagmiClient = wagmiClient;

    void reconnect(wagmiClient);

    const unsubscribe = wagmiClient.subscribe(
      (state) => ({
        status: state.status,
        chainId: state.chainId,
        connection: state.current,
        connectors: state.connections,
      }),
      (curr) => {
        const connector = curr.connection && curr.connectors.get(curr.connection);
        // void this.walletClientsService.updateWalletProvider(curr.connectors, curr.status, curr.connection);
        if (curr.connection) {
          void this.walletClientsService.updateWalletProvider(
            connector ? new Map([[curr.connection, connector]]) : new Map([]),
            curr.status,
            curr.connection
          );
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

    return { wagmiClient, unsubscribe };
  }

  logOutUser() {
    this.positionService.logOutUser();
    this.earnService.logOutUser();
    this.contactListService.logOutUser();
    this.labelService.logOutUser();
    this.transactionService.logOutUser();
  }
}
