import { parseUnits } from '@ethersproject/units';
import { getProtocolToken } from 'mocks/tokens';
import { NETWORKS } from './addresses';

export const MIN_AMOUNT_FOR_MAX_DEDUCTION = {
  [NETWORKS.polygon.chainId]: parseUnits('0.1', getProtocolToken(NETWORKS.polygon.chainId).decimals),
  [NETWORKS.arbitrum.chainId]: parseUnits('0.001', getProtocolToken(NETWORKS.arbitrum.chainId).decimals),
  [NETWORKS.optimism.chainId]: parseUnits('0.001', getProtocolToken(NETWORKS.optimism.chainId).decimals),
  [NETWORKS.mainnet.chainId]: parseUnits('0.1', getProtocolToken(NETWORKS.mainnet.chainId).decimals),
};

export const MAX_DEDUCTION = {
  [NETWORKS.polygon.chainId]: parseUnits('0.045', getProtocolToken(NETWORKS.polygon.chainId).decimals),
  [NETWORKS.arbitrum.chainId]: parseUnits('0.00015', getProtocolToken(NETWORKS.arbitrum.chainId).decimals),
  [NETWORKS.optimism.chainId]: parseUnits('0.000525', getProtocolToken(NETWORKS.optimism.chainId).decimals),
  [NETWORKS.mainnet.chainId]: parseUnits('0.021', getProtocolToken(NETWORKS.mainnet.chainId).decimals),
};
