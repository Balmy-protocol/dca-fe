import type Web3Service from 'services/web3Service';
import React from 'react';

export * from './tokens';
export * from './positions';
export * from './pairs';
export * from './responses';
export * from './transactions';

export type SetStateCallback<T> = React.Dispatch<React.SetStateAction<T>>;

export { Web3Service };

export type Web3ServicePromisableMethods =
  | 'connect'
  | 'disconnect'
  | 'setUpModal'
  | 'getBalance'
  | 'getEstimatedPairCreation'
  | 'getCurrentPositions'
  | 'getNetwork'
  | 'getUsedTokens'
  | 'getAvailablePairs'
  | 'getAllowance'
  | 'canSupportPair'
  | 'getPastPositions'
  | 'getPairOracle'
  | 'getUsdPrice';

export interface Network {
  chainId: number;
}
