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
  swapped: BigInt(0),
  pairId: `${PROTOCOL_TOKEN_ADDRESS}-${PROTOCOL_TOKEN_ADDRESS}`,
  remainingLiquidity: BigInt(0),
  rate: BigInt(1),
  swappedYield: BigInt(1),
  toWithdrawYield: BigInt(1),
  remainingLiquidityYield: BigInt(1),
  remainingSwaps: BigInt(0),
  totalSwaps: BigInt(0),
  toWithdraw: BigInt(0),
  id: 'PROTOCOL',
  positionId: 'PROTOCOL',
  startedAt: 0,
  status: 'TERMINATED',
  pendingTransaction: '',
  totalExecutedSwaps: BigInt(0),
  version: LATEST_VERSION,
  chainId: 10,
  nextSwapAvailableAt: 0,
  isStale: false,
};
