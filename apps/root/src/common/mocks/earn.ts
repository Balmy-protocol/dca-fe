import {
  FeeType,
  SdkBaseDetailedStrategy,
  SdkBaseStrategy,
  StrategyRiskLevel,
  StrategyYieldType,
  BaseSdkEarnPosition,
  DetailedSdkEarnPosition,
  EarnPositionActionType,
} from 'common-types';
import { DateTime } from 'luxon';

// Function to generate random APY value between 1 and 20 with up to 2 decimal places
function generateRandomAPY(): number {
  return parseFloat((Math.random() * (20 - 1) + 1).toFixed(2));
}

// Function to generate an array of objects with timestamps and APYs
function generateAPYData(): { timestamp: number; apy: number; name: string }[] {
  const data: { timestamp: number; apy: number; name: string }[] = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in one day

  for (let i = 0; i < 30; i++) {
    const timestamp = now - i * oneDay;
    const apy = generateRandomAPY();
    data.push({ timestamp, apy, name: DateTime.fromMillis(timestamp).toFormat('dd LLL') });
  }

  // Reverse the array to have timestamps from 90 days ago to today
  return data.reverse();
}

export const sdkStrategyMock: SdkBaseStrategy = {
  farm: {
    id: 'aave',
    name: 'AAVE',
    tvl: 1 * 10 ** 6,
    apy: 8,
    type: StrategyYieldType.LENDING,
    asset: {
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      decimals: 6,
      name: 'USDC',
      price: 1,
      symbol: 'USDC',
    },
    chainId: 10,
    rewards: {
      apy: 8,
      tokens: [
        {
          address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
          decimals: 6,
          name: 'USDC',
          price: 1,
          symbol: 'USDC',
        },
      ],
    },
  },
  id: 'aave-usdc-optimism',
  guardian: {
    id: 'x-guardian',
    description: 'X Guardian protection',
    fees: [
      { percentage: 0.2, type: FeeType.deposit },
      { percentage: 10, type: FeeType.save },
      { percentage: 0.5, type: FeeType.withdraw },
      { percentage: 8.3, type: FeeType.performance },
    ],
    name: 'X',
    logo: 'ipfs://QmSepeRhMhihdz38hVuzmowHD8AFuBmGbm4EFLX8YFr4Pp',
  },
  riskLevel: StrategyRiskLevel.MEDIUM,
};

const apyData = generateAPYData();

export const sdkDetailedStrategyMock: SdkBaseDetailedStrategy = {
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

export const sdkStrategyMock2: SdkBaseStrategy = {
  farm: {
    id: 'yearn',
    name: 'yearn.finance',
    tvl: 1 * 10 ** 12,
    apy: 10,
    asset: {
      address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      decimals: 6,
      name: 'USD Coin',
      price: 1,
      symbol: 'USDC',
    },
    chainId: 137,
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
        },
      ],
    },
  },
  id: 'yearn-dai-polygon',
  guardian: {
    id: 'y-guardian',
    description: 'Y Guardian protection',
    fees: [{ percentage: 0.1, type: FeeType.performance }],
    name: 'Y',
    logo: 'ipfs://QmSepeRhMhihdz38hVuzmowHD8AFuBmGbm4EFLX8YFr4Pp',
  },
  riskLevel: StrategyRiskLevel.LOW,
};

export const sdkBaseEarnPositionMock: BaseSdkEarnPosition = {
  id: '10-0xusdc-1',
  createdAt: 1720042607,
  owner: '0xaddress',
  permissions: {
    '0xboth': ['INCREASE', 'WITHDRAW'],
    '0xincrease': ['INCREASE'],
    '0xwithdraw': ['WITHDRAW'],
  },
  strategy: { ...sdkStrategyMock, id: `${sdkStrategyMock.id}-0` },
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
  historicalBalances: [
    {
      timestamp: 1720042607,
      balances: [
        {
          token: sdkStrategyMock.farm.asset,
          amount: {
            amount: 1000000n,
            amountInUnits: '1',
            amountInUSD: '1',
          },
          profit: { amount: 1000000n, amountInUnits: '1', amountInUSD: '1' },
        },
      ],
    },
  ],
};

export const sdkDetailedEarnPositionMock: DetailedSdkEarnPosition = {
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
        timestamp: 1720042607,
      },
      timestamp: apyData[apyData.length - 5].timestamp,
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
        timestamp: 1720042607,
      },
      timestamp: apyData[apyData.length - 4].timestamp,
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
        },
      ],
      recipient: sdkBaseEarnPositionMock.owner,
      tx: {
        hash: '0xhash',
        timestamp: 1720042607,
      },
      timestamp: apyData[apyData.length - 3].timestamp,
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
        },
      ],
      recipient: sdkBaseEarnPositionMock.owner,
      tx: {
        hash: '0xhash',
        timestamp: 1720042607,
      },
      timestamp: apyData[apyData.length - 2].timestamp,
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
        timestamp: 1720042607,
      },
      timestamp: apyData[apyData.length - 1].timestamp,
    },
  ],
};