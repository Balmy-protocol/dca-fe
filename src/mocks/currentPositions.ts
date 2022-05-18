import { ONE_DAY } from 'config/constants';
import { Position } from 'types';
import { BigNumber } from 'ethers';
import { PROTOCOL_TOKEN_ADDRESS } from './tokens';

export const EmptyPosition: Position = {
  from: {
    address: PROTOCOL_TOKEN_ADDRESS,
    name: 'PROTOCOL TOKEN',
    decimals: 18,
    chainId: 10,
    symbol: 'MEAN',
  },
  to: {
    address: PROTOCOL_TOKEN_ADDRESS,
    name: 'PROTOCOL TOKEN',
    decimals: 18,
    chainId: 10,
    symbol: 'MEAN',
  },
  swapInterval: ONE_DAY,
  user: PROTOCOL_TOKEN_ADDRESS,
  swapped: BigNumber.from(0),
  remainingLiquidity: BigNumber.from(0),
  rate: BigNumber.from(1),
  remainingSwaps: BigNumber.from(0),
  totalDeposits: BigNumber.from(0),
  withdrawn: BigNumber.from(0),
  totalSwaps: BigNumber.from(0),
  toWithdraw: BigNumber.from(0),
  id: 'PROTOCOL',
  startedAt: 0,
  status: 'TERMINATED',
  pendingTransaction: '',
  executedSwaps: BigNumber.from(0),
};
