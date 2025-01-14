import { nowInSeconds } from '@common/utils/time';
import { ONE_DAY } from '@constants';
import {
  FeeType,
  StrategyYieldType,
  BaseSdkEarnPosition,
  EarnPositionActionType,
  DisplayStrategy,
  EarnPosition,
  Token,
  EarnPermission,
  WithdrawType,
  TokenType,
  SdkStrategy,
} from 'common-types';
import { DateTime } from 'luxon';
import { Address } from 'viem';

// Function to generate random APY value between 1 and 20 with up to 2 decimal places
function generateRandomAPY(): number {
  return parseFloat((Math.random() * (20 - 1) + 1).toFixed(2));
}

// Function to generate an array of objects with timestamps and APYs
function generateAPYData(): { timestamp: number; apy: number; name: string }[] {
  const data: { timestamp: number; apy: number; name: string }[] = [];
  const now = nowInSeconds();
  const oneDay = 24 * 60 * 60; // Seconds in one day

  for (let i = 0; i < 30; i++) {
    const timestamp = now - i * oneDay;
    const apy = generateRandomAPY();
    data.push({ timestamp, apy, name: DateTime.fromSeconds(timestamp).toFormat('dd LLL') });
  }

  // Reverse the array to have timestamps from 90 days ago to today
  return data.reverse();
}

export const sdkStrategyMock: SdkStrategy = {
  depositTokens: [
    {
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      decimals: 6,
      name: 'USDC',
      price: 1,
      symbol: 'USDC',
      type: TokenType.ASSET,
    },
  ],
  farm: {
    chainId: 10,
    id: '1-0xaave',
    name: 'AAVE',
    tvl: 1 * 10 ** 6,
    apy: 8,
    type: StrategyYieldType.LENDING,
    asset: {
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      decimals: 6,
      name: 'USDC',
      price: 1,
      symbol: 'USDC',
      withdrawTypes: [WithdrawType.IMMEDIATE],
    },
    rewards: {
      apy: 8,
      tokens: [
        {
          address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
          decimals: 6,
          name: 'USDC',
          price: 1,
          symbol: 'USDC',
          withdrawTypes: [WithdrawType.IMMEDIATE],
        },
      ],
    },
  },
  id: '1-0xaaveUsdcOptimism' as `${number}-${Lowercase<string>}-${number}`,
  fees: [
    { percentage: 0.2, type: FeeType.DEPOSIT },
    { percentage: 10, type: FeeType.RESCUE },
    { percentage: 0.5, type: FeeType.WITHDRAW },
    { percentage: 8.3, type: FeeType.PERFORMANCE },
  ],
  guardian: {
    id: 'x-guardian',
    description: 'X Guardian protection',
    fees: [
      { percentage: 0.2, type: FeeType.DEPOSIT },
      { percentage: 10, type: FeeType.RESCUE },
      { percentage: 0.5, type: FeeType.WITHDRAW },
      { percentage: 8.3, type: FeeType.PERFORMANCE },
    ],
    name: 'X Guardian',
    logo: 'ipfs://QmSepeRhMhihdz38hVuzmowHD8AFuBmGbm4EFLX8YFr4Pp',
    links: {
      discord: 'https://github.com/balmy-protocol',
      twitter: 'https://twitter.com/balmy_xyz',
      website: 'http://discord.balmy.xyz',
    },
  },
};

const apyData = generateAPYData();

export const sdkDetailedStrategyMock: SdkStrategy = {
  ...sdkStrategyMock,
  historicalAPY: apyData,
  historicalTVL: [
    {
      timestamp: 1,
      tvl: 1 * 10 ** 6,
    },
    {
      timestamp: 2,
      tvl: 1.5 * 10 ** 6,
    },
    {
      timestamp: 3,
      tvl: 2 * 10 ** 6,
    },
  ],
};

export const sdkStrategyMock2: SdkStrategy = {
  farm: {
    chainId: 137,
    id: '1-0xyearn',
    name: 'yearn.finance',
    tvl: 1 * 10 ** 12,
    apy: 10,
    asset: {
      address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      decimals: 6,
      name: 'USD Coin',
      price: 1,
      symbol: 'USDC',
      withdrawTypes: [WithdrawType.IMMEDIATE],
    },
    type: StrategyYieldType.LENDING,
    rewards: {
      apy: 10,
      tokens: [
        {
          address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
          decimals: 8,
          name: 'Wrapped BTC',
          price: 70000,
          symbol: 'WBTC',
          withdrawTypes: [WithdrawType.IMMEDIATE],
        },
      ],
    },
  },
  depositTokens: [
    {
      address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      decimals: 6,
      name: 'USD Coin',
      price: 1,
      symbol: 'USDC',
      type: TokenType.ASSET,
    },
  ],
  id: '1-0xyearnDaiPolygon' as `${number}-${Lowercase<string>}-${number}`,
  fees: [{ percentage: 0.1, type: FeeType.PERFORMANCE }],
  guardian: {
    id: 'y-guardian',
    description: 'Y Guardian protection',
    fees: [{ percentage: 0.1, type: FeeType.PERFORMANCE }],
    name: 'Y Guardian',
    logo: 'ipfs://QmSepeRhMhihdz38hVuzmowHD8AFuBmGbm4EFLX8YFr4Pp',
    // links: {
    //   discord: 'https://discord.gg/yearn',
    //   twitter: 'https://twitter.com/yearn',
    //   website: 'https://yearn.finance',
    // },
  },
};

