import find from 'lodash/find';
import {
  Token,
  AvailablePairs,
  PoolLiquidityData,
  GetNextSwapInfo,
  PoolsLiquidityDataGraphqlResponse,
  SwapsToPerform,
  Oracles,
  AvailablePairsGraphqlResponse,
  AvailablePairResponse,
} from 'types';
import { sortTokens, sortTokensByAddress } from 'utils/parsing';
import { buildSwapInput } from 'utils/swap';

// GQL queries
import GET_PAIR_LIQUIDITY from 'graphql/getPairLiquidity.graphql';
import GET_AVAILABLE_PAIRS from 'graphql/getAvailablePairs.graphql';
import gqlFetchAll from 'utils/gqlFetchAll';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from 'mocks/tokens';
import { ORACLES, POSITION_VERSION_3, SWAP_INTERVALS_MAP, PositionVersions } from 'config/constants';

import GraphqlService from './graphql';
import ContractService from './contractService';
import WalletService from './walletService';

export default class PairService {
  availablePairs: AvailablePairs;

  contractService: ContractService;

  walletService: WalletService;

  uniClient: Record<PositionVersions, Record<number, GraphqlService>>;

  apolloClient: Record<PositionVersions, Record<number, GraphqlService>>;

  hasFetchedAvailablePairs: boolean;

  constructor(
    walletService: WalletService,
    contractService: ContractService,
    DCASubgraphs?: Record<PositionVersions, Record<number, GraphqlService>>,
    UNISubgraphs?: Record<PositionVersions, Record<number, GraphqlService>>
  ) {
    this.contractService = contractService;
    this.walletService = walletService;
    this.availablePairs = [];
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

  async fetchAvailablePairs() {
    const network = await this.walletService.getNetwork();
    console.log(network);
    console.log(this.apolloClient[POSITION_VERSION_3]);
    console.log(this.apolloClient[POSITION_VERSION_3][network.chainId]);
    const availablePairsResponse = await gqlFetchAll<AvailablePairsGraphqlResponse>(
      this.apolloClient[POSITION_VERSION_3][network.chainId].getClient(),
      GET_AVAILABLE_PAIRS,
      {},
      'pairs',
      'network-only'
    );

    if (availablePairsResponse.data) {
      this.availablePairs = await Promise.all(
        availablePairsResponse.data.pairs.map(async (pair: AvailablePairResponse) => {
          const oldestCreatedPosition =
            (pair.positions && pair.positions[0] && pair.positions[0].createdAtTimestamp) || 0;
          const lastCreatedAt =
            oldestCreatedPosition > pair.createdAtTimestamp ? oldestCreatedPosition : pair.createdAtTimestamp;
          let pairOracle;
          try {
            pairOracle = await this.getPairOracle({ tokenA: pair.tokenA.address, tokenB: pair.tokenB.address }, true);
          } catch {
            pairOracle = ORACLES.CHAINLINK;
          }

          return {
            token0: pair.tokenA,
            token1: pair.tokenB,
            lastExecutedAt: (pair.swaps && pair.swaps[0] && pair.swaps[0].executedAtTimestamp) || 0,
            id: pair.id,
            lastCreatedAt,
            swapInfo: pair.nextSwapAvailableAt,
            oracle: pairOracle,
          };
        })
      );
    }

    this.hasFetchedAvailablePairs = true;
  }

  // PAIR METHODS
  addNewPair(tokenA: Token, tokenB: Token, oracle: Oracles) {
    const [token0, token1] = sortTokens(tokenA, tokenB);

    if (this.availablePairExists(token0, token1)) {
      this.availablePairs.push({
        token0,
        token1,
        id: `${token0.address}-${token1.address}`,
        lastExecutedAt: 0,
        lastCreatedAt: Math.floor(Date.now() / 1000),
        swapInfo: '1',
        oracle,
      });
    }
  }

  availablePairExists(token0: Token, token1: Token) {
    return !!find(this.availablePairs, { id: `${token0.address}-${token1.address}` });
  }

  async getPairOracle(pair: { tokenA: string; tokenB: string }, isExistingPair: boolean): Promise<Oracles> {
    const currentNetwork = await this.walletService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const [tokenA, tokenB] = sortTokensByAddress(
      pair.tokenA === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : pair.tokenA,
      pair.tokenB === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : pair.tokenB
    );

    if (isExistingPair) {
      const oracleInstance = await this.contractService.getOracleInstance();
      let oracleInUse: Oracles = ORACLES.NONE;
      try {
        oracleInUse = await oracleInstance.oracleInUse(tokenA, tokenB);
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

  async getNextSwapInfo(pair: { tokenA: string; tokenB: string }): Promise<GetNextSwapInfo> {
    const [tokenA, tokenB] = sortTokensByAddress(pair.tokenA, pair.tokenB);

    const hubContract = await this.contractService.getHubInstance();

    const { tokens, pairIndexes } = buildSwapInput([{ tokenA, tokenB }], []);

    let swapsToPerform: SwapsToPerform[] = [];
    try {
      const nextSwapInfo = await hubContract.getNextSwapInfo(tokens, pairIndexes);

      const { pairs } = nextSwapInfo;

      const [{ intervalsInSwap }] = pairs;

      swapsToPerform = SWAP_INTERVALS_MAP.filter(
        // eslint-disable-next-line no-bitwise
        (swapInterval) => swapInterval.key & parseInt(intervalsInSwap, 16)
      ).map((swapInterval) => ({ interval: swapInterval.value.toNumber() }));
    } catch {
      console.error('Error fetching pair', pair);
    }

    return {
      swapsToPerform,
    };
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
      this.uniClient[POSITION_VERSION_3][currentNetwork.chainId].getClient(),
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

  async canSupportPair(token0: Token, token1: Token) {
    const [tokenA, tokenB] = sortTokens(token0, token1);

    // if they are not connected we show everything as available
    if (!this.walletService.getClient()) return true;

    const network = await this.walletService.getNetwork();

    const oracleInstance = await this.contractService.getOracleInstance();

    return oracleInstance.canSupportPair(
      tokenA.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(network.chainId).address : tokenA.address,
      tokenB.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(network.chainId).address : tokenB.address
    );
  }
}
