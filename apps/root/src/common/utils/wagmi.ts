import { Connector } from 'wagmi';
import { Config, getWalletClient } from '@wagmi/core';
import { getProviderInfo } from './provider-info';
import { Address } from '@types';
import { WalletClient, TransactionRequest } from 'viem';

export const viemTransactionTypeToSdkStype = (tx: TransactionRequest) => {
  let type;
  switch (tx.type) {
    case 'legacy':
      type = 0;
      break;
    case 'eip2930':
      type = 1;
      break;
    case 'eip1559':
      type = 2;
      break;
    case 'eip4844':
      type = 3;
      break;
  }

  return type;
};

export const getConnectorData = async (connector: Connector, config: Config) => {
  const walletClient = await getWalletClient(config, { connector });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const provider = await connector.getProvider();

  const address = (await connector?.getAccounts())[0].toLowerCase() as Address;

  const providerInfo = getProviderInfo(provider);

  return { walletClient, address, providerInfo };
};

export const getChainIdFromWalletClient = async (walletClient: WalletClient) => {
  let chainId: number | undefined = undefined;

  try {
    if (walletClient.chain?.id) {
      chainId = walletClient.chain.id;
    } else {
      chainId = await walletClient.getChainId();
    }
  } catch (e) {
    console.error('Error while trying to get chainId from walletClient', e);
  }

  return chainId;
};