const BALANCES_ROWS = Array.from(Array(365).keys());

const generateHistoricalBalances = (strat: SdkStrategy) => {
  return BALANCES_ROWS.map((_, i) => {
    const amount = BigInt(Math.floor(Math.random() * 10));
    const profitAmount = BigInt(Math.floor(Math.random() * 10));

    return {
      timestamp: nowInSeconds() - Number(ONE_DAY) * i,
      balances: [
        {
          token: strat.farm.asset,
          amount: {
            amount: 1000000n * amount,
            amountInUnits: amount.toString(),
            amountInUSD: amount.toString(),
          },
          profit: {
            amount: 1000000n * profitAmount,
            amountInUnits: profitAmount.toString(),
            amountInUSD: profitAmount.toString(),
          },
        },
      ],
    };
  });
};

export const createEmptyEarnPosition = (strategy: DisplayStrategy, owner: Address, mainAsset: Token): EarnPosition => ({
  id: `0-${owner}-0` as `${number}-0x${Lowercase<string>}-${number}`,
  createdAt: nowInSeconds(),
  lastUpdatedAt: nowInSeconds(),
  lastUpdatedAtFromApi: nowInSeconds(),
  owner,
  permissions: {},
  strategy: { ...strategy, userPositions: [] },
  balances: [
    {
      token: mainAsset,
      amount: {
        amount: 0n,
        amountInUnits: '0',
        amountInUSD: '0',
      },
      profit: {
        amount: 0n,
        amountInUnits: '0',
        amountInUSD: '0',
      },
    },
  ],
  historicalBalances: [],
  hasFetchedHistory: false,
  history: [],
});

export const sdkBaseEarnPositionMock: BaseSdkEarnPosition = {
  id: '10-0xusdc-1',
  createdAt: 1720042607,
  lastUpdatedAt: 1720042607,
  owner: '0xaddress',
  permissions: {
    '0xboth': [EarnPermission.INCREASE, EarnPermission.WITHDRAW],
    '0xincrease': [EarnPermission.INCREASE],
    '0xwithdraw': [EarnPermission.WITHDRAW],
  },
  strategy: { ...sdkStrategyMock, id: `${sdkStrategyMock.id}-0` as `${number}-${Lowercase<string>}-${number}` },
  balances: [
    {
      token: sdkStrategyMock.farm.asset,
      amount: {
        amount: 1000000n,
        amountInUnits: '1',
        amountInUSD: '1',
      },
      profit: {
        amount: 1000000n,
        amountInUnits: '1',
        amountInUSD: '1',
      },
    },
  ],
  historicalBalances: generateHistoricalBalances(sdkStrategyMock),
  history: [],
};

export const sdkDetailedEarnPositionMock: BaseSdkEarnPosition = {
  ...sdkBaseEarnPositionMock,
  history: [
    {
      action: EarnPositionActionType.CREATED,
      owner: '0xaddress',
      permissions: {},
      deposited: {
        amount: 1000000n,
        amountInUnits: '1',
        amountInUSD: '1',
      },
      tx: {
        hash: '0xhash',
        timestamp: apyData[apyData.length - 5].timestamp,
      },
      assetPrice: 1,
    },
    {
      action: EarnPositionActionType.INCREASED,
      deposited: {
        amount: 1000000n,
        amountInUnits: '1',
        amountInUSD: '1',
      },
      tx: {
        hash: '0xhash',
        timestamp: apyData[apyData.length - 4].timestamp,
      },
      assetPrice: 1,
    },
    {
      action: EarnPositionActionType.WITHDREW,
      withdrawn: [
        {
          token: sdkStrategyMock.farm.asset,
          amount: {
            amount: 1000000n,
            amountInUnits: '1',
            amountInUSD: '1',
          },
          withdrawType: WithdrawType.IMMEDIATE,
        },
        {
          token: sdkStrategyMock.farm.rewards!.tokens[0],
          amount: {
            amount: 1000000n,
            amountInUnits: '1',
            amountInUSD: '1',
          },
          withdrawType: WithdrawType.IMMEDIATE,
        },
      ],
      recipient: sdkBaseEarnPositionMock.owner,
      tx: {
        hash: '0xhash',
        timestamp: apyData[apyData.length - 3].timestamp,
      },
    },
    {
      action: EarnPositionActionType.WITHDREW,
      withdrawn: [
        {
          token: sdkStrategyMock.farm.asset,
          amount: {
            amount: 1000000n,
            amountInUnits: '1',
            amountInUSD: '1',
          },
          withdrawType: WithdrawType.IMMEDIATE,
        },
      ],
      recipient: sdkBaseEarnPositionMock.owner,
      tx: {
        hash: '0xhash',
        timestamp: apyData[apyData.length - 2].timestamp,
      },
    },
    {
      action: EarnPositionActionType.INCREASED,
      deposited: {
        amount: 1000000n,
        amountInUnits: '1',
        amountInUSD: '1',
      },
      tx: {
        hash: '0xhash',
        timestamp: apyData[apyData.length - 1].timestamp,
      },
      assetPrice: 1,
    },
  ],
};
