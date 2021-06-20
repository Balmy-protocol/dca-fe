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
  logoURI: string;
};

export type TokenList = Record<string, Token>;

export type Web3WalletState = null | Web3;

export type Web3ModalState = null | Web3Modal;

export type SetWeb3WalletState = React.Dispatch<React.SetStateAction<Web3WalletState>>;

export type AccountState = string;

export type SetAccountState = React.Dispatch<React.SetStateAction<AccountState>>;

export type WalletContextValue = {
  web3Wallet: Web3WalletState;
  setWeb3Wallet: SetWeb3WalletState;
  web3Modal: Web3ModalState;
  account: AccountState;
  setAccount: SetAccountState;
  tokenList: TokenList;
  graphPricesClient: ApolloClient<NormalizedCacheObject>;
};

export const WalletContextDefaultValue: WalletContextValue = {
  web3Wallet: null,
  web3Modal: null,
  setWeb3Wallet: () => {},
  account: '',
  setAccount: () => {},
  tokenList: {},
  graphPricesClient,
};

const WalletContext = React.createContext(WalletContextDefaultValue);

export default WalletContext;
