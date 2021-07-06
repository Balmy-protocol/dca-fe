import * as React from 'react';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import graphPricesClient from 'utils/graphPricesApolloClient';
import Web3Service from 'services/web3Service';
import { TokenList, AvailablePairs } from 'types';

export type WalletContextValue = {
  web3Service: Web3Service;
  graphPricesClient: ApolloClient<NormalizedCacheObject>;
  account: string;
};

export const WalletContextDefaultValue: WalletContextValue = {
  web3Service: new Web3Service(),
  graphPricesClient,
  account: '',
};

const WalletContext = React.createContext(WalletContextDefaultValue);

export default WalletContext;
