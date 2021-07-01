export const DAI = {
  chainId: 1,
  decimals: 18,
  address:
    process.env.ETH_NETWORK === 'mainnet'
      ? '0x6b175474e89094c44da98b954eedeac495271d0f'
      : '0xad6d458402f60fd3bd25163575031acdce07538d',
  name: 'Dai stable coin',
  symbol: 'DAI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
};

export const WETH = {
  chainId: 1,
  decimals: 18,
  address:
    process.env.ETH_NETWORK === 'mainnet'
      ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      : '0xc778417e063141139fce010982780140aa0cd5ab',
  name: 'Wrapped Ether',
  symbol: 'WETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
};

export const ETH = {
  chainId: 1,
  decimals: 18,
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  name: 'Ether',
  symbol: 'ETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
};

export const UNI = {
  chainId: 1,
  decimals: 18,
  address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  name: 'Uniswap',
  symbol: 'UNI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
};

export const YFI = {
  chainId: 1,
  decimals: 18,
  address: '0x99fda92878c1d2f1e0971d1937c50cc578a33e3d',
  name: 'Yearn Finance',
  symbol: 'YFI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
};

export const USDC = {
  chainId: 1,
  decimals: 18,
  address: '0x1349806aee89aa7acb7c321e7ce0a4f0dbdaafa4',
  name: 'USD Coin',
  symbol: 'USDC',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
};
