import type Web3Service from 'services/web3Service';
import React from 'react';

type SetStateCallback<T> = React.Dispatch<React.SetStateAction<T>>;

type Token = {
  chainId: number;
  decimals: number;
  address: string;
  name: string;
  symbol: string;
  logoURI: string;
};

type TokenList = Record<string, Token>;

type AvailablePair = {
  token0: string;
  token1: string;
  id: string;
};

type AvailablePairs = AvailablePair[];

export type Web3ServicePromisableMethods =
  | 'connect'
  | 'disconnect'
  | 'setUpModal'
  | 'getBalance'
  | 'getEstimatedPairCreation'
  | 'getCurrentPositions';

export { Web3Service, SetStateCallback, Token, TokenList, AvailablePair, AvailablePairs };
