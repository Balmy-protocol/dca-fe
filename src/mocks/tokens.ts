export const DAI = {
  chainId: 1,
  decimals: 18,
  address:
    process.env.ETH_NETWORK === 'mainnet'
      ? '0x6b175474e89094c44da98b954eedeac495271d0f'
      : '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
  name: 'Dai stable coin',
  symbol: 'DAI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};

export const WETH = {
  chainId: 1,
  decimals: 18,
  address:
    process.env.ETH_NETWORK === 'mainnet'
      ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      : '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  name: 'Wrapped Ether',
  symbol: 'WETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};

export const ETH = {
  chainId: 1,
  decimals: 18,
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  name: 'Ether',
  symbol: 'ETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};

export const UNI = {
  chainId: 1,
  decimals: 18,
  address:
    process.env.ETH_NETWORK === 'mainnet'
      ? '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
      : '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  name: 'Uniswap',
  symbol: 'UNI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};

export const YFI = {
  chainId: 1,
  decimals: 18,
  address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  name: 'Yearn Finance',
  symbol: 'YFI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};

export const T0 = {
  chainId: 1,
  decimals: 18,
  address: '0xbae9e0f04435467a976eb3d3fdfa00f8502cb072',
  name: 'T0',
  symbol: 'T0',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};

export const USDC = {
  chainId: 1,
  decimals: 18,
  address: '0x1349806aee89aa7acb7c321e7ce0a4f0dbdaafa4',
  name: 'USD Coin',
  symbol: 'USDC',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};
