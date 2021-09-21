import { WETH, DAI, UNI } from './tokens';
import { NETWORKS } from 'config/constants';
import { SWAP_INTERVALS } from 'utils/parsing';
import { parseUnits } from '@ethersproject/units';

const mockedCurrentPositions = [
  {
    from: UNI(NETWORKS.mainnet.chainId).address,
    to: DAI(NETWORKS.mainnet.chainId).address,
    swapInterval: SWAP_INTERVALS['day'],
    startedAt: new Date(1623624089 * 1000),
    swapped: parseUnits('50', DAI(NETWORKS.mainnet.chainId).decimals),
    remainingLiquidity: parseUnits('0.00004', UNI(NETWORKS.mainnet.chainId).decimals),
    remainingSwaps: 2,
    withdrawn: parseUnits('25', DAI(NETWORKS.mainnet.chainId).decimals),
    id: 1,
  },
  {
    from: UNI(NETWORKS.mainnet.chainId).address,
    to: DAI(NETWORKS.mainnet.chainId).address,
    swapInterval: SWAP_INTERVALS['day'],
    startedAt: new Date(1623624089 * 1000),
    swapped: parseUnits('2', DAI(NETWORKS.mainnet.chainId).decimals),
    remainingLiquidity: parseUnits('0.000000015', UNI(NETWORKS.mainnet.chainId).decimals),
    remainingSwaps: 5,
    withdrawn: parseUnits('4', DAI(NETWORKS.mainnet.chainId).decimals),
    id: 2,
  },
  {
    from: DAI(NETWORKS.mainnet.chainId).address,
    to: UNI(NETWORKS.mainnet.chainId).address,
    swapInterval: SWAP_INTERVALS['day'],
    startedAt: new Date(1623624089 * 1000),
    swapped: parseUnits('0.0001', UNI(NETWORKS.mainnet.chainId).decimals),
    remainingLiquidity: parseUnits('50', DAI(NETWORKS.mainnet.chainId).decimals),
    remainingSwaps: 1,
    withdrawn: parseUnits('0.00001', UNI(NETWORKS.mainnet.chainId).decimals),
    id: 3,
  },
  {
    from: WETH(NETWORKS.mainnet.chainId).address,
    to: DAI(NETWORKS.mainnet.chainId).address,
    swapInterval: SWAP_INTERVALS['day'],
    startedAt: new Date(1623624089 * 1000),
    swapped: parseUnits('50', DAI(NETWORKS.mainnet.chainId).decimals),
    remainingLiquidity: parseUnits('0.00004', WETH(NETWORKS.mainnet.chainId).decimals),
    remainingSwaps: 2,
    withdrawn: parseUnits('25', DAI(NETWORKS.mainnet.chainId).decimals),
    id: 99999,
  },
];

export default mockedCurrentPositions;
