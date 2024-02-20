import { parseUnits } from '@ethersproject/units';
import { NETWORKS } from './addresses';

export const MIN_AMOUNT_FOR_MAX_DEDUCTION = {
  [NETWORKS.polygon.chainId]: parseUnits('0.1', 18),
  [NETWORKS.bsc.chainId]: parseUnits('0.1', 18),
  [NETWORKS.arbitrum.chainId]: parseUnits('0.001', 18),
  [NETWORKS.optimism.chainId]: parseUnits('0.001', 18),
  [NETWORKS.mainnet.chainId]: parseUnits('0.1', 18),
  [NETWORKS.baseGoerli.chainId]: parseUnits('0.1', 18),
  [NETWORKS.xdai.chainId]: parseUnits('0.1', 18),
  [NETWORKS.moonbeam.chainId]: parseUnits('0.1', 18),
};

export const MAX_DEDUCTION = {
  [NETWORKS.polygon.chainId]: parseUnits('0.045', 18),
  [NETWORKS.bsc.chainId]: parseUnits('0.045', 18),
  [NETWORKS.arbitrum.chainId]: parseUnits('0.00015', 18),
  [NETWORKS.optimism.chainId]: parseUnits('0.000525', 18),
  [NETWORKS.mainnet.chainId]: parseUnits('0.021', 18),
  [NETWORKS.baseGoerli.chainId]: parseUnits('0.021', 18),
  [NETWORKS.xdai.chainId]: parseUnits('0.1', 18),
  [NETWORKS.moonbeam.chainId]: parseUnits('0.1', 18),
};

export const getMinAmountForMaxDeduction = (chainId: number) =>
  MIN_AMOUNT_FOR_MAX_DEDUCTION[chainId] || parseUnits('0.1', 18);
export const getMaxDeduction = (chainId: number) => MAX_DEDUCTION[chainId] || parseUnits('0.045', 18);
