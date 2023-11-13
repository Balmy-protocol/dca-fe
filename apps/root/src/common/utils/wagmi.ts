import { ExternalProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { Connector } from 'wagmi';
import { getProviderInfo } from './provider-info';

export const getConnectorData = async (connector: Connector) => {
  const baseProvider = (await connector.getProvider()) as ExternalProvider;

  const provider = new ethers.providers.Web3Provider(baseProvider, 'any');

  const signer = provider.getSigner();

  const address = (await signer.getAddress()).toLowerCase();

  const providerInfo = getProviderInfo(baseProvider);

  return { baseProvider, provider, signer, address, providerInfo };
};
