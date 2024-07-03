import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import {
  Token,
  AvailablePairs,
  SwapInfo,
  AvailablePair,
  LastSwappedAt,
  NextSwapAvailableAt,
  ChainId,
  TokenList,
  TokenType,
  TokenListId,
  YieldOptions,
  YieldName,
} from '@types';
import { DateTime } from 'luxon';
import { sortTokens, sortTokensByAddress } from '@common/utils/parsing';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { PLATFORM_NAMES_FOR_TOKENS, SWAP_INTERVALS_MAP } from '@constants';

import SdkService from './sdkService';
import { EventsManager } from './eventsManager';
import { emptyTokenWithAddress, toToken } from '@common/utils/currency';
import { uniqBy } from 'lodash';

export interface PairServiceData {
  availablePairs: Record<ChainId, AvailablePairs>;
  minSwapInterval: Record<ChainId, number>;
  hasFetchedAvailablePairs: boolean;
  tokens: Record<ChainId, TokenList>;
  yieldOptions: Record<ChainId, YieldOptions>;
}

export default class PairService extends EventsManager<PairServiceData> {
  sdkService: SdkService;

  constructor(sdkService: SdkService) {
    super({ availablePairs: {}, minSwapInterval: {}, hasFetchedAvailablePairs: false, tokens: {}, yieldOptions: {} });
    this.sdkService = sdkService;
  }

  get availablePairs() {
    return this.serviceData.availablePairs;
  }

  set availablePairs(availablePairs) {
    this.serviceData = { ...this.serviceData, availablePairs };
  }

  get minSwapInterval() {
    return this.serviceData.minSwapInterval;
  }

  set minSwapInterval(minSwapInterval) {
    this.serviceData = { ...this.serviceData, minSwapInterval };
  }

  get hasFetchedAvailablePairs() {
    return this.serviceData.hasFetchedAvailablePairs;
  }

  set hasFetchedAvailablePairs(hasFetchedAvailablePairs) {
    this.serviceData = { ...this.serviceData, hasFetchedAvailablePairs };
  }

  get tokens() {
    return this.serviceData.tokens;
  }

  set tokens(tokens) {
    this.serviceData = { ...this.serviceData, tokens };
  }

  get yieldOptions() {
    return this.serviceData.yieldOptions;
  }

  set yieldOptions(yieldOptions) {
    this.serviceData = { ...this.serviceData, yieldOptions };
  }

  getYieldOptions() {
    return this.yieldOptions;
  }

  getTokens() {
    return this.tokens;
  }

  getHasFetchedAvailablePairs() {
    return this.hasFetchedAvailablePairs;
  }

  getAvailablePairs() {
    return this.availablePairs;
  }

  getMinSwapInterval() {
    return this.minSwapInterval;
  }

