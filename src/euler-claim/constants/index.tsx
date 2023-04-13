import { toToken } from 'utils/currency';

export const EULER_4626_ADDRESSES = [
  '0xcd0e5871c97c663d43c62b5049c123bb45bfe2cc', // ETH - USDC. Euler. Disabled due to hack.
  '0xd4de9d2fc1607d1df63e1c95ecbfa8d7946f5457', // ETH - WETH. Euler. Disabled due to hack.
  '0xc4113b7605d691e073c162809060b6c5ae402f1e', // ETH - DAI. Euler. Disabled due to hack.
  '0x48e345cb84895eab4db4c44ff9b619ca0be671d9', // ETH - WBTC. Euler. Disabled due to hack.
  '0xb95e6eee428902c234855990e18a632fa34407dc', // ETH - LUSD. Euler. Disabled due to hack.
  '0x7c6d161b367ec0605260628c37b8dd778446256b', // ETH - wstETH. Euler. Disabled due to hack.
];

export const EULER_4626_SYMBOLS = {
  '0xcd0e5871c97c663d43c62b5049c123bb45bfe2cc': 'weUSDC',
  '0xd4de9d2fc1607d1df63e1c95ecbfa8d7946f5457': 'weWETH',
  '0xc4113b7605d691e073c162809060b6c5ae402f1e': 'weDAI',
  '0x48e345cb84895eab4db4c44ff9b619ca0be671d9': 'weWBTC',
  '0xb95e6eee428902c234855990e18a632fa34407dc': 'weLUSD',
  '0x7c6d161b367ec0605260628c37b8dd778446256b': 'wewstETH',
};

export const EULER_4626_TOKENS = EULER_4626_ADDRESSES.map((address) =>
  toToken({ address, chainId: 1, decimals: 18, symbol: EULER_4626_SYMBOLS[address as keyof typeof EULER_4626_SYMBOLS] })
);

export const DAI = toToken({
  address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  chainId: 1,
  decimals: 18,
});
export const USDC = toToken({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  chainId: 1,
  decimals: 6,
});
export const WETH = toToken({
  address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  chainId: 1,
  decimals: 18,
});
