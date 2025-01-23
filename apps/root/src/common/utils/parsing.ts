import find from 'lodash/find';
import some from 'lodash/some';
import {
  Token,
  YieldOptions,
  AvailablePairs,
  PositionVersions,
  TokenList,
  TokenListId,
  AmountsOfToken,
  PositionYieldOption,
  DCAPositionSwappedAction,
  TokensLists,
  Wallet,
  Position,
  YieldName,
  Contact,
} from '@types';
import {
  HUB_ADDRESS,
  PLATFORM_NAMES_FOR_TOKENS,
  STABLE_COINS,
  STRING_SWAP_INTERVALS,
  TOKEN_BLACKLIST,
  toReadable,
} from '@constants';
import { getProtocolToken, getWrappedProtocolToken, TOKEN_MAP_SYMBOL } from '@common/mocks/tokens';
import { IntlShape } from 'react-intl';
import {
  AmountsOfToken as SdkAmountsOfToken,
  Chain,
  DCAPositionToken,
  ActionTypeAction,
  getAllChains,
} from '@balmy/sdk';
import { emptyTokenWithAddress, formatCurrencyAmount, isSameToken } from './currency';
import { Address, formatUnits, maxUint256, Chain as ViemChain } from 'viem';
import { TokenBalances } from '@state/balances/hooks';
import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import toPairs from 'lodash/toPairs';
import { CURATED_LISTS } from '@state/token-lists/reducer';
import { isEqual, isUndefined, uniqWith } from 'lodash';
import { nowInSeconds } from './time';

export const sortTokensByAddress = (tokenA: string, tokenB: string) => {
  let token0 = tokenA;
  let token1 = tokenB;

  if (tokenA > tokenB) {
    token0 = tokenB;
    token1 = tokenA;
  }

  return [token0 as Address, token1 as Address];
};

export const sortTokens = (tokenA: Token, tokenB: Token) => {
  let token0 = tokenA;
  let token1 = tokenB;

  if (tokenA.address > tokenB.address) {
    token0 = tokenB;
    token1 = tokenA;
  }

  return [token0, token1];
};

export const getSimilarPair = (pairs: AvailablePairs, yieldOptions: YieldOptions, tokenA: Token, tokenB: Token) => {
  const availableYieldOptionsTokenA = yieldOptions.filter((yieldOption) =>
    yieldOption.enabledTokens.includes(tokenA.address)
  );
  const availableYieldOptionsTokenB = yieldOptions.filter((yieldOption) =>
    yieldOption.enabledTokens.includes(tokenB.address)
  );

  const possibleToken0 = [
    ...availableYieldOptionsTokenA.map((yieldOption) => yieldOption.tokenAddress),
    tokenA.address,
  ];
  const possibleToken1 = [
    ...availableYieldOptionsTokenB.map((yieldOption) => yieldOption.tokenAddress),
    tokenB.address,
  ];

  const possiblePairs = possibleToken0.reduce<string[]>((acc, token0) => {
    const newAcc = [...acc];

    possibleToken1.forEach((token1) => {
      const [from, to] = sortTokensByAddress(token0, token1);
      const pair = `${from}-${to}`;
      if (newAcc.indexOf(pair) === -1) {
        newAcc.push(pair);
      }
    });

    return newAcc;
  }, []);

  return some(possiblePairs, (possiblePair) => find(pairs, { id: possiblePair }));
};

export const NO_SWAP_INFORMATION = -1;
export const NOTHING_TO_EXECUTE = 0;
export const HEALTHY = 1;
export const STALE = 2;

export const calculateStaleSwaps = (lastSwapped: number, frequencyType: bigint, createdAt: number) => {
  const today = BigInt(nowInSeconds()) / frequencyType;

  if (lastSwapped === 0) {
    return today - (BigInt(createdAt) / frequencyType + 3n);
  }

  const nextSwapAvailable = BigInt(lastSwapped) / frequencyType + 3n;
  return today - nextSwapAvailable;
};