  async fetchAvailablePairs() {
    const sdkPairs = await this.sdkService.getDcaSupportedPairs();

    const yieldOptions: Record<ChainId, YieldOptions> = {};
    const tokens = Object.keys(sdkPairs).reduce<Record<ChainId, TokenList>>((acc, chain) => {
      const chainId = Number(chain);

      const chainTokens = sdkPairs[chainId].tokens;

      // eslint-disable-next-line no-param-reassign
      acc[chainId] = Object.keys(chainTokens).reduce<TokenList>((tokenAcc, tokenId) => {
        const token = chainTokens[tokenId];
        const wrappedToken = getWrappedProtocolToken(chainId);
        const protocolToken = getProtocolToken(chainId);

        // Default to wrapper if original is not available. This is the case for staked tokens like wstETH
        let original =
          find(token.variants, ({ type }) => type === 'original') ||
          find(token.variants, ({ type }) => type === 'wrapper')!;

        if (
          original.id.toLowerCase() === wrappedToken.address &&
          token.symbol.toLowerCase() === protocolToken.symbol.toLowerCase()
        ) {
          original = {
            id: protocolToken.address,
            type: 'original',
          };
        }

        // There will always be an original
        const originalVariant = toToken({
          chainId,
          ...token,
          address: original.id,
          type: TokenType.BASE,
        });

        // eslint-disable-next-line no-param-reassign
        tokenAcc[`${chainId}-${originalVariant.address.toLowerCase()}` as TokenListId] = originalVariant;

        const yieldVariant = token.variants.find(({ type }) => type === 'yield');

        if (yieldVariant) {
          const { type, id } = yieldVariant;

          const yieldToken = toToken({
            ...originalVariant,
            address: id,
            underlyingTokens: [originalVariant],
            type: TokenType.YIELD_BEARING_SHARE,
            symbol: `YIELD_${originalVariant.symbol}`,
            name: `Yield bearing${originalVariant.name}`,
          });

          // eslint-disable-next-line no-param-reassign
          tokenAcc[`${chainId}-${id.toLowerCase()}` as TokenListId] = yieldToken;

          if (!yieldOptions[chainId]) {
            yieldOptions[chainId] = [];
          }

          if (type === 'yield') {
            const yieldEnabledTokens = token.variants
              .filter(({ type: variantType }) => variantType === 'original' || variantType === 'wrapper')
              .map(({ id: variantId }) => variantId.toLowerCase());

            if (yieldEnabledTokens.includes(wrappedToken.address)) {
              yieldEnabledTokens.push(PROTOCOL_TOKEN_ADDRESS);
            }

            yieldOptions[chainId].push({
              name: yieldVariant.platform as YieldName,
              apy: yieldVariant.apy,
              enabledTokens: yieldEnabledTokens,
              token: emptyTokenWithAddress(PLATFORM_NAMES_FOR_TOKENS[yieldVariant.platform] || ''),
              tokenAddress: yieldVariant.id,
            });
          }
        }

        return tokenAcc;
      }, {});

      return acc;
    }, {});

    const availablePairs = Object.keys(sdkPairs).reduce<Record<ChainId, AvailablePairs>>((acc, chain) => {
      const chainId = Number(chain);

      const sdkPair = sdkPairs[chainId];

      // eslint-disable-next-line no-param-reassign
      acc[chainId] = sdkPair.pairs.reduce<AvailablePair[]>((pairAcc, pair) => {
        const tokenA = sdkPair.tokens[pair.tokenA];
        const tokenB = sdkPair.tokens[pair.tokenB];
        const tokenAVariants = tokenA.variants;
        const tokenBVariant = tokenB.variants;

        // add to pairs
        tokenAVariants.forEach((Avariant) => {
          tokenBVariant.forEach((Bvariant) => {
            const [token0, token1] = sortTokensByAddress(Avariant.id, Bvariant.id);
            const id: `${string}-${string}` = `${token0}-${token1}`;

            const nextSwapAvailableAt = Object.keys(pair.swapIntervals).reduce<Record<number, NextSwapAvailableAt>>(
              (intervalAcc, intervalKey) => {
                const interval = pair.swapIntervals[intervalKey].seconds;

                const newIntervalAcc = {
                  ...intervalAcc,
                };

                newIntervalAcc[interval] = pair.swapIntervals[intervalKey].nextSwapAvailableAt[id];

                return newIntervalAcc;
              },
              {}
            );
            const isStale = Object.keys(pair.swapIntervals).reduce<Record<number, boolean>>(
              (intervalAcc, intervalKey) => {
                const interval = pair.swapIntervals[intervalKey].seconds;

                const newIntervalAcc = {
                  ...intervalAcc,
                };

                newIntervalAcc[interval] = pair.swapIntervals[intervalKey].isStale[id];

                return newIntervalAcc;
              },
              {}
            );

            pairAcc.push({
              token0,
              token1,
              id,
              nextSwapAvailableAt,
              isStale,
            });
          });
        });

        return pairAcc;
      }, []);

      const newMinSwapInterval = this.minSwapInterval;

      newMinSwapInterval[chainId] =
        sdkPair.pairs[0].swapIntervals[Object.keys(sdkPair.pairs[0].swapIntervals)[0]].seconds;

      this.minSwapInterval = newMinSwapInterval;
      return acc;
    }, {});

    this.availablePairs = availablePairs;

    this.tokens = tokens;

    this.yieldOptions = Object.keys(yieldOptions).reduce<Record<ChainId, YieldOptions>>((yieldAcc, chainId) => {
      // eslint-disable-next-line no-param-reassign
      yieldAcc[Number(chainId)] = uniqBy(yieldOptions[Number(chainId)], 'tokenAddress');

      return yieldAcc;
    }, {});

    this.hasFetchedAvailablePairs = true;
  }

  // PAIR METHODS
  addNewPair(tokenA: Token, tokenB: Token, frequencyType: bigint, chainId: number) {
    const [token0, token1] = sortTokens(tokenA, tokenB);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const swapInfo: SwapInfo = SWAP_INTERVALS_MAP.map(() => false);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const lastSwappedAt: LastSwappedAt = SWAP_INTERVALS_MAP.map(() => 0);
    const freqIndex = findIndex(SWAP_INTERVALS_MAP, { value: frequencyType });

    swapInfo[freqIndex] = true;

    swapInfo[freqIndex] = true;
    lastSwappedAt[freqIndex] = DateTime.now().toSeconds();

    const availablePairs = this.availablePairs;

    if (!this.availablePairExists(token0, token1, chainId)) {
      availablePairs[chainId].push({
        token0: token0.address,
        token1: token1.address,
        id: `${token0.address}-${token1.address}`,
        nextSwapAvailableAt: {
          [Number(frequencyType)]: 0,
        },
        isStale: { [Number(frequencyType)]: false },
      });
    }

    this.availablePairs = availablePairs;
  }

  availablePairExists(token0: Token, token1: Token, chainId: number) {
    return !!find(this.availablePairs[chainId], { id: `${token0.address}-${token1.address}` });
  }

  canSupportPair(tokenFrom: Token, tokenTo: Token, chainId: number) {
    const token0 =
      tokenFrom.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(tokenFrom.chainId) : tokenFrom;
    const token1 = tokenTo.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(tokenTo.chainId) : tokenTo;

    const [tokenA, tokenB] = sortTokens(token0, token1);

    const foundAllowedPair = find(
      this.availablePairs[chainId],
      (pair) => pair.token0 === tokenA.address && pair.token1 === tokenB.address
    );

    return !!foundAllowedPair;
  }
}
