import { TransactionActionType, PositionVersions } from '@types';

export const MAX_UINT_32 = 4294967295;

export const {
  POSITION_VERSION_1, // BETA
  POSITION_VERSION_2, // VULN
  POSITION_VERSION_3, // POST-VULN
  POSITION_VERSION_4, // Yield
} = PositionVersions; // BETA

export const OLD_VERSIONS: PositionVersions[] = [
  PositionVersions.POSITION_VERSION_1,
  POSITION_VERSION_2,
  POSITION_VERSION_3,
];

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
export const TOKEN_TYPE_YIELD_BEARING_SHARES = 'YIELD_BEARING_SHARE';

export const INDEX_TO_SPAN = [24, 42, 30];

export const INDEX_TO_PERIOD = ['1h', '4h', '1d'];

export const TRANSACTION_ACTION_APPROVE_TOKEN = 'APPROVE_TOKEN';
export const TRANSACTION_ACTION_APPROVE_TOKEN_SIGN = 'APPROVE_TOKEN_SIGN';
export const TRANSACTION_ACTION_WAIT_FOR_APPROVAL = 'WAIT_FOR_APPROVAL';
export const TRANSACTION_ACTION_WAIT_FOR_SIGN_APPROVAL = 'WAIT_FOR_SIGN_APPROVAL';
export const TRANSACTION_ACTION_WAIT_FOR_SIMULATION = 'WAIT_FOR_SIMULATION';
export const TRANSACTION_ACTION_SWAP = 'SWAP';

export const TRANSACTION_ACTION_TYPES: Record<TransactionActionType, TransactionActionType> = {
  [TRANSACTION_ACTION_APPROVE_TOKEN]: TRANSACTION_ACTION_APPROVE_TOKEN,
  [TRANSACTION_ACTION_APPROVE_TOKEN_SIGN]: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN,
  [TRANSACTION_ACTION_WAIT_FOR_APPROVAL]: TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
  [TRANSACTION_ACTION_SWAP]: TRANSACTION_ACTION_SWAP,
  [TRANSACTION_ACTION_WAIT_FOR_SIGN_APPROVAL]: TRANSACTION_ACTION_WAIT_FOR_SIGN_APPROVAL,
  [TRANSACTION_ACTION_WAIT_FOR_SIMULATION]: TRANSACTION_ACTION_WAIT_FOR_SIMULATION,
};

export const TOKEN_BLACKLIST = [
  '0x2e9a6df78e42a30712c10a9dc4b1c8656f8f2879', // ARBITRUM - Malicious MKR
  '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000', // OP - WTF optimism
];

export const DCA_PAIR_BLACKLIST = [
  '0xa7a7ffe0520e90491e58c9c77f78d7cfc32d019e-0xd125443f38a69d776177c2b9c041f462936f8218', // POLY - FBX/waWETH
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xd125443f38a69d776177c2b9c041f462936f8218', // POLY - FBX/WETH
];

