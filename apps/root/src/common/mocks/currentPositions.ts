import { LATEST_VERSION, ONE_DAY } from '@constants';
import { Position, TokenType } from '@types';

import { PROTOCOL_TOKEN_ADDRESS } from './tokens';

export const EmptyPosition: Position = {
  from: {
    address: PROTOCOL_TOKEN_ADDRESS,
    name: 'PROTOCOL TOKEN',
    decimals: 18,
    chainId: 10,
    symbol: 'MEAN',
    type: TokenType.BASE,
    underlyingTokens: [],
  },
  to: {
    address: PROTOCOL_TOKEN_ADDRESS,
    name: 'PROTOCOL TOKEN',
    decimals: 18,
    chainId: 10,
    symbol: 'MEAN',
    type: TokenType.BASE,
    underlyingTokens: [],
  },
  swapInterval: ONE_DAY,
  user: PROTOCOL_TOKEN_ADDRESS,
  swapped: { amount: BigInt(0), amountInUnits: '' },
  pairId: `${PROTOCOL_TOKEN_ADDRESS}-${PROTOCOL_TOKEN_ADDRESS}`,
  remainingLiquidity: { amount: BigInt(0), amountInUnits: '' },
  rate: { amount: BigInt(1), amountInUnits: '1' },
  swappedYield: { amount: BigInt(1), amountInUnits: '1' },
  toWithdrawYield: { amount: BigInt(1), amountInUnits: '1' },
  remainingLiquidityYield: { amount: BigInt(1), amountInUnits: '1' },
  remainingSwaps: BigInt(0),
  totalSwaps: BigInt(0),
  toWithdraw: { amount: BigInt(0), amountInUnits: '' },
  id: 'PROTOCOL',
  positionId: 1n,
  startedAt: 0,
  status: 'TERMINATED',
  pendingTransaction: '',
  totalExecutedSwaps: BigInt(0),
  version: LATEST_VERSION,
  chainId: 10,
  nextSwapAvailableAt: 0,
  isStale: false,
};
