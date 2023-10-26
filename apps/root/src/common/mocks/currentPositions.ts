import { LATEST_VERSION, ONE_DAY } from '@constants';
import { Position, TokenType } from '@types';
import { BigNumber } from 'ethers';
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
  swapped: BigNumber.from(0),
  pairId: `${PROTOCOL_TOKEN_ADDRESS}-${PROTOCOL_TOKEN_ADDRESS}`,
  remainingLiquidity: BigNumber.from(0),
  rate: BigNumber.from(1),
  swappedYield: BigNumber.from(1),
  toWithdrawYield: BigNumber.from(1),
  remainingLiquidityYield: BigNumber.from(1),
  remainingSwaps: BigNumber.from(0),
  totalSwaps: BigNumber.from(0),
  toWithdraw: BigNumber.from(0),
  id: 'PROTOCOL',
  positionId: 'PROTOCOL',
  startedAt: 0,
  status: 'TERMINATED',
  pendingTransaction: '',
  totalExecutedSwaps: BigNumber.from(0),
  version: LATEST_VERSION,
  chainId: 10,
  nextSwapAvailableAt: 0,
  isStale: false,
};
