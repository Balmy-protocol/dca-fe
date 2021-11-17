import * as React from 'react';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import graphPricesClient from 'utils/graphPricesApolloClient';
import DCASubgraph from 'utils/dcaSubgraphApolloClient';
import Web3Service from 'services/web3Service';
import axios, { AxiosInstance } from 'axios';

export type WalletContextValue = {
  web3Service: Web3Service;
  graphPricesClient: ApolloClient<NormalizedCacheObject>;
  DCASubgraph: ApolloClient<NormalizedCacheObject>;
  account: string;
  axiosClient: AxiosInstance;
};

export const WalletContextDefaultValue: WalletContextValue = {
  web3Service: new Web3Service(),
  graphPricesClient,
  DCASubgraph,
  account: '',
  axiosClient: axios.create(),
};

const WalletContext = React.createContext(WalletContextDefaultValue);

export default WalletContext;
