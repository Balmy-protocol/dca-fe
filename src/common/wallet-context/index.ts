import * as React from 'react';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import graphPricesClient from 'utils/graphPricesApolloClient';
import Web3Service from 'services/web3Service';
import { TokenList } from 'types';

export type WalletContextValue = {
  web3Service: Web3Service;
  tokenList: TokenList;
  graphPricesClient: ApolloClient<NormalizedCacheObject>;
  account: string;
};

export const WalletContextDefaultValue: WalletContextValue = {
  web3Service: new Web3Service(),
  tokenList: {},
  graphPricesClient,
  account: '',
};

const WalletContext = React.createContext(WalletContextDefaultValue);

export default WalletContext;
