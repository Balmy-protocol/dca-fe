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
} from '@types';
import { DateTime } from 'luxon';
import { sortTokens, sortTokensByAddress } from '@common/utils/parsing';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { SWAP_INTERVALS_MAP } from '@constants';

import SdkService from './sdkService';
import { EventsManager } from './eventsManager';
import { toToken } from '@common/utils/currency';

export interface PairServiceData {
  availablePairs: Record<ChainId, AvailablePairs>;
  minSwapInterval: Record<ChainId, number>;
  hasFetchedAvailablePairs: boolean;
  tokens: Record<ChainId, TokenList>;
}

export default class PairService extends EventsManager<PairServiceData> {
  sdkService: SdkService;

  constructor(sdkService: SdkService) {
    super({ availablePairs: {}, minSwapInterval: {}, hasFetchedAvailablePairs: false, tokens: {} });

    this.sdkService = sdkService;

    void this.fetchAvailablePairs();
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

    const tokens = Object.keys(sdkPairs).reduce<Record<ChainId, TokenList>>((acc, chain) => {
      const chainId = Number(chain);

      const newAcc = {
        ...acc,
      };

      const chainTokens = sdkPairs[chainId].tokens;

      newAcc[chainId] = Object.keys(chainTokens).reduce<TokenList>(
        (tokenAcc, tokenId) => {
          const newTokenAcc = { ...tokenAcc };

          const token = chainTokens[tokenId];

          // Default to wrapper if original is not available. This is the case for staked tokens like wstETH
          const original =
            find(token.variants, ({ type }) => type === 'original') ||
            find(token.variants, ({ type }) => type === 'wrapper')!;

          // There will always be an original
          const originalVariant = toToken({
            chainId,
            ...token,
            address: original.id,
            type: TokenType.BASE,
          });

          newTokenAcc[`${chainId}-${originalVariant.address}`] = originalVariant;

          token.variants.forEach(({ id, type }) => {
            if (type === 'original' || type === 'wrapper') return;
            newTokenAcc[`${chainId}-${id}`] = toToken({
              ...originalVariant,
              address: id,
              underlyingTokens: [originalVariant],
              type: TokenType.YIELD_BEARING_SHARE,
              symbol: `YIELD_${originalVariant.symbol}`,
              name: `Yield bearing${originalVariant.name}`,
            });
          });

          return newTokenAcc;
        },
        { [`${chainId}-${PROTOCOL_TOKEN_ADDRESS}`]: getProtocolToken(chainId) }
      );

      return newAcc;
    }, {});

    const availablePairs = Object.keys(sdkPairs).reduce<Record<ChainId, AvailablePairs>>((acc, chain) => {
      const chainId = Number(chain);

      const newAcc = {
        ...acc,
      };

      const sdkPair = sdkPairs[chainId];

      newAcc[chainId] = sdkPair.pairs.reduce<AvailablePair[]>((pairAcc, pair) => {
        const newPairAcc = [...pairAcc];

        const tokenA = sdkPair.tokens[pair.tokenA];
        const tokenB = sdkPair.tokens[pair.tokenB];
        const tokenAVariants = tokenA.variants;
        const tokenBVariant = tokenB.variants;

        // Default to wrapper if original is not available. This is the case for staked tokens like wstETH
        // const originalA = find(tokenA.variants, ({ type }) => type === 'original') || find(tokenA.variants, ({ type }) => type === 'wrapper')!;
        // const originalB = find(tokenB.variants, ({ type }) => type === 'original') || find(tokenB.variants, ({ type }) => type === 'wrapper')!;

        // const wrappedProtocolToken = getWrappedProtocolToken(chainId);

        // add to pairs
        tokenAVariants.forEach((Avariant) => {
          tokenBVariant.forEach((Bvariant) => {
            const [token0, token1] = sortTokensByAddress(Avariant.id, Bvariant.id);
            const id: `${string}-${string}` = `${token0}-${token1}`;

            const nextSwapAvailableAt = Object.keys(pair.swapIntervals).reduce<Record<number, NextSwapAvailableAt>>(
              (intervalAcc, intervalKey) => {
                const interval = Number(intervalKey);

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
                const interval = Number(intervalKey);

                const newIntervalAcc = {
                  ...intervalAcc,
                };

                newIntervalAcc[interval] = pair.swapIntervals[intervalKey].isStale[id];

                return newIntervalAcc;
              },
              {}
            );

            newPairAcc.push({
              token0,
              token1,
              id,
              nextSwapAvailableAt,
              isStale,
            });
          });
        });

        return newPairAcc;
      }, []);

      const newMinSwapInterval = this.minSwapInterval;

      newMinSwapInterval[chainId] =
        sdkPair.pairs[0].swapIntervals[Object.keys(sdkPair.pairs[0].swapIntervals)[0]].seconds;

      this.minSwapInterval = newMinSwapInterval;
      return newAcc;
    }, {});

    this.availablePairs = availablePairs;

    this.tokens = tokens;

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
