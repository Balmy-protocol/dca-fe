import { createReducer } from '@reduxjs/toolkit';
import find from 'lodash/find';
import { TokensLists, Token } from '@types';
import { toToken } from '@common/utils/currency';
import { addCustomToken, enableAllTokenList, enableDcaTokenList, fetchGraphTokenList, fetchTokenList } from './actions';

export interface TokenListsWithParser extends TokensLists {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parser?: (list: any) => Token[];
  chainId?: number;
}

export interface TokenListsState {
  byUrl: { [tokenListUrl: string]: TokenListsWithParser };
  activeDcaLists: string[];
  activeAllTokenLists: string[];
  hasLoaded: boolean;
  customTokens: TokensLists;
}

export const getDefaultByUrl = () => ({
  /* -------------------------------------------------------------------------- */
  /*                                   General                                  */
  /* -------------------------------------------------------------------------- */

  'https://raw.githubusercontent.com/Mean-Finance/token-list/main/mean-finance.tokenlist.json': {
    name: 'Mean Finance',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 99,
  },
  'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json': {
    name: 'Compound token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },
  'tokens.1inch.eth': {
    name: '1inch',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },
  'https://token-list.sushi.com/': {
    name: 'Sushiswap token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },
  'https://raw.githubusercontent.com/ethereum-optimism/ethereum-optimism.github.io/master/optimism.tokenlist.json': {
    name: 'Superchain token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },
  'https://api.joinwido.com/tokens?include_metadata=true&include_unknown=false&include_pricing=false&include_preview=false':
    {
      name: 'Wido',
      logoURI: '',
      timestamp: new Date().getTime(),
      tokens: [],
      version: { major: 0, minor: 0, patch: 0 },
      hasLoaded: false,
      requestId: '',
      fetchable: true,
      priority: 0,
      parser: (list: { tokens: (Token & { protocol?: string })[] }) =>
        list.tokens.filter((token) => token.protocol && token.protocol !== 'dex'),
    },
  'https://li.quest/v1/tokens': {
    name: 'Li.fi',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
    parser: (list: { tokens: Record<string, Token[]> }) =>
      Object.values(list.tokens)
        .reduce(
          (acc, token) => [
            ...acc,
            ...token.map(toToken),
            // Modifiy with all chains that we want tokens from,
          ],
          []
        )
        .filter((token) => [1101, 8453].includes(token.chainId)),
  },

  /* -------------------------------------------------------------------------- */
  /*                                    Canto                                   */
  /* -------------------------------------------------------------------------- */

  'https://raw.githubusercontent.com/Canto-Network/list/main/lists/token-lists/mainnet/tokens.json': {
    name: 'Canto list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 7700,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },

  /* -------------------------------------------------------------------------- */
  /*                                     Base Goerli                            */
  /* -------------------------------------------------------------------------- */
  'https://api.odos.xyz/info/tokens/84531': {
    name: 'Odos Base Goerli token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 84531,
    priority: 0,
    parser: (list: { tokenMap: Record<string, Token> }) =>
      Object.entries(list.tokenMap).map(([key, token]) =>
        toToken({ ...token, address: key, logoURI: `https://assets.odos.xyz/tokens/${token.symbol}.webp` })
      ),
  },
  /* -------------------------------------------------------------------------- */
  /*                                     Base                            */
  /* -------------------------------------------------------------------------- */
  'https://api.odos.xyz/info/tokens/8453': {
    name: 'Odos Base token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 8453,
    priority: 0,
    parser: (list: { tokenMap: Record<string, Token> }) =>
      Object.entries(list.tokenMap).map(([key, token]) =>
        toToken({ ...token, address: key, logoURI: `https://assets.odos.xyz/tokens/${token.symbol}.webp` })
      ),
  },
  /* -------------------------------------------------------------------------- */
  /*                                     Polygon ZkEvm                            */
  /* -------------------------------------------------------------------------- */
  'https://api.odos.xyz/info/tokens/1101': {
    name: 'Odos Polygon ZkEvm token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 1101,
    priority: 0,
    parser: (list: { tokenMap: Record<string, Token> }) =>
      Object.entries(list.tokenMap).map(([key, token]) =>
        toToken({ ...token, address: key, logoURI: `https://assets.odos.xyz/tokens/${token.symbol}.webp` })
      ),
  },

  'https://api-polygon-tokens.polygon.technology/tokenlists/zkevmPopular.tokenlist.json': {
    name: 'Polygon zkEVM list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 1101,
    priority: 0,
  },

  /* -------------------------------------------------------------------------- */
  /*                                     BNB                                    */
  /* -------------------------------------------------------------------------- */

  'https://tokens.1inch.io/v1.2/56': {
    name: '1Inch BSC',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 56,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },

  /* -------------------------------------------------------------------------- */
  /*                                   Fantom                                   */
  /* -------------------------------------------------------------------------- */

  'https://tokens.1inch.io/v1.2/250': {
    name: '1Inch FANTOM',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 250,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },

  // Avalanche
  'https://tokens.1inch.io/v1.2/43114': {
    name: '1Inch AVALANCHE',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 43114,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },

  /* -------------------------------------------------------------------------- */
  /*                                  Arbitrum                                  */
  /* -------------------------------------------------------------------------- */

  'https://tokens.1inch.io/v1.2/42161': {
    name: '1Inch Arbitrum',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 42161,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },

  /* -------------------------------------------------------------------------- */
  /*                                   Polygon                                  */
  /* -------------------------------------------------------------------------- */

  'https://tokens.1inch.io/v1.2/137': {
    name: '1Inch Polygon',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 137,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },

  /* -------------------------------------------------------------------------- */
  /*                                    Celo                                    */
  /* -------------------------------------------------------------------------- */

  'https://celo-org.github.io/celo-token-list/celo.tokenlist.json': {
    name: 'Celo token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },

  /* -------------------------------------------------------------------------- */
  /*                                     CRO                                    */
  /* -------------------------------------------------------------------------- */

  'https://swap.crodex.app/tokens.json': {
    name: 'Cronos',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },
  'https://raw.githubusercontent.com/cronaswap/default-token-list/main/assets/tokens/cronos.json': {
    name: 'Cronos cronaswap',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 25,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: Token[]) => list,
  },

  /* -------------------------------------------------------------------------- */
  /*                                  Moonbeam                                  */
  /* -------------------------------------------------------------------------- */

  'https://raw.githubusercontent.com/BeamSwap/beamswap-tokenlist/main/tokenlist.json': {
    name: 'Beamswap Moonbeam token list',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },

  /* -------------------------------------------------------------------------- */
  /*                                    EVMOS                                   */
  /* -------------------------------------------------------------------------- */

  'https://raw.githubusercontent.com/evmoswap/default-token-list/main/assets/tokens/evmos.json': {
    name: 'EVMOS Swap',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 9001,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },
  'https://raw.githubusercontent.com/SpaceFinance/default-token-list/main/spaceswap.tokenlist.json': {
    name: 'Space Finance',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },

  /* -------------------------------------------------------------------------- */
  /*                                   Aurora                                   */
  /* -------------------------------------------------------------------------- */

  'https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=1313161554&isWhitelisted=true&pageSize=100&page=1': {
    name: 'Kyberswap aurora',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 1313161554,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: { data: { tokens: Token[] } }) => list.data.tokens,
  },

  /* -------------------------------------------------------------------------- */
  /*                                    Oasis                                   */
  /* -------------------------------------------------------------------------- */

  'https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=42262&isWhitelisted=true&pageSize=100&page=1': {
    name: 'Kyberswap oasis',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 42262,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: { data: { tokens: Token[] } }) => list.data.tokens,
  },

  /* -------------------------------------------------------------------------- */
  /*                                   Klatyn                                   */
  /* -------------------------------------------------------------------------- */

  'https://tokens.1inch.io/v1.2/8217': {
    name: '1Inch Klaytn',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 8217,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },

  /* -------------------------------------------------------------------------- */
  /*                                   Aurora                                   */
  /* -------------------------------------------------------------------------- */

  'https://tokens.1inch.io/v1.2/1313161554': {
    name: '1Inch Aurora',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 1313161554,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) => Object.values(list as Record<string, Token>),
  },

  /* -------------------------------------------------------------------------- */
  /*                                Boba Ethereum                               */
  /* -------------------------------------------------------------------------- */

  'https://raw.githubusercontent.com/OolongSwap/boba-community-token-list/main/build/boba.tokenlist.json': {
    name: 'OolongSwap',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },

  /* -------------------------------------------------------------------------- */
  /*                                   Gnosis                                   */
  /* -------------------------------------------------------------------------- */

  'https://unpkg.com/@1hive/default-token-list@latest/build/honeyswap-default.tokenlist.json': {
    name: 'HoneySwap',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },
  'https://files.cow.fi/tokens/CowSwap.json': {
    name: 'CowSwap',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },
  'https://tokens.1inch.io/v1.2/100': {
    name: '1Inch xDAI',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    chainId: 100,
    priority: 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parser: (list: TokensLists) =>
      Object.values(list as unknown as Record<string, Token>).filter((entry) => !entry.name.includes('RealToken')),
  },

  /* -------------------------------------------------------------------------- */
  /*                                    Velas                                   */
  /* -------------------------------------------------------------------------- */

  'https://raw.githubusercontent.com/wagyuswapapp/wagyu-frontend/wag/src/config/constants/tokenLists/pancake-default.tokenlist.json':
    {
      name: 'WagyuSwap',
      logoURI: '',
      timestamp: new Date().getTime(),
      tokens: [],
      version: { major: 0, minor: 0, patch: 0 },
      hasLoaded: false,
      requestId: '',
      fetchable: true,
      priority: 0,
    },
  'https://raw.githubusercontent.com/astroswapapp/astroswap-frontend/astro/src/config/constants/tokenLists/pancake-default.tokenlist.json':
    {
      name: 'AstroSwap',
      logoURI: '',
      timestamp: new Date().getTime(),
      tokens: [],
      version: { major: 0, minor: 0, patch: 0 },
      hasLoaded: false,
      requestId: '',
      fetchable: true,
      priority: 0,
    },
  'https://raw.githubusercontent.com/wavelength-velas/assets/main/generated/wavelength.tokenslist.json': {
    name: 'WaveLength',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: false,
    requestId: '',
    fetchable: true,
    priority: 0,
  },

  /* -------------------------------------------------------------------------- */
  /*                                    KAVA                                    */
  /* -------------------------------------------------------------------------- */

  // 'https://market-api.openocean.finance/v2/kava/token': {
  //   name: 'OpenOcean',
  //   logoURI: '',
  //   timestamp: new Date().getTime(),
  //   tokens: [],
  //   version: { major: 0, minor: 0, patch: 0 },
  //   hasLoaded: false,
  //   requestId: '',
  //   fetchable: true,
  //   chainId: 2222,
  //   priority: 0,
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   parser: (list: TokensLists) =>
  //     Object.values(list as unknown as Record<string, Token & { icon: string }>).map(({ decimals, name, address, symbol, icon }) => ({
  //       name,
  //       address,
  //       decimals,
  //       symbol,
  //       chainId: 2222,
  //       logoURI: icon,
  //     })),
  // },
});
export const initialState: TokenListsState = {
  activeDcaLists: ['Mean Finance Graph Allowed Tokens'],
  activeAllTokenLists: [
    // General
    'https://raw.githubusercontent.com/Mean-Finance/token-list/main/mean-finance.tokenlist.json',
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    'https://token-list.sushi.com/',
    'tokens.1inch.eth',
    'https://github.com/ethereum-optimism/ethereum-optimism.github.io/blob/master/optimism.tokenlist.json',
    'https://li.quest/v1/tokens',

    // Base Goerli
    'https://api.odos.xyz/info/tokens/84531',

    // Base
    'https://api.odos.xyz/info/tokens/8453',

    // Polygon ZkEvm
    'https://api.odos.xyz/info/tokens/1101',
    'https://api-polygon-tokens.polygon.technology/tokenlists/zkevmPopular.tokenlist.json',

    // BNB
    'https://tokens.1inch.io/v1.2/56',

    // Fantom
    'https://tokens.1inch.io/v1.2/250',

    // Avalanche
    'https://tokens.1inch.io/v1.2/43114',

    // Arbitrum
    'https://tokens.1inch.io/v1.2/42161',

    // Polygon
    'https://tokens.1inch.io/v1.2/137',

    // CRO
    'https://swap.crodex.app/tokens.json',
    'https://raw.githubusercontent.com/cronaswap/default-token-list/main/assets/tokens/cronos.json',

    // Oasis
    'https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=42262&isWhitelisted=true&pageSize=100&page=1',

    // Canto
    'https://raw.githubusercontent.com/Canto-Network/list/main/lists/token-lists/mainnet/tokens.json',

    // Moonbeam
    'https://raw.githubusercontent.com/BeamSwap/beamswap-tokenlist/main/tokenlist.json',

    // EVMOS
    'https://raw.githubusercontent.com/evmoswap/default-token-list/main/assets/tokens/evmos.json',
    'https://raw.githubusercontent.com/SpaceFinance/default-token-list/main/spaceswap.tokenlist.json',

    // Celo
    'https://celo-org.github.io/celo-token-list/celo.tokenlist.json',

    // Klatyn
    'https://tokens.1inch.io/v1.2/8217',

    // Aurora
    'https://tokens.1inch.io/v1.2/1313161554',
    'https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=1313161554&isWhitelisted=true&pageSize=100&page=1',

    // Boba Ethereum
    'https://raw.githubusercontent.com/OolongSwap/boba-community-token-list/main/build/boba.tokenlist.json',

    // Gnosis
    'https://files.cow.fi/tokens/CowSwap.json',
    'https://unpkg.com/@1hive/default-token-list@latest/build/honeyswap-default.tokenlist.json',
    'https://tokens.1inch.io/v1.2/100',

    // Velas
    'https://raw.githubusercontent.com/wagyuswapapp/wagyu-frontend/wag/src/config/constants/tokenLists/pancake-default.tokenlist.json',
    'https://raw.githubusercontent.com/astroswapapp/astroswap-frontend/astro/src/config/constants/tokenLists/pancake-default.tokenlist.json',
    'https://raw.githubusercontent.com/wavelength-velas/assets/main/generated/wavelength.tokenslist.json',

    // Custom tokens
    'custom-tokens',
  ],
  byUrl: getDefaultByUrl(),
  customTokens: {
    name: 'custom-tokens',
    logoURI: '',
    timestamp: new Date().getTime(),
    tokens: [],
    version: { major: 0, minor: 0, patch: 0 },
    hasLoaded: true,
    requestId: '',
    fetchable: true,
    priority: 0,
  },
  hasLoaded: false,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(enableDcaTokenList, (state, { payload: { tokenList, enabled } }) => {
      if (enabled && !state.activeDcaLists.includes(tokenList)) {
        state.activeDcaLists.push(tokenList);
      }
      if (!enabled && state.activeDcaLists.includes(tokenList)) {
        state.activeDcaLists = state.activeDcaLists.filter((item) => item !== tokenList);
      }
    })
    .addCase(enableAllTokenList, (state, { payload: { tokenList, enabled } }) => {
      if (enabled && !state.activeAllTokenLists.includes(tokenList)) {
        state.activeAllTokenLists.push(tokenList);
      }
      if (!enabled && state.activeAllTokenLists.includes(tokenList)) {
        state.activeAllTokenLists = state.activeAllTokenLists.filter((item) => item !== tokenList);
      }
    })
    .addCase(fetchTokenList.pending, (state, { meta: { requestId, arg } }) => {
      state.byUrl[arg].requestId = requestId;
    })
    .addCase(fetchTokenList.rejected, (state, { meta: { arg } }) => {
      state.byUrl[arg] = {
        ...state.byUrl[arg],
        tokens: [],
        hasLoaded: true,
      };
    })
    .addCase(fetchTokenList.fulfilled, (state, { payload, meta: { arg } }) => {
      let tokens = [];

      try {
        if (state.byUrl[arg].parser) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tokens = state.byUrl[arg].parser(payload as unknown as TokensLists);
        } else {
          tokens = payload.tokens;
        }

        const mappedTokens: Token[] = tokens
          .filter((token) => !!token.address)
          .map<Token>((token) => ({
            ...token,
            address: token.address.toLowerCase(),
            chainId: state.byUrl[arg].chainId || token.chainId,
          }));

        state.byUrl[arg] = {
          ...state.byUrl[arg],
          ...payload,
          tokens: mappedTokens,
          hasLoaded: true,
        };
      } catch {
        state.byUrl[arg] = {
          ...state.byUrl[arg],
          ...payload,
          tokens: [],
          hasLoaded: true,
        };
      }
    })
    .addCase(fetchGraphTokenList.pending, (state, { meta: { requestId } }) => {
      state.byUrl['Mean Finance Graph Allowed Tokens'] = {
        name: 'Mean Finance',
        logoURI: '',
        timestamp: new Date().getTime(),
        tokens: [
          ...((state.byUrl['Mean Finance Graph Allowed Tokens'] &&
            state.byUrl['Mean Finance Graph Allowed Tokens'].tokens) ||
            []),
        ],
        version: { major: 0, minor: 0, patch: 0 },
        hasLoaded: false,
        requestId,
        fetchable: false,
        priority: 98,
      };
    })
    .addCase(fetchGraphTokenList.fulfilled, (state, { payload }) => {
      state.byUrl['Mean Finance Graph Allowed Tokens'] = {
        ...state.byUrl['Mean Finance Graph Allowed Tokens'],
        tokens: [...state.byUrl['Mean Finance Graph Allowed Tokens'].tokens, ...payload],
        hasLoaded: true,
      };
    })
    .addCase(addCustomToken, (state, { payload }) => {
      const foundToken = find(state.customTokens.tokens, { address: payload.address.toLowerCase() });

      if (!foundToken) {
        state.customTokens.tokens.push({
          ...payload,
          address: payload.address.toLowerCase(),
        });
      }
    });
});
