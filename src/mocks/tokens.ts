export const DAI = {
  chainId: 1,
  decimals: 18,
  address:
    process.env.ETH_NETWORK === 'mainnet'
      ? '0x6b175474e89094c44da98b954eedeac495271d0f'
      : '0xD04Fc1C35cd00F799d6831E33978F302FE861789',
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
      : '0x19B7F4424106a5A15d50043Ad92D8f4066FF2687',
  name: 'Wrapped Ether',
  symbol: 'WETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
};
