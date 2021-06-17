import * as React from 'react';
import Web3Modal from 'web3modal';
import type Web3 from 'web3';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import graphPricesClient from 'utils/graphPricesApolloClient';

export type Token = {
  chainId: number;
  decimals: number;
  address: string;
  name: string;
  symbol: string;
  logoUri: string;
};

export type TokenList = Token[];

export type web3WalletState = null | {};

export type web3ModalState = null | Web3Modal;

export type setWeb3WalletValue = null | Web3;

export type setWeb3WalletState = React.Dispatch<React.SetStateAction<setWeb3WalletValue>>;

export type accountState = string;

export type setAccountState = React.Dispatch<React.SetStateAction<accountState>>;

export type WalletContextValue = {
  web3Wallet: web3WalletState;
  setWeb3Wallet: setWeb3WalletState;
  web3Modal: web3ModalState;
  account: accountState;
  setAccount: setAccountState;
  tokenList: TokenList;
  graphPricesClient: ApolloClient<NormalizedCacheObject>;
};

export const WalletContextDefaultValue: WalletContextValue = {
  web3Wallet: null,
  web3Modal: null,
  setWeb3Wallet: () => {},
  account: '',
  setAccount: () => {},
  tokenList: [],
  graphPricesClient: graphPricesClient,
};

const WalletContext = React.createContext(WalletContextDefaultValue);

export default WalletContext;
