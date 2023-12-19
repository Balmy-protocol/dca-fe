import find from 'lodash/find';
import some from 'lodash/some';
import findIndex from 'lodash/findIndex';
import {
  FullPosition,
  LastSwappedAt,
  Position,
  SwapInfo,
  Token,
  YieldOptions,
  AvailablePairs,
  PositionVersions,
  GetPairSwapsData,
} from '@types';
import { HUB_ADDRESS, LATEST_VERSION, STRING_SWAP_INTERVALS, SWAP_INTERVALS_MAP, toReadable } from '@constants';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { IntlShape } from 'react-intl';
import { Chain, DCAPositionToken } from '@mean-finance/sdk';
import { Chain as WagmiChain } from 'wagmi/chains';
import { toToken } from './currency';
import { Address } from 'viem';

export const sortTokensByAddress = (tokenA: string, tokenB: string) => {
  let token0 = tokenA;
  let token1 = tokenB;

  if (tokenA > tokenB) {
    token0 = tokenB;
    token1 = tokenA;
  }

  return [token0, token1];
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

export const calculateStale: (
  frequencyType: bigint,
  createdAt: number,
  lastSwapped: number | undefined,
  hasToExecute?: SwapInfo | null
) => -1 | 0 | 1 | 2 = (
  frequencyType: bigint,
  createdAt: number,
  lastSwapped = 0,
  hasToExecute = [true, true, true, true, true, true, true, true]
) => {
  let isStale = false;
  if (hasToExecute === null) {
    return NO_SWAP_INFORMATION;
  }

  if (!hasToExecute) {
    return NOTHING_TO_EXECUTE;
  }

  const freqIndex = findIndex(SWAP_INTERVALS_MAP, { value: frequencyType });

  if (!hasToExecute[freqIndex]) {
    return NOTHING_TO_EXECUTE;
  }

  const today = Math.floor(Date.now() / 1000);

  const foundFrequency = find(SWAP_INTERVALS_MAP, { value: frequencyType });

  if (!foundFrequency) {
    throw new Error('Frequency not found');
  }

  const timeframeToUse = BigInt(lastSwapped) >= BigInt(createdAt) ? lastSwapped : createdAt;

  const nextSwapAvailable = (BigInt(timeframeToUse) / frequencyType + 1n) * frequencyType;
  isStale = BigInt(today) > nextSwapAvailable + foundFrequency.staleValue;

  if (isStale) {
    return STALE;
  }
  return HEALTHY;
};

export const calculateStaleSwaps = (lastSwapped: number, frequencyType: bigint, createdAt: number) => {
  const today = BigInt(Math.floor(Date.now() / 1000)) / frequencyType;

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

export const sdkDcaTokenToToken = (token: DCAPositionToken, chainId: number): Token => {
  const hasYield = token.variant.type === 'yield';
  let newToken = toToken({
    ...token,
    chainId,
    underlyingTokens: [],
  });

  if (hasYield) {
    newToken.underlyingTokens = [
      toToken({
        ...token,
        chainId,
        underlyingTokens: [],
      }),
    ];

    newToken = {
      ...newToken,
      address: token.variant.id as Address,
    };
  }

  return newToken;
};

export const getDisplayToken = (token: Token, chainId?: number) => {
  const chainIdToUse = chainId || token.chainId;
  const protocolToken = getProtocolToken(chainIdToUse);
  const wrappedProtocolToken = getWrappedProtocolToken(chainIdToUse);

  let underlyingToken =
    !!token.underlyingTokens.length &&
    token.underlyingTokens[0].address.toLowerCase() !== PROTOCOL_TOKEN_ADDRESS &&
    token.underlyingTokens[0];

  underlyingToken = underlyingToken && {
    ...underlyingToken,
    chainId: chainIdToUse,
    underlyingTokens: [
      toToken({
        ...token,
        underlyingTokens: [],
      }),
    ],
  };

  if (underlyingToken && underlyingToken.address === wrappedProtocolToken.address) {
    underlyingToken = {
      ...protocolToken,
      chainId: chainIdToUse,
      underlyingTokens: [
        toToken({
          ...token,
          underlyingTokens: [],
        }),
      ],
    };
  }

  const baseToken =
    token.address === wrappedProtocolToken.address ? protocolToken : { ...token, chainId: chainIdToUse };

  return underlyingToken || baseToken;
};

export const calculateYield = (remainingLiquidity: bigint, rate: bigint, remainingSwaps: bigint) => {
  const yieldFromGenerated = remainingLiquidity - rate * remainingSwaps;

  return {
    total: remainingLiquidity,
    yieldGenerated: yieldFromGenerated,
    base: remainingLiquidity - yieldFromGenerated,
  };
};

export const activePositionsPerIntervalToHasToExecute = (
  activePositionsPerInterval: [number, number, number, number, number, number, number, number]
): [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean] =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  activePositionsPerInterval.map((activePositions) => Number(activePositions) !== 0);

export const calculateNextSwapAvailableAt = (
  interval: bigint,
  activePositionsPerInterval: SwapInfo,
  lastSwappedAt: LastSwappedAt
) => {
  const intervalIndex = findIndex(SWAP_INTERVALS_MAP, { value: interval });
  let nextSwapAvailableAt = 0;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= intervalIndex; i++) {
    if (activePositionsPerInterval[i]) {
      const nextSwapAvailableAtForInterval = (BigInt(lastSwappedAt[i]) / interval + 1n) * interval;
      if (nextSwapAvailableAtForInterval > nextSwapAvailableAt) {
        nextSwapAvailableAt = Number(nextSwapAvailableAtForInterval);
      }
    }
  }
  return nextSwapAvailableAt;
};

export function fullPositionToMappedPosition(
  position: FullPosition,
  pair?: GetPairSwapsData,
  remainingLiquidityUnderlying?: Nullable<bigint>,
  toWithdrawUnderlying?: Nullable<bigint>,
  totalWithdrawnUnderlying?: Nullable<bigint>,
  positionVersion?: string
): Position {
  const lastExecutedAt = (pair?.swaps && pair?.swaps[0] && pair?.swaps[0].executedAtTimestamp) || '0';

  const isStale =
    calculateStale(
      BigInt(position.swapInterval.interval),
      parseInt(position.createdAtTimestamp, 10) || 0,
      parseInt(lastExecutedAt, 10) || 0,
      pair?.activePositionsPerInterval
        ? activePositionsPerIntervalToHasToExecute(pair.activePositionsPerInterval)
        : null
    ) === STALE;

  const nextSwapAvailableAt = calculateNextSwapAvailableAt(
    BigInt(position.swapInterval.interval),
    pair?.activePositionsPerInterval
      ? activePositionsPerIntervalToHasToExecute(pair?.activePositionsPerInterval)
      : [false, false, false, false, false, false, false, false],
    pair?.lastSwappedAt || [0, 0, 0, 0, 0, 0, 0, 0]
  );
  const toWithdraw = toWithdrawUnderlying || BigInt(position.toWithdraw);
  const toWithdrawYield =
    position.toWithdrawUnderlyingAccum && toWithdrawUnderlying
      ? toWithdrawUnderlying - BigInt(position.toWithdrawUnderlyingAccum)
      : 0n;

  const swapped =
    (totalWithdrawnUnderlying &&
      toWithdrawUnderlying &&
      BigInt(totalWithdrawnUnderlying) + BigInt(toWithdrawUnderlying)) ||
    BigInt(position.totalSwapped);
  const swappedYield =
    position.totalSwappedUnderlyingAccum && totalWithdrawnUnderlying
      ? swapped - BigInt(position.totalSwappedUnderlyingAccum)
      : 0n;

  const { total: remainingLiquidity, yieldGenerated: remainingLiquidityYield } = calculateYield(
    remainingLiquidityUnderlying || BigInt(position.remainingLiquidity),
    BigInt(position.rate),
    BigInt(position.remainingSwaps)
  );

  return {
    from: position.from,
    to: position.to,
    user: position.user as Address,
    swapInterval: BigInt(position.swapInterval.interval),
    swapped: BigInt(position.totalSwapped),
    rate: BigInt(position.rate),
    toWithdraw,
    remainingLiquidity: remainingLiquidity,
    remainingSwaps: BigInt(position.remainingSwaps),
    totalSwaps: BigInt(position.totalSwaps),
    toWithdrawYield,
    remainingLiquidityYield,
    swappedYield,
    isStale,
    nextSwapAvailableAt,
    id: `${position.chainId}-${position.id}-v${position.version}`,
    positionId: BigInt(position.id),
    status: position.status,
    startedAt: parseInt(position.createdAtTimestamp, 10),
    totalExecutedSwaps: BigInt(position.totalExecutedSwaps),
    pendingTransaction: '',
    version: position.version || positionVersion || LATEST_VERSION,
    chainId: position.chainId,
    pairId: position.pair.id,
    permissions: position.permissions,
  };
}

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

export const usdFormatter = (num: number) => {
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
  return (num / si[i].value).toFixed(3).replace(rx, '$1') + si[i].symbol;
};

export const chainToWagmiNetwork = ({
  chainId,
  name,
  publicRPCs,
  nativeCurrency,
  testnet,
  explorer,
}: Chain): WagmiChain => ({
  name,
  id: chainId,
  nativeCurrency: {
    ...nativeCurrency,
    decimals: 18,
  },
  network: name,
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

export const formatWalletLabel = (address: string, label?: string, ens?: string | null) => {
  return {
    primaryLabel: label || ens || trimAddress(address || '', 6),
    secondaryLabel: label || ens ? trimAddress(address || '', 4) : undefined,
  };
};
