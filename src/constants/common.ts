import { TransactionActionType, PositionVersions } from '@types';
import { BigNumber } from 'ethers';

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
  '0x2e9a6df78e42a30712c10a9dc4b1c8656f8f2879', // Arbitrum - Malicious MKR
  '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000', // Optimism - WTF optimism
];

export const DCA_PAIR_BLACKLIST = [
  '0xa7a7ffe0520e90491e58c9c77f78d7cfc32d019e-0xd125443f38a69d776177c2b9c041f462936f8218', // Polygon - FBX/waWETH
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xd125443f38a69d776177c2b9c041f462936f8218', // Polygon - FBX/WETH
];

export const DCA_TOKEN_BLACKLIST = [
  '0x5fe2b58c013d7601147dcdd68c143a77499f5531', // Polygon - GRT
  '0x50b728d8d964fd00c2d0aad81718b71311fef68a', // Polygon - SNX
  '0x65559aa14915a70190438ef90104769e5e890a00', // Optimism - ENS
  '0x289ba1701c2f088cf0faf8b3705246331cb8a839', // Arbitrum - LPT. Disabled due to liquidity decrease
  '0x1dd5629903441b2dd0d03f76ec7673add920e765', // Polygon - jEUR. Disabled due to aave not supporting anymore
  '0x5d47baba0d66083c52009271faf3f50dcc01023c', // Optimism - UNIDEX. Disabled due to liquidity moved to velodrome
  '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000', // Optimism - WTF optimism
  '0x2760e46d9bb43dafcbecaad1f64b93207f9f0ed7', // Polygon - MVX
  // TODO: Remove this once we check beefy works correctly
  '0xf0cbbfad265a0e7c7e4fd2e1e6027a8dfa25676b', // Optimism - WBTC Beefy wrapper
  '0x72b25ce2f946c95a2194f5ac3322443d0057bc94', // Optimism - DAI Beefy wrapper
  '0x185d3a08140efaeb3c6bf173e751afb0bcb0d0c6', // Optimism - USDC Beefy wrapper
  '0xaab6af05e12faae0a5d9597c79588846f0df15b8', // Polygon - MVX optimism Beefy wrapper
  '0xe0b52e49357fd4daf2c15e02058dce6bc0057db4', // Polygon - AGEUR

  '0xcd0e5871c97c663d43c62b5049c123bb45bfe2cc', // Ethereum - USDC. Euler. Disabled due to hack.
  '0xd4de9d2fc1607d1df63e1c95ecbfa8d7946f5457', // Ethereum - WETH. Euler. Disabled due to hack.
  '0xc4113b7605d691e073c162809060b6c5ae402f1e', // Ethereum - DAI. Euler. Disabled due to hack.
  '0x48e345cb84895eab4db4c44ff9b619ca0be671d9', // Ethereum - WBTC. Euler. Disabled due to hack.
  '0xb95e6eee428902c234855990e18a632fa34407dc', // Ethereum - LUSD. Euler. Disabled due to hack.
  '0x7c6d161b367ec0605260628c37b8dd778446256b', // Ethereum - wstETH. Euler. Disabled due to hack.

  '0x57f93e3fcb2b7ef126aeeda1f959c9ee4625aa70', // Optimism - MAI Aave v3 - missing defi llama id
  '0x348a1213fa28a43855e5bb103bdfd7f357543626', // Optimism - OP Aave v3
  '0x1622bf67e6e5747b81866fe0b85178a93c7f86e3', // Arbitrum - UMAMI
  '0x1bbc5845e7e2000938c840f0343a975269c348ef', // Optimism - Yearn - WBTC
  '0x296f55f8fb28e498b858d0bcda06d955b2cb3f97', // Optimism - STG
  '0x18c46621af7cbcdf58b155517d22b4ae7c5f2cd1', // Polygon - wstEth Aave
  '0xf2f77fe7b8e66571e0fca7104c4d670bf1c8d722', // Polygon - jBRL
  '0xbd1fe73e1f12bd2bc237de9b626f056f21f86427', // Polygon - jMXN
  '0x250632378e573c6be1ac2f97fcdf00515d0aa91b', // BNB Chain - BETH
  // BNB Chain - Beefy BUSD Valas - Blacklisting bc of terrible yield design
  '0x45c53c0068bf31715fb41685bab59fd0bbc387f9',
  // BNB Chain - Beefy ETH Valas - Blacklisting bc of terrible yield design
  '0x353699126117ba6ed8f5d5928dfa797564e99e40',
  // BNB Chain - Beefy BTCB Valas - Blacklisting bc of terrible yield design
  '0xea35aae53b30465f7362d5ebcb5d3ba01e17926e',
  // BNB Chain - Beefy USDC on Valas - Blacklisting so we can test it out
  '0x02d7eea2c017479ad319a0f24d6ad7a07f701d9d',
  // BNB Chain - Beefy DAI on Valas - Blacklisting so we can test it out
  '0x1f2ae034a096f8e3faf8216d3843075474558773',
  // Polygon - Beefy maticX on Aave - Blacklisting so we can test it out
  '0xfc4c2e8b2c1655693f520e8115b95b057ac2d95b',
  // Polygon - Beefy GNS on Gains - Blacklisting so we can test it out
  '0xb57f7f48b88ab6041e7d0a7ec28e8b4671094b12',
  '0x1A5B0aaF478bf1FDA7b934c76E7692D722982a6D', // Abitrum - BFR
  '0x1debd73e752beaf79865fd6446b0c970eae7732f', // Arbitrum - CBETH
  '0x2bcf2a8c5f9f8b45ece5ba11d8539780fc15cb11', // Polygon - CRV
  '0x1dd5629903441b2dd0d03f76ec7673add920e765', // Polygon - jEUR
  '0xcd0e5871c97c663d43c62b5049c123bb45bfe2cc', // Ethereum - USDC. Euler. Disabled due to hack.
  '0xd4de9d2fc1607d1df63e1c95ecbfa8d7946f5457', // Ethereum - WETH. Euler. Disabled due to hack.
  '0xc4113b7605d691e073c162809060b6c5ae402f1e', // Ethereum - DAI. Euler. Disabled due to hack.
  '0x48e345cb84895eab4db4c44ff9b619ca0be671d9', // Ethereum - WBTC. Euler. Disabled due to hack.
  '0xb95e6eee428902c234855990e18a632fa34407dc', // Ethereum - LUSD. Euler. Disabled due to hack.
  '0x7c6d161b367ec0605260628c37b8dd778446256b', // Ethereum - wstETH. Euler. Disabled due to hack.
  '0x1bbc5845e7e2000938c840f0343a975269c348ef', // Yearn - WBTC
  '0x7597f9b2944809de4e5a841d6fa5e499099a5a42', // Arbitrum - MAI. Aave. Has less than 10k TVL so no defillama data.
  '0x7597f9b2944809de4e5a841d6fa5e499099a5a42', // Arbitrum - GMD - Blacklisting until release
  '0x5ea1f5eb87ef6564ff8efc101ec3b24fab5583b4', // BNB Chain - Venus USDC - Blacklisting until release
  '0xC721aa11BaA89Df3cF59dE754a8a891EFc64f2EF', // BNB Chain - Venus USDT - Blacklisting until release
  '0xc2327D99C09a7fd60b423C96Dd76573546f1885E', // BNB Chain - Venus BUSD - Blacklisting until release
  '0xFf8Beda0C55Bf0e6963e8Ae986d76479BdEA9D4B', // BNB Chain - Venus BTCB - Blacklisting until release
  '0x50aE1B194d9e030c98405545EBa295319B49cA33', // BNB Chain - Venus ETH - Blacklisting until release
  '0x319d8497F6d8e5408A93e46538A681980F5DEEA5', // BNB Chain - Venus DAI - Blacklisting until release
  // --
  '0xB562CC5300e2Dd51f9770923b52cE5F372f97a0e', // BNB Chain - Venus ADA - Blacklisting until release
  '0xc492eA9B5D9e3f4188a6c57F5F146dbfa37AC6D6', // BNB Chain - Venus CAKE - Blacklisting until release
  '0xf3638ACAc71740e55C14d99e288F10ba4EDef348', // BNB Chain - Venus MATIC - Blacklisting until release
  '0x69B8FdEd983a19C81bbF8b0Ea21e702395bb6E36', // BNB Chain - Venus DOT - Blacklisting until release
  '0x0BADC4caa20E84e25e26a54CeC3faFeBcC7AB085', // BNB Chain - Venus DOGE - Blacklisting until release
  '0xa2b783bB283cA621f32a8792FFE4A10ad817C039', // BNB Chain - Venus XRP - Blacklisting until release
].map((a) => a.toLowerCase());

export const DISABLED_YIELD_WITHDRAWS = [
  '0xcd0e5871c97c663d43c62b5049c123bb45bfe2cc', // ETH - USDC. Euler. Disabled due to hack.
  '0xd4de9d2fc1607d1df63e1c95ecbfa8d7946f5457', // ETH - WETH. Euler. Disabled due to hack.
  '0xc4113b7605d691e073c162809060b6c5ae402f1e', // ETH - DAI. Euler. Disabled due to hack.
  '0x48e345cb84895eab4db4c44ff9b619ca0be671d9', // ETH - WBTC. Euler. Disabled due to hack.
  '0xb95e6eee428902c234855990e18a632fa34407dc', // ETH - LUSD. Euler. Disabled due to hack.
  '0x7c6d161b367ec0605260628c37b8dd778446256b', // ETH - wstETH. Euler. Disabled due to hack.
].map((a) => a.toLowerCase());

export const WALLET_CONNECT_PROJECT_ID = '052f72d940052c096c832ee451b63a14';

export const PERMIT_2_WORDS = [
  26796124394618, 127929636361453, 170674725395413, 245314029271115, 112668572444312, 160360459603706, 81390189777037,
  45971267251243, 192306453693214, 70077137466196,
];
