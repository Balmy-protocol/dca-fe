import { WETH, DAI, UNI } from './tokens';
import { SWAP_INTERVALS } from 'utils/parsing';
import { parseUnits } from '@ethersproject/units';

const mockedCurrentPositions = [
  {
    from: UNI.address,
    to: DAI.address,
    swapInterval: SWAP_INTERVALS['day'],
    startedAt: new Date(1623624089 * 1000),
    swapped: parseUnits('50', DAI.decimals),
    remainingLiquidity: parseUnits('0.00004', UNI.decimals),
    remainingSwaps: 2,
    withdrawn: parseUnits('25', DAI.decimals),
    id: 1,
  },
  {
    from: UNI.address,
    to: DAI.address,
    swapInterval: SWAP_INTERVALS['day'],
    startedAt: new Date(1623624089 * 1000),
    swapped: parseUnits('2', DAI.decimals),
    remainingLiquidity: parseUnits('0.000000015', UNI.decimals),
    remainingSwaps: 5,
    withdrawn: parseUnits('4', DAI.decimals),
    id: 2,
  },
  {
    from: DAI.address,
    to: UNI.address,
    swapInterval: SWAP_INTERVALS['day'],
    startedAt: new Date(1623624089 * 1000),
    swapped: parseUnits('0.0001', UNI.decimals),
    remainingLiquidity: parseUnits('50', DAI.decimals),
    remainingSwaps: 1,
    withdrawn: parseUnits('0.00001', UNI.decimals),
    id: 3,
  },
  {
    from: WETH.address,
    to: DAI.address,
    swapInterval: SWAP_INTERVALS['day'],
    startedAt: new Date(1623624089 * 1000),
    swapped: parseUnits('50', DAI.decimals),
    remainingLiquidity: parseUnits('0.00004', WETH.decimals),
    remainingSwaps: 2,
    withdrawn: parseUnits('25', DAI.decimals),
    id: 99999,
  },
];

export default mockedCurrentPositions;
