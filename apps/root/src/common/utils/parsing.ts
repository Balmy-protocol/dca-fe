import { BigNumber } from 'ethers';
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
  frequencyType: BigNumber,
  createdAt: number,
  lastSwapped: number | undefined,
  hasToExecute?: SwapInfo | null
) => -1 | 0 | 1 | 2 = (
  frequencyType: BigNumber,
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

  const timeframeToUse = BigNumber.from(lastSwapped).gte(BigNumber.from(createdAt)) ? lastSwapped : createdAt;

  const nextSwapAvailable = BigNumber.from(timeframeToUse).div(frequencyType).add(1).mul(frequencyType);
  isStale = BigNumber.from(today).gt(nextSwapAvailable.add(foundFrequency.staleValue));

  if (isStale) {
    return STALE;
  }
  return HEALTHY;
};

export const calculateStaleSwaps = (lastSwapped: number, frequencyType: BigNumber, createdAt: number) => {
  const today = BigNumber.from(Math.floor(Date.now() / 1000)).div(frequencyType);

  if (lastSwapped === 0) {
    return today.sub(BigNumber.from(createdAt).div(frequencyType).add(3));
  }

  const nextSwapAvailable = BigNumber.from(lastSwapped).div(frequencyType).add(3);
  return today.sub(nextSwapAvailable);
};

export const getFrequencyLabel = (intl: IntlShape, frenquencyType: string, frequencyValue?: string) =>
  frequencyValue && BigNumber.from(frequencyValue).eq(BigNumber.from(1))
    ? intl.formatMessage(STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].singular)
    : intl.formatMessage(STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].plural, {
        readable: toReadable(parseInt(frequencyValue || '0', 10), Number(frenquencyType), intl),
        left: parseInt(frequencyValue || '0', 10),
      });

export const getTimeFrequencyLabel = (intl: IntlShape, frenquencyType: string, frequencyValue?: string) =>
  frequencyValue && BigNumber.from(frequencyValue).eq(BigNumber.from(1))
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
  });

  if (hasYield) {
    newToken.underlyingTokens = [
      toToken({
        ...token,
        chainId,
      }),
    ];

    newToken = {
      ...newToken,
      address: token.variant.id,
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
    underlyingTokens: [token],
  };

  if (underlyingToken && underlyingToken.address === wrappedProtocolToken.address) {
    underlyingToken = {
      ...protocolToken,
      chainId: chainIdToUse,
      underlyingTokens: [token],
    };
  }

  const baseToken =
    token.address === wrappedProtocolToken.address ? protocolToken : { ...token, chainId: chainIdToUse };

  return underlyingToken || baseToken;
};

export const calculateYield = (remainingLiquidity: BigNumber, rate: BigNumber, remainingSwaps: BigNumber) => {
  const yieldFromGenerated = remainingLiquidity.sub(rate.mul(remainingSwaps));

  return {
    total: remainingLiquidity,
    yieldGenerated: yieldFromGenerated,
    base: remainingLiquidity.sub(yieldFromGenerated),
  };
};

export const activePositionsPerIntervalToHasToExecute = (
  activePositionsPerInterval: [number, number, number, number, number, number, number, number]
): [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean] =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  activePositionsPerInterval.map((activePositions) => Number(activePositions) !== 0);

export const calculateNextSwapAvailableAt = (
  interval: BigNumber,
  activePositionsPerInterval: SwapInfo,
  lastSwappedAt: LastSwappedAt
) => {
  const intervalIndex = findIndex(SWAP_INTERVALS_MAP, { value: interval });
  let nextSwapAvailableAt = 0;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= intervalIndex; i++) {
    if (activePositionsPerInterval[i]) {
      const nextSwapAvailableAtForInterval = BigNumber.from(lastSwappedAt[i]).div(interval).add(1).mul(interval);
      if (nextSwapAvailableAtForInterval.gt(nextSwapAvailableAt)) {
        nextSwapAvailableAt = nextSwapAvailableAtForInterval.toNumber();
      }
    }
  }
  return nextSwapAvailableAt;
};

