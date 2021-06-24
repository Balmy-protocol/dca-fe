import type Web3Service from 'services/web3Service';
import React from 'react';
import { BigNumber } from 'ethers';

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

type Web3ServicePromisableMethods =
  | 'connect'
  | 'disconnect'
  | 'setUpModal'
  | 'getBalance'
  | 'getEstimatedPairCreation'
  | 'getCurrentPositions';

interface CurrentPosition {
  from: string;
  to: string;
  remainingDays: number;
  startedAt: Date;
  exercised: BigNumber;
  remainingLiquidity: BigNumber;
}

type CurrentPositions = CurrentPosition[];

export {
  Web3Service,
  SetStateCallback,
  Token,
  TokenList,
  AvailablePair,
  AvailablePairs,
  Web3ServicePromisableMethods,
  CurrentPosition,
  CurrentPositions,
};