export const DCA_TOKEN_BLACKLIST = [
  '0x5fe2b58c013d7601147dcdd68c143a77499f5531', // POLY - GRT
  '0x50b728d8d964fd00c2d0aad81718b71311fef68a', // POLY - SNX
  '0x65559aa14915a70190438ef90104769e5e890a00', // OE - ENS
  '0x289ba1701c2f088cf0faf8b3705246331cb8a839', // ARBI - LPT. Disabled due to liquidity decrease
  '0x1dd5629903441b2dd0d03f76ec7673add920e765', // POLY - jEUR. Disabled due to aave not supporting anymore
  '0x5d47baba0d66083c52009271faf3f50dcc01023c', // OP - UNIDEX. Disabled due to liquidity moved to velodrome
  '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000', // OP - WTF optimism
  '0x2760e46d9bb43dafcbecaad1f64b93207f9f0ed7', // POLY - MVX
  // TODO: Remove this once we check beefy works correctly
  '0xf0cbbfad265a0e7c7e4fd2e1e6027a8dfa25676b', // OP - WBTC Beefy wrapper
  '0x72b25ce2f946c95a2194f5ac3322443d0057bc94', // OP - DAI Beefy wrapper
  '0x185d3a08140efaeb3c6bf173e751afb0bcb0d0c6', // OP - USDC Beefy wrapper
  '0xaab6af05e12faae0a5d9597c79588846f0df15b8', // POLY - MVX optimism Beefy wrapper
  '0xe0b52e49357fd4daf2c15e02058dce6bc0057db4', // POLY - AGEUR

  '0xcd0e5871c97c663d43c62b5049c123bb45bfe2cc', // ETH - USDC. Euler. Disabled due to hack.
  '0xd4de9d2fc1607d1df63e1c95ecbfa8d7946f5457', // ETH - WETH. Euler. Disabled due to hack.
  '0xc4113b7605d691e073c162809060b6c5ae402f1e', // ETH - DAI. Euler. Disabled due to hack.
  '0x48e345cb84895eab4db4c44ff9b619ca0be671d9', // ETH - WBTC. Euler. Disabled due to hack.
  '0xb95e6eee428902c234855990e18a632fa34407dc', // ETH - LUSD. Euler. Disabled due to hack.
  '0x7c6d161b367ec0605260628c37b8dd778446256b', // ETH - wstETH. Euler. Disabled due to hack.

  '0x57f93e3fcb2b7ef126aeeda1f959c9ee4625aa70', // OP - MAI Aave v3 - missing defi llama id
  '0x348a1213fa28a43855e5bb103bdfd7f357543626', // OP - OP Aave v3
  '0x1622bf67e6e5747b81866fe0b85178a93c7f86e3', // ARBI - UMAMI
  '0x1bbc5845e7e2000938c840f0343a975269c348ef', // Yearn - WBTC
  '0x296f55f8fb28e498b858d0bcda06d955b2cb3f97', // OP - STG
  '0x18c46621af7cbcdf58b155517d22b4ae7c5f2cd1', // POLY - wstEth Aave
  '0xf2f77fe7b8e66571e0fca7104c4d670bf1c8d722', // POLY - jBRL
  '0xbd1fe73e1f12bd2bc237de9b626f056f21f86427', // POLY - jMXN
  '0x250632378e573c6be1ac2f97fcdf00515d0aa91b', // BSC - BETH

  // Arbitrum - FRAX - Blacklisting so we can test it out
  '0x17fc002b466eec40dae837fc4be5c67993ddbd6f',
  // Arbitrum - GMD - Blacklisting so we can test it out
  '0x4945970efeec98d393b4b979b9be265a3ae28a8b',
  // BNB - Beefy ETH on Valas - Blacklisting so we can test it out
  '0x353699126117ba6ed8f5d5928dfa797564e99e40',
  // BNB - Beefy BTCB on Valas - Blacklisting so we can test it out
  '0xea35aae53b30465f7362d5ebcb5d3ba01e17926e',
  // BNB - Beefy BUSD on Valas - Blacklisting so we can test it out
  '0x45c53c0068bf31715fb41685bab59fd0bbc387f9',
  // Polygon - Beefy maticX on Aave - Blacklisting so we can test it out
  '0xfc4c2e8b2c1655693f520e8115b95b057ac2d95b',
  // Polygon - Beefy GNS on Gains - Blacklisting so we can test it out
  '0xb57f7f48b88ab6041e7d0a7ec28e8b4671094b12',
];

export const DISABLED_YIELD_WITHDRAWS = [
  '0xcd0e5871c97c663d43c62b5049c123bb45bfe2cc', // ETH - USDC. Euler. Disabled due to hack.
  '0xd4de9d2fc1607d1df63e1c95ecbfa8d7946f5457', // ETH - WETH. Euler. Disabled due to hack.
  '0xc4113b7605d691e073c162809060b6c5ae402f1e', // ETH - DAI. Euler. Disabled due to hack.
  '0x48e345cb84895eab4db4c44ff9b619ca0be671d9', // ETH - WBTC. Euler. Disabled due to hack.
  '0xb95e6eee428902c234855990e18a632fa34407dc', // ETH - LUSD. Euler. Disabled due to hack.
  '0x7c6d161b367ec0605260628c37b8dd778446256b', // ETH - wstETH. Euler. Disabled due to hack.
];

export const WALLET_CONNECT_PROJECT_ID = '052f72d940052c096c832ee451b63a14';