export function fullPositionToMappedPosition(
  position: FullPosition,
  pair?: GetPairSwapsData,
  remainingLiquidityUnderlying?: Nullable<BigNumber>,
  toWithdrawUnderlying?: Nullable<BigNumber>,
  totalWithdrawnUnderlying?: Nullable<BigNumber>,
  positionVersion?: string
): Position {
  const lastExecutedAt = (pair?.swaps && pair?.swaps[0] && pair?.swaps[0].executedAtTimestamp) || '0';

  const isStale =
    calculateStale(
      BigNumber.from(position.swapInterval.interval),
      parseInt(position.createdAtTimestamp, 10) || 0,
      parseInt(lastExecutedAt, 10) || 0,
      pair?.activePositionsPerInterval
        ? activePositionsPerIntervalToHasToExecute(pair.activePositionsPerInterval)
        : null
    ) === STALE;

  const nextSwapAvailableAt = calculateNextSwapAvailableAt(
    BigNumber.from(position.swapInterval.interval),
    pair?.activePositionsPerInterval
      ? activePositionsPerIntervalToHasToExecute(pair?.activePositionsPerInterval)
      : [false, false, false, false, false, false, false, false],
    pair?.lastSwappedAt || [0, 0, 0, 0, 0, 0, 0, 0]
  );
  const toWithdraw = toWithdrawUnderlying || BigNumber.from(position.toWithdraw);
  const toWithdrawYield =
    position.toWithdrawUnderlyingAccum && toWithdrawUnderlying
      ? toWithdrawUnderlying.sub(position.toWithdrawUnderlyingAccum)
      : BigNumber.from(0);

  const swapped =
    (totalWithdrawnUnderlying &&
      toWithdrawUnderlying &&
      BigNumber.from(totalWithdrawnUnderlying).add(BigNumber.from(toWithdrawUnderlying))) ||
    BigNumber.from(position.totalSwapped);
  const swappedYield =
    position.totalSwappedUnderlyingAccum && totalWithdrawnUnderlying
      ? swapped.sub(position.totalSwappedUnderlyingAccum)
      : BigNumber.from(0);

  const { total: remainingLiquidity, yieldGenerated: remainingLiquidityYield } = calculateYield(
    remainingLiquidityUnderlying || BigNumber.from(position.remainingLiquidity),
    BigNumber.from(position.rate),
    BigNumber.from(position.remainingSwaps)
  );

  return {
    from: position.from,
    to: position.to,
    user: position.user,
    swapInterval: BigNumber.from(position.swapInterval.interval),
    swapped: BigNumber.from(position.totalSwapped),
    rate: BigNumber.from(position.rate),
    toWithdraw,
    remainingLiquidity: remainingLiquidity,
    remainingSwaps: BigNumber.from(position.remainingSwaps),
    totalSwaps: BigNumber.from(position.totalSwaps),
    toWithdrawYield,
    remainingLiquidityYield,
    swappedYield,
    isStale,
    nextSwapAvailableAt,
    id: `${position.id}-v${position.version || LATEST_VERSION}`,
    positionId: position.id,
    status: position.status,
    startedAt: parseInt(position.createdAtTimestamp, 10),
    totalExecutedSwaps: BigNumber.from(position.totalExecutedSwaps),
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

export const identifyNetwork = (sdkNetworks: Chain[], chainId?: string): Chain | undefined => {
  const chainIdParsed = Number(chainId);

  let foundNetwork = find(sdkNetworks, { chainId: chainIdParsed });
  if (!foundNetwork && chainId) {
    foundNetwork = find(
      sdkNetworks,
      ({ name, ids }) => name.toLowerCase() === chainId.toLowerCase() || ids.includes(chainId.toLowerCase())
    );
  }
  return foundNetwork;
};
