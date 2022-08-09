import { BigNumber } from 'ethers/lib/ethers';

export const MAX_UINT_32 = 4294967295;

export const MAX_BI = BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639935');

type PositionVersion2Type = '2';
type PositionVersion3Type = '3';
type PositionVersion4Type = '4';
export const POSITION_VERSION_2: PositionVersion2Type = '2';
export const POSITION_VERSION_3: PositionVersion3Type = '3';
export const POSITION_VERSION_4: PositionVersion4Type = '4';

export type PositionVersions = PositionVersion2Type | PositionVersion3Type | PositionVersion4Type;

export const LATEST_VERSION: PositionVersions = POSITION_VERSION_4;

export const POSITIONS_VERSIONS: PositionVersions[] = [POSITION_VERSION_2, POSITION_VERSION_3, POSITION_VERSION_4];
