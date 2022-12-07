import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import {
  Token,
  AvailablePairs,
  PoolLiquidityData,
  PoolsLiquidityDataGraphqlResponse,
  Oracles,
  AvailablePairsGraphqlResponse,
  AvailablePairResponse,
  SwapInfo,
  AllowedPairs,
  AvailablePair,
  LastSwappedAt,
  NextSwapAvailableAt,
} from 'types';
import { DateTime } from 'luxon';
import {
  activePositionsPerIntervalToHasToExecute,
  calculateNextSwapAvailableAt,
  sortTokens,
  sortTokensByAddress,
} from 'utils/parsing';
import { BigNumber } from 'ethers';

// GQL queries
import GET_PAIR_LIQUIDITY from 'graphql/getPairLiquidity.graphql';
import GET_AVAILABLE_PAIRS from 'graphql/getAvailablePairs.graphql';
import gqlFetchAll from 'utils/gqlFetchAll';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from 'mocks/tokens';
import {
  ORACLES,
  PositionVersions,
  LATEST_VERSION,
  DEFAULT_NETWORK_FOR_VERSION,
  SWAP_INTERVALS_MAP,
} from 'config/constants';

import GraphqlService from './graphql';
import ContractService from './contractService';
import WalletService from './walletService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';

export default class PairService {
  availablePairs: AvailablePairs;

  allowedPairs: AllowedPairs;

  providerService: ProviderService;

  contractService: ContractService;

  walletService: WalletService;

  meanApiService: MeanApiService;

  uniClient: Record<PositionVersions, Record<number, GraphqlService>>;

  apolloClient: Record<PositionVersions, Record<number, GraphqlService>>;

  hasFetchedAvailablePairs: boolean;

  constructor(
    walletService: WalletService,
    contractService: ContractService,
    meanApiService: MeanApiService,
    providerService: ProviderService,
    DCASubgraphs?: Record<PositionVersions, Record<number, GraphqlService>>,
    UNISubgraphs?: Record<PositionVersions, Record<number, GraphqlService>>
  ) {
    this.contractService = contractService;
    this.walletService = walletService;
    this.meanApiService = meanApiService;
    this.providerService = providerService;
    this.availablePairs = [];
    this.allowedPairs = [];
    this.hasFetchedAvailablePairs = false;

    if (UNISubgraphs) {
      this.uniClient = UNISubgraphs;
    }
    if (DCASubgraphs) {
      this.apolloClient = DCASubgraphs;
    }
  }

  getHasFetchedAvailablePairs() {
    return this.hasFetchedAvailablePairs;
  }

  getAvailablePairs() {
    return this.availablePairs;
  }

  getAllowedPairs() {
    return this.allowedPairs;
  }

  async fetchAvailablePairs() {
    const network = await this.walletService.getNetwork();
    const client = (
      this.apolloClient[LATEST_VERSION][network.chainId] ||
      this.apolloClient[LATEST_VERSION][DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION].chainId]
    ).getClient();
    const availablePairsResponse = await gqlFetchAll<AvailablePairsGraphqlResponse>(
      client,
      GET_AVAILABLE_PAIRS,
      {},
      'pairs',
      'network-only'
    );

    if (availablePairsResponse.data) {
      this.availablePairs = await Promise.all(
        availablePairsResponse.data.pairs.map<AvailablePair>((pair: AvailablePairResponse) => {
          const oldestCreatedPosition =
            (pair.positions && pair.positions[0] && pair.positions[0].createdAtTimestamp) || 0;
          const lastCreatedAt =
            oldestCreatedPosition > pair.createdAtTimestamp ? oldestCreatedPosition : pair.createdAtTimestamp;
          const swapInfo = activePositionsPerIntervalToHasToExecute(pair.activePositionsPerInterval);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const nextSwapAvailableAt: NextSwapAvailableAt = SWAP_INTERVALS_MAP.map((interval) =>
            calculateNextSwapAvailableAt(interval.value, swapInfo, pair.lastSwappedAt)
          );

          return {
            token0: pair.tokenA,
            token1: pair.tokenB,
            lastExecutedAt: (pair.swaps && pair.swaps[0] && pair.swaps[0].executedAtTimestamp) || 0,
            id: pair.id,
            lastCreatedAt,
            swapInfo,
            lastSwappedAt: pair.lastSwappedAt,
            nextSwapAvailableAt,
          };
        })
      );
    }

    this.allowedPairs = await this.meanApiService.getAllowedPairs();

