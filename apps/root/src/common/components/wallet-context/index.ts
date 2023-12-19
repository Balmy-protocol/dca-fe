import * as React from 'react';
import Web3Service from '@services/web3Service';
import axios, { AxiosInstance } from 'axios';
import { Address } from 'viem';

export type WalletContextValue = {
  web3Service: Web3Service;
  account: Address;
  axiosClient: AxiosInstance;
};

export const WalletContextDefaultValue: WalletContextValue = {
  web3Service: new Web3Service(),
  account: '' as Address,
  axiosClient: axios.create(),
};

const WalletContext = React.createContext(WalletContextDefaultValue);

export default WalletContext;
