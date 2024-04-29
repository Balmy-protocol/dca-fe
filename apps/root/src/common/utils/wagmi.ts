import { Connector } from 'wagmi';
import { getProviderInfo } from './provider-info';
import { Address } from '@types';

export const getConnectorData = async (connector: Connector) => {
  const walletClient = await connector.getWalletClient();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const provider = await connector.getProvider();

  const address = (await walletClient.getAddresses())[0].toLowerCase() as Address;

  const providerInfo = getProviderInfo(provider);

  return { walletClient, address, providerInfo };
};
