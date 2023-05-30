import { parseUnits } from '@ethersproject/units';
import { NETWORKS } from '@constants';
import { toToken } from '@common/utils/currency';

export const CREATED_AT_STOP = 1682640000;
export const CREATED_AT_START = 1682467200;
export const JBRL_CUTOFF = parseUnits('500', 18);
export const JBRL_ADDRESS = '0xf2f77fe7b8e66571e0fca7104c4d670bf1c8d722';
export const JBRL_TOKEN = toToken({ address: JBRL_ADDRESS, chainId: NETWORKS.polygon.chainId, decimals: 18 });
export const POSITION_CUTOFF = 7;
