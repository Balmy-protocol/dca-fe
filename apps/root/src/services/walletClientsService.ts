import { Address, ChainId } from '@types';
import { Connection } from 'wagmi';
import { EventsManager } from './eventsManager';
import { Connector, disconnect as wagmiDisconnect, getWalletClient, DisconnectReturnType } from '@wagmi/core';
import Web3Service from './web3Service';
import { getProviderInfo } from '@common/utils/provider-info';
import { isEqual } from 'lodash';
import { timeoutPromise } from '@balmy/sdk';

export const LAST_LOGIN_KEY = 'last_logged_in_with';
export const WALLET_SIGNATURE_KEY = 'wallet_auth_signature';
export const LATEST_SIGNATURE_VERSION = '1.0.1';
export const LATEST_SIGNATURE_VERSION_KEY = 'wallet_auth_signature_key';

export type AvailableWalletStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface AvailableProvider {
  status: AvailableWalletStatus;
  providerInfo?: ReturnType<typeof getProviderInfo>;
  chainId?: ChainId;
  connector?: Connector;
  connectors?: Record<string, { connector: Connector; status: AvailableWalletStatus }>;
  address: Address;
}

export interface WalletClientsServiceData {
  availableProviders: Record<Address, AvailableProvider>;
}

const initialState: WalletClientsServiceData = { availableProviders: {} };
export default class WalletClientsService extends EventsManager<WalletClientsServiceData> {
  web3Service: Web3Service;

  constructor(web3Service: Web3Service) {
    super(initialState);
    this.web3Service = web3Service;
  }

  get availableProviders() {
    return this.serviceData.availableProviders;
  }

  set availableProviders(availableProviders) {
    this.serviceData = { ...this.serviceData, availableProviders };
  }

  async updateWalletProvider(
    passedConnections: Map<string, Connection>,
    status: AvailableWalletStatus,
    affectedConnectionKey: Nullable<string>
  ) {
    const availableProviders = { ...this.availableProviders };

    try {
      const affectedConnection = passedConnections.get(affectedConnectionKey || '');
      const affectedProviderInfo = getProviderInfo(await affectedConnection?.connector.getProvider(), false);

      const affectedWallets = Object.values(availableProviders)
        .filter((provider) => provider.providerInfo?.id === affectedProviderInfo.id)
        .map((p) => p.address.toLowerCase()) as Address[];
      affectedWallets.forEach((wallet) => {
        availableProviders[wallet] = {
          ...availableProviders[wallet],
          status: 'disconnected',
          chainId: undefined,
        };
      });
    } catch (e) {
      console.error('WalletClientsService: error while trying to get provider info', e);
    }

    const connections = [...passedConnections];

    // Now for each connector address, we update the status of each provider
    for (const [connectionKey, connection] of connections) {
      const account = connection.accounts[0].toLowerCase() as Address;
      let providerInfo = {
        id: connection.connector.id,
        name: connection.connector.name,
        type: connection.connector.type,
        check: '',
        logo: '',
      };

      try {
        providerInfo = getProviderInfo(await connection.connector.getProvider(), false);
      } catch (e) {
        console.error('WalletClientsService: error while trying to get provider info', connection.connector.id, e);
      }

      if (connectionKey === affectedConnectionKey) {
        const availableProviderConnectors = {
          ...(availableProviders[account]?.connectors || {}),
          [connectionKey]: { status, connector: connection.connector },
        };

        const isConnected = Object.values(availableProviderConnectors).some((c) => c.status === 'connected');

        availableProviders[account] = {
          status: isConnected ? 'connected' : 'disconnected',
          providerInfo,
          chainId: connection.chainId,
          connector: connection.connector,
          address: account,
          connectors: availableProviderConnectors,
        };
      } else {
        const availableProviderConnectors = {
          ...(availableProviders[account]?.connectors || {}),
          [connectionKey]: { status, connector: connection.connector },
        };

        const isConnected = Object.values(availableProviderConnectors).some((c) => c.status === 'connected');

        availableProviders[account] = {
          status: isConnected ? 'connected' : 'disconnected',
          providerInfo,
          chainId: undefined,
          connector: connection.connector,
          connectors: availableProviderConnectors,
          address: account,
        };
      }
    }

    if (!isEqual(availableProviders, this.availableProviders)) {
      this.availableProviders = availableProviders;
      this.web3Service.accountService.updateWallets(availableProviders);
    }
  }

  async getWalletClient(address: Address) {
    const availableProvider = this.availableProviders[address];
    if (!availableProvider) {
      console.error('No available provider');
      return;
    }

    const connectorToUse = Object.values(availableProvider.connectors || {}).filter((c) => c.status === 'connected');
    if (!connectorToUse) {
      console.error('No connector to use');
      return;
    }

    for (const connector of connectorToUse) {
      try {
        // We need to timeoutPromise this since for walletconnect if the actual connector is not available it will hang and never finish the promise
        // We return this first wallet client that matches the address of the requested wallet since multiple connectors could change what wallet they are poionting to
        const client = await timeoutPromise(
          getWalletClient(this.web3Service.wagmiClient, {
            connector: connector.connector,
            chainId: availableProvider.chainId,
          }),
          '500ms'
        );
        if (client.account.address.toLowerCase() === address.toLowerCase()) {
          return client;
        }
      } catch (e) {
        console.error('Failed to get wallet client for connector', connector, e);
      }
    }

    return undefined;
  }

  getProviderInfo(address: Address) {
    return this.availableProviders[address.toLowerCase() as Address]?.providerInfo;
  }

  getAvailableProviders() {
    return this.availableProviders;
  }

  disconnect() {
    const promises: Promise<DisconnectReturnType>[] = [];
    this.web3Service.wagmiClient.connectors.forEach((connector) => {
      promises.push(
        wagmiDisconnect(this.web3Service.wagmiClient, { connector }).catch((e) => {
          console.error(e);
          return;
        })
      );
    });

    return Promise.all(promises);
  }
}
