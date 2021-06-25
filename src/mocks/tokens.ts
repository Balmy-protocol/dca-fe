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