export const getFrequencyLabel = (intl: IntlShape, frenquencyType: string, frequencyValue?: string) =>
  frequencyValue && BigInt(frequencyValue) === 1n
    ? intl.formatMessage(STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].singular)
    : intl.formatMessage(STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].plural, {
        readable: toReadable(parseInt(frequencyValue || '0', 10), Number(frenquencyType), intl),
        left: parseInt(frequencyValue || '0', 10),
      });

export const getTimeFrequencyLabel = (intl: IntlShape, frenquencyType: string, frequencyValue?: string) =>
  frequencyValue && BigInt(frequencyValue) === 1n
    ? intl.formatMessage(STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].singularTime)
    : intl.formatMessage(STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].pluralTime, {
        readable: toReadable(parseInt(frequencyValue || '0', 10), Number(frenquencyType), intl),
        left: parseInt(frequencyValue || '0', 10),
      });

export const capitalizeFirstLetter = (toCap: string) => toCap.charAt(0).toUpperCase() + toCap.slice(1);

export function getURLFromQuery(query: string) {
  if (query.startsWith('https://')) {
    return query;
  }
  if (query.endsWith('.eth')) {
    return `https://${query}.link`;
  }
  return '';
}

export const sdkDcaTokenToYieldOption = (token: DCAPositionToken): PositionYieldOption | undefined => {
  if (token.variant.type !== 'yield') {
    return;
  }

  return {
    apy: token.variant.apy,
    name: token.variant.platform as YieldName,
    token: emptyTokenWithAddress(PLATFORM_NAMES_FOR_TOKENS[token.variant.platform] || ''),
    tokenAddress: token.variant.id,
  };
};

export const calculateYield = (remainingLiquidity: bigint, rate: bigint, remainingSwaps: bigint) => {
  const yieldFromGenerated = remainingLiquidity - rate * remainingSwaps;

  return {
    total: remainingLiquidity,
    yieldGenerated: yieldFromGenerated,
    base: remainingLiquidity - yieldFromGenerated,
  };
};

export const calculateAvgBuyPrice = (
  position: Position
): { averageBuyPrice: bigint; tokenFromAverage: Token; tokenToAverage: Token } => {
  const tokenFromAverage = STABLE_COINS.includes(position.to.symbol) ? position.from : position.to;
  const tokenToAverage = STABLE_COINS.includes(position.to.symbol) ? position.to : position.from;

  if (!position.history) {
    return {
      averageBuyPrice: 0n,
      tokenFromAverage,
      tokenToAverage,
    };
  }

  const swappedActions = position.history.filter(
    (pos) => pos.action === ActionTypeAction.SWAPPED
  ) as DCAPositionSwappedAction[];

  if (swappedActions.length === 0) {
    return {
      averageBuyPrice: 0n,
      tokenFromAverage,
      tokenToAverage,
    };
  }

  const ratioSum: Record<string, bigint> = {};
  for (const { tokenA, tokenB, ratioAToB, ratioBToA } of swappedActions) {
    ratioSum[tokenA.address] = (ratioSum[tokenA.address] ?? 0n) + ratioAToB;
    ratioSum[tokenB.address] = (ratioSum[tokenB.address] ?? 0n) + ratioBToA;
  }

  const averageBuyPrice =
    ratioSum[tokenFromAverage.address] > 0n ? ratioSum[tokenFromAverage.address] / BigInt(swappedActions.length) : 0n;

  return { averageBuyPrice, tokenFromAverage, tokenToAverage };
};

export const activePositionsPerIntervalToHasToExecute = (
  activePositionsPerInterval: [number, number, number, number, number, number, number, number]
): [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean] =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  activePositionsPerInterval.map((activePositions) => Number(activePositions) !== 0);

export const findHubAddressVersion = (hubAddress: string) => {
  const versions = Object.entries(HUB_ADDRESS);

  for (const entry of versions) {
    const [positionVersion, chainsAndAddresses] = entry;

    const addresses = Object.values(chainsAndAddresses);

    const isHubInVersion = addresses.filter((address) => address.toLowerCase() === hubAddress.toLowerCase()).length;

    if (isHubInVersion) {
      return positionVersion as PositionVersions;
    }
  }

  throw new Error('hub address not found');
};