    this.hasFetchedAvailablePairs = true;
  }

  // PAIR METHODS
  addNewPair(tokenA: Token, tokenB: Token, oracle: Oracles, frequencyType: BigNumber) {
    const [token0, token1] = sortTokens(tokenA, tokenB);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const swapInfo: SwapInfo = SWAP_INTERVALS_MAP.map(() => false);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const lastSwappedAt: LastSwappedAt = SWAP_INTERVALS_MAP.map(() => 0);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const nextSwapAvailableAt: NextSwapAvailableAt = SWAP_INTERVALS_MAP.map(() => 0);
    const freqIndex = findIndex(SWAP_INTERVALS_MAP, { value: frequencyType });

    swapInfo[freqIndex] = true;

    swapInfo[freqIndex] = true;
    lastSwappedAt[freqIndex] = DateTime.now().toSeconds();

    if (!this.availablePairExists(token0, token1)) {
      this.availablePairs.push({
        token0,
        token1,
        id: `${token0.address}-${token1.address}`,
        lastExecutedAt: 0,
        lastCreatedAt: Math.floor(Date.now() / 1000),
        swapInfo,
        lastSwappedAt,
        nextSwapAvailableAt,
      });
    } else {
      const pairIndex = findIndex(this.availablePairs, { id: `${token0.address}-${token1.address}` });
      if (pairIndex === -1) {
        return;
      }

      const newSwapInfo = this.availablePairs[pairIndex].swapInfo;
      newSwapInfo[freqIndex] = true;

      this.availablePairs[pairIndex] = {
        ...this.availablePairs[pairIndex],
        swapInfo: newSwapInfo,
      };
    }
  }

  availablePairExists(token0: Token, token1: Token) {
    return !!find(this.availablePairs, { id: `${token0.address}-${token1.address}` });
  }

  async getPairOracle(pair: { tokenA: string; tokenB: string }, isExistingPair: boolean): Promise<Oracles> {
    const connected = this.walletService.getAccount();

    if (!connected) {
      return ORACLES.CHAINLINK;
    }

    const currentNetwork = await this.walletService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const [tokenA, tokenB] = sortTokensByAddress(
      pair.tokenA === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : pair.tokenA,
      pair.tokenB === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : pair.tokenB
    );

    if (isExistingPair) {
      const oracleInstance = await this.contractService.getOracleInstance();
      const oracleInUse: Oracles = ORACLES.NONE;
      try {
        const oracleInUseAddress = (await oracleInstance.assignedOracle(tokenA, tokenB)).oracle;
        const chainlinkAddress = await this.contractService.getChainlinkOracleAddress();
        const isChainlink = oracleInUseAddress === chainlinkAddress;

        if (isChainlink) {
          return ORACLES.CHAINLINK;
        }

        const uniswapAddress = await this.contractService.getUniswapOracleAddress();
        const isUniswap = oracleInUseAddress === uniswapAddress;

        if (isUniswap) {
          return ORACLES.UNISWAP;
        }
      } catch (e) {
        console.error('Error fetching oracle in use for existing pair', pair, e);
      }

      return oracleInUse;
    }

    const chainLinkOracle = await this.contractService.getChainlinkOracleInstance();
    const uniswapOracle = await this.contractService.getUniswapOracleInstance();

    let oracleInUse: Oracles = ORACLES.NONE;
    try {
      const chainlinkSupportsPair = await chainLinkOracle.canSupportPair(tokenA, tokenB);
      if (chainlinkSupportsPair) {
        oracleInUse = ORACLES.CHAINLINK;
      } else {
        const uniswapSupportsPair = await uniswapOracle.canSupportPair(tokenA, tokenB);
        if (uniswapSupportsPair) {
          oracleInUse = ORACLES.UNISWAP;
        }
      }
    } catch (e) {
      console.error('Error fetching oracle support for pair', pair, e);
    }

    return oracleInUse;
  }

  async getPairLiquidity(token0: Token, token1: Token) {
    let tokenA;
    let tokenB;
    const currentNetwork = await this.walletService.getNetwork();
    if (token0.address < token1.address) {
      tokenA = token0.address;
      tokenB = token1.address;
    } else {
      tokenA = token1.address;
      tokenB = token0.address;
    }
    const poolsWithLiquidityResponse = await gqlFetchAll<PoolsLiquidityDataGraphqlResponse>(
      this.uniClient[LATEST_VERSION][currentNetwork.chainId].getClient(),
      GET_PAIR_LIQUIDITY,
      {
        tokenA,
        tokenB,
      },
      'pools'
    );

    let liquidity = 0;
    if (poolsWithLiquidityResponse.data) {
      liquidity = poolsWithLiquidityResponse.data.pools.reduce((acc: number, pool: PoolLiquidityData) => {
        pool.poolHourData.forEach((hourData) => {
          // eslint-disable-next-line no-param-reassign
          acc += parseFloat(hourData.volumeUSD);
        });

        return acc;
      }, 0);
    }

    return liquidity;
  }

  async canSupportPair(tokenFrom: Token, tokenTo: Token) {
    // if they are not connected we show everything as available
    if (!this.providerService.getProvider()) return true;

    const network = await this.walletService.getNetwork();

    const token0 = tokenFrom.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(network.chainId) : tokenFrom;
    const token1 = tokenTo.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(network.chainId) : tokenTo;

    const [tokenA, tokenB] = sortTokens(token0, token1);

    const foundAllowedPair = find(
      this.allowedPairs,
      (pair) => pair.tokenA.address === tokenA.address && pair.tokenB.address === tokenB.address
    );

    return Promise.resolve(!!foundAllowedPair);
  }
}
