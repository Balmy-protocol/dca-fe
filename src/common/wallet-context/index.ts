import * as React from 'react';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import graphPricesClient from 'utils/graphPricesApolloClient';
import Web3Service from 'services/web3Service';
import { TokenList, AvailablePairs } from 'types';

export type WalletContextValue = {
  web3Service: Web3Service;
  tokenList: TokenList;
  graphPricesClient: ApolloClient<NormalizedCacheObject>;
  account: string;
  availablePairs: AvailablePairs;
};

export const WalletContextDefaultValue: WalletContextValue = {
  web3Service: new Web3Service(),
  tokenList: {},
  graphPricesClient,
  account: '',
  availablePairs: [],
};

const WalletContext = React.createContext(WalletContextDefaultValue);

export default WalletContext;