export const usdFormatter = (num: number, sigFigs = 3) => {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  // eslint-disable-next-line no-plusplus
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(sigFigs).replace(rx, '$1') + si[i].symbol;
};

export const chainToViemNetwork = ({
  chainId,
  name,
  publicRPCs,
  nativeCurrency,
  testnet,
  explorer,
}: Chain): ViemChain => ({
  name,
  id: chainId,
  nativeCurrency: {
    ...nativeCurrency,
    decimals: 18,
  },
  /** Collection of RPC endpoints */
  rpcUrls: {
    default: {
      http: publicRPCs,
    },
    public: {
      http: publicRPCs,
    },
  },
  blockExplorers: {
    default: {
      name: 'etherscan',
      url: explorer,
    },
  },
  testnet,
});

export const identifyNetwork = (networks: Chain[], chainId?: string): Chain | undefined => {
  const chainIdParsed = Number(chainId);

  let foundNetwork = find(networks, { chainId: chainIdParsed });
  if (!foundNetwork && chainId) {
    foundNetwork = find(
      networks,
      ({ name, ids }) => name.toLowerCase() === chainId.toLowerCase() || ids.includes(chainId.toLowerCase())
    );
  }
  return foundNetwork;
};

export const validateAddress = (address: string) => {
  const validRegex = RegExp(/^0x[A-Fa-f0-9]{40}$/);
  return validRegex.test(address);
};

export const trimAddress = (address: string, trimSize?: number) =>
  `${address.slice(0, trimSize || 6)}...${address.slice(-(trimSize || 6))}`;

export const getDisplayContact = (contact: Contact) => {
  return contact.label?.label || trimAddress(contact.address);
};

export const getDisplayWallet = (wallet?: Wallet) => {
  if (!wallet) return;
  return wallet.label || wallet.ens || trimAddress(wallet.address);
};

export const formatWalletLabel = (address: string, label?: string, ens?: string | null) => {
  return {
    primaryLabel: label || ens || trimAddress(address || '', 6),
    secondaryLabel: label || ens ? trimAddress(address || '', 4) : undefined,
  };
};

export const totalSupplyThreshold = (decimals = 18) => (maxUint256 - 1n) / 10n ** BigInt(decimals);

export const parseTokensForPicker = ({
  tokenList,
  balances,
  customTokens,
  yieldOptions,
}: {
  yieldOptions?: YieldOptions;
  tokenList: TokenList;
  balances: TokenBalances;
  customTokens?: TokenList;
}) => {
  const mergedTokenLists = {
    ...(customTokens || {}),
    ...tokenList,
  };

  const mergedTokenKeys = Object.keys(mergedTokenLists);

  return compact(
    mergedTokenKeys.map((tokenKey) => {
      const tokenFromList = mergedTokenLists[tokenKey as TokenListId];

      if (!tokenFromList) return null;

      const tokenAddress = tokenFromList.address;

      const tokenBalance = balances[tokenAddress];

      const availableYieldOptions = (yieldOptions || []).filter((yieldOption) =>
        yieldOption.enabledTokens.includes(tokenAddress)
      );

      const balance: AmountsOfToken | undefined =
        (tokenBalance &&
          tokenBalance.balance && {
            amount: tokenBalance.balance,
            amountInUnits: formatCurrencyAmount({ amount: tokenBalance.balance, token: tokenFromList }),
            amountInUSD:
              (tokenBalance.balanceUsd &&
                parseFloat(formatUnits(tokenBalance.balanceUsd, tokenFromList.decimals + 18)).toFixed(2)) ||
              undefined,
          }) ||
        undefined;

      return {
        token: tokenFromList,
        balance,
        isCustomToken: !!customTokens?.[tokenKey as TokenListId] && !tokenList[tokenKey as TokenListId],
        allowsYield: !!availableYieldOptions.length,
      };
    })
  );
};

export const mapSdkAmountsOfToken = (amounts: SdkAmountsOfToken): AmountsOfToken => ({
  ...amounts,
  amount: BigInt(amounts.amount),
});

