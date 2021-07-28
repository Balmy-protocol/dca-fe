const DAI_ADDRESSES = {
  mainnet: '0x6b175474e89094c44da98b954eedeac495271d0f',
  ropsten: '0xad6d458402f60fd3bd25163575031acdce07538d',
  rinkeby: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
  meanfinance: '0x6b175474e89094c44da98b954eedeac495271d0f',
};

export const DAI = {
  chainId: 1,
  decimals: 18,
  address: DAI_ADDRESSES[process.env.ETH_NETWORK as keyof typeof DAI_ADDRESSES],
  name: 'Dai stable coin',
  symbol: 'DAI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};

const WETH_ADDRESSES = {
  mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  ropsten: '0xc778417e063141139fce010982780140aa0cd5ab',
  rinkeby: '0xc778417e063141139fce010982780140aa0cd5ab',
  meanfinance: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
};

export const WETH = {
  chainId: 1,
  decimals: 18,
  address: WETH_ADDRESSES[process.env.ETH_NETWORK as keyof typeof WETH_ADDRESSES],
  name: 'Wrapped Ether',
  symbol: 'WETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};

export const ETH = {
  chainId: 1,
  decimals: 18,
  address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  name: 'Ethereum',
  symbol: 'ETH',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};

const UNI_ADDRESSES = {
  mainnet: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  ropsten: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  rinkeby: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  meanfinance: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
};

export const UNI = {
  chainId: 1,
  decimals: 18,
  address: UNI_ADDRESSES[process.env.ETH_NETWORK as keyof typeof UNI_ADDRESSES],
  name: 'Uniswap',
  symbol: 'UNI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};

const YFI_ADDRESSES = {
  mainnet: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  ropsten: '0x08936fec5deeaf0cc92ad3e4b0cda2b934451785',
  rinkeby: '0x664d6fdcbfc04bb8459c593112daff546653bf3b',
  meanfinance: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
};

export const YFI = {
  chainId: 1,
  decimals: 18,
  address: YFI_ADDRESSES[process.env.ETH_NETWORK as keyof typeof YFI_ADDRESSES],
  name: 'Yearn Finance',
  symbol: 'YFI',
  logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  pairableTokens: [],
};
