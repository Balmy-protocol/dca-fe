import { Connector } from 'wagmi';
import { getProviderInfo } from './provider-info';
import { Address } from '@types';

export const getConnectorData = async (connector: Connector) => {
  const walletClient = await connector.getWalletClient();

  const address = (await walletClient.getAddresses())[0].toLowerCase() as Address;

  const providerInfo = getProviderInfo(walletClient);

  return { walletClient, address, providerInfo };
};