export const parseTokenList = ({
  tokensLists,
  chainId,
  filter,
  filterForDca,
  yieldTokens,
  curateList,
}: {
  tokensLists: Record<string, TokensLists>;
  chainId?: number;
  filterForDca?: boolean;
  filter?: boolean;
  yieldTokens?: string[];
  curateList?: boolean;
}) => {
  const orderedLists = orderBy(
    toPairs(tokensLists).map(([, list]) => list),
    ['priority'],
    ['asc']
  );

  let tokens = orderedLists
    .reduce<Token[]>((acc, list) => [...acc, ...list.tokens], [])
    .filter(
      (token) =>
        (!chainId || token.chainId === chainId) &&
        // !Object.keys(acc).includes(token.address) &&
        (!filterForDca || !yieldTokens?.includes(token.address)) &&
        (!filter || !TOKEN_BLACKLIST.includes(token.address))
    )
    .map((token) => ({
      ...token,
      name: TOKEN_MAP_SYMBOL[token.address] || token.name,
    }));

  if (curateList) {
    const curatedLists = toPairs(tokensLists).reduce<TokenListId[]>((acc, [listKey, list]) => {
      if (CURATED_LISTS.includes(listKey)) {
        acc.unshift(...list.tokens.map((token) => `${token.chainId}-${token.address}` as TokenListId));
      }

      return acc;
    }, []);

    tokens = tokens.filter((token) => curatedLists.includes(`${token.chainId}-${token.address}` as TokenListId));
  }

  const protocols = chainId
    ? [getProtocolToken(chainId)]
    : getAllChains().map((chain) => getProtocolToken(chain.chainId));

  return [...tokens, ...protocols].reduce<TokenList>((acc, token) => {
    const tokenListId = `${token.chainId}-${token.address}` as TokenListId;

    const savedChainAddresses = acc[tokenListId]?.chainAddresses || [];
    const mergedChainAddresses = uniqWith<(typeof savedChainAddresses)[0]>(
      savedChainAddresses.concat(token.chainAddresses || []),
      isEqual
    );

    // eslint-disable-next-line no-param-reassign
    acc[tokenListId] = {
      ...token,
      chainAddresses: mergedChainAddresses,
    };

    return acc;
  }, {});
};

export const getTokenListId = ({ tokenAddress, chainId }: { tokenAddress: string; chainId: number }) =>
  `${chainId}-${tokenAddress.toLowerCase()}` as TokenListId;

export const transformStoredPositionToPosition = (position: Position | undefined): Position | undefined =>
  isUndefined(position)
    ? undefined
    : {
        ...position,
        swapped: {
          ...position.swapped,
          amount: BigInt(position.swapped.amount),
        },
        remainingLiquidity: {
          ...position.remainingLiquidity,
          amount: BigInt(position.remainingLiquidity.amount),
        },
        rate: {
          ...position.rate,
          amount: BigInt(position.rate.amount),
        },
        toWithdraw: {
          ...position.toWithdraw,
          amount: BigInt(position.toWithdraw.amount),
        },
        toWithdrawYield: position.toWithdrawYield && {
          ...position.toWithdrawYield,
          amount: BigInt(position.toWithdrawYield.amount),
        },
        remainingLiquidityYield: position.remainingLiquidityYield && {
          ...position.remainingLiquidityYield,
          amount: BigInt(position.remainingLiquidityYield.amount),
        },
        swappedYield: position.swappedYield && {
          ...position.swappedYield,
          amount: BigInt(position.swappedYield.amount),
        },
      };

export const formatListMessage = ({ items, intl }: { items?: string[]; intl: IntlShape }) => {
  if (!items || !items.length) return '';

  if (items.length === 1) return items[0];

  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);

  return intl.formatMessage(
    {
      defaultMessage: '{items} and {lastItem}',
      description: 'common.format.items-list',
    },
    {
      items: otherItems.join(', '),
      lastItem,
    }
  );
};

export const parseWrappedProtocolTokenToProtocolToken = (token: Token): Token => {
  const protocolToken = getProtocolToken(token.chainId);
  const isWrappedProtocolToken = isSameToken(token, getWrappedProtocolToken(token.chainId));

  return {
    ...(isWrappedProtocolToken ? protocolToken : token),
    price: token.price,
  };
};
