import * as React from 'react';
import Web3Modal from 'web3modal';
import type Web3 from 'web3';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import graphPricesClient from 'utils/graphPricesApolloClient';
import Web3Service from 'services/web3Service';

export type Token = {
  chainId: number;
  decimals: number;
  address: string;
  name: string;
  symbol: string;
  logoURI: string;
};

export type TokenList = Record<string, Token>;

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
