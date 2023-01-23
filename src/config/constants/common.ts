import { BigNumber } from 'ethers/lib/ethers';

export const MAX_UINT_32 = 4294967295;

export const MAX_BI = BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639935');

type PositionVersion1Type = '1';
type PositionVersion2Type = '2';
type PositionVersion3Type = '3';
type PositionVersion4Type = '4';
export const POSITION_VERSION_1: PositionVersion1Type = '1'; // BETA
export const POSITION_VERSION_2: PositionVersion2Type = '2'; // VULN
export const POSITION_VERSION_3: PositionVersion3Type = '3'; // POST-VULN
export const POSITION_VERSION_4: PositionVersion4Type = '4'; // Yield

export type PositionVersions =
  | PositionVersion1Type
  | PositionVersion2Type
  | PositionVersion3Type
  | PositionVersion4Type;

export const OLD_VERSIONS: PositionVersions[] = [POSITION_VERSION_1, POSITION_VERSION_2, POSITION_VERSION_3];

export const LATEST_VERSION: PositionVersions = POSITION_VERSION_4;

export const VERSIONS_ALLOWED_MODIFY: PositionVersions[] = [POSITION_VERSION_4];

// export const POSITIONS_VERSIONS: PositionVersions[] = [POSITION_VERSION_2, POSITION_VERSION_3, POSITION_VERSION_4];
export const POSITIONS_VERSIONS: PositionVersions[] = [
  POSITION_VERSION_1,
  POSITION_VERSION_2,
  POSITION_VERSION_3,
  POSITION_VERSION_4,
];

export const TOKEN_TYPE_BASE = 'BASE';
export const TOKEN_TYPE_WRAPPED = 'WRAPPED_PROTOCOL_TOKEN';
export const TOKEN_TYPE_YIELD_BEARING_SHARES = 'YIELD_BEARING_SHARES';

export const TOKEN_BLACKLIST = [
  '0x5fe2b58c013d7601147dcdd68c143a77499f5531', // POLY - GRT
  '0x50b728d8d964fd00c2d0aad81718b71311fef68a', // POLY - SNX
  '0x65559aa14915a70190438ef90104769e5e890a00', // OE - ENS
  '0x289ba1701c2f088cf0faf8b3705246331cb8a839', // ARBI - LPT. Disabled due to liquidity decrease
  '0x1dd5629903441b2dd0d03f76ec7673add920e765', // POLY - jEUR. Disabled due to aave not supporting anymore
];
