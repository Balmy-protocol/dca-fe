import { parseUnits } from '@ethersproject/units';
import { NETWORKS } from 'config';
import { toToken } from 'utils/currency';

export const CREATED_AT_STOP = 1677236400;
export const CREATED_AT_START = 1677063600;
export const JMXN_CUTOFF = parseUnits('2000', 18);
export const JMXN_ADDRESS = '0xbd1fe73e1f12bd2bc237de9b626f056f21f86427';
export const JMXN_TOKEN = toToken({ address: JMXN_ADDRESS, chainId: NETWORKS.polygon.chainId, decimals: 18 });
