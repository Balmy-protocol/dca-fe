import * as React from 'react';
import Web3Service from '@services/web3Service';
import axios, { AxiosInstance } from 'axios';

export type WalletContextValue = {
  web3Service: Web3Service;
  axiosClient: AxiosInstance;
};

export const WalletContextDefaultValue: WalletContextValue = {
  web3Service: new Web3Service(),
  axiosClient: axios.create(),
};

const WalletContext = React.createContext(WalletContextDefaultValue);

export default WalletContext;
