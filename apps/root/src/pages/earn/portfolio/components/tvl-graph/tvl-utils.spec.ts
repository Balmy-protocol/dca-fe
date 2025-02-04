import { EarnPosition } from 'common-types';
import { getDataForTVLGraph } from './tvl-utils';
import { toToken } from '@common/utils/currency';
import { parseUnits } from 'viem';

jest.mock('@common/utils/earn/parsing', () => ({
  parseUserStrategiesFinancialData: jest.fn().mockReturnValue({
    totalInvestedUsd: 100,
    currentProfitUsd: { asset: 100, total: 100 },
    currentProfitRate: { asset: 100, total: 100 },
    totalInvested: {},
    currentProfit: {},
    earnings: {
      year: {
        total: 100,
      },
    },
    monthlyEarnings: {},
    totalMonthlyEarnings: 0,
  }),
}));

const TIMESTAMP_1 = 1677628700;
const TIMESTAMP_2 = 1677628800;
const TIMESTAMP_3 = 1677628900;
const TIMESTAMP_4 = 1677629000;
const uniqueTimestampsCount = 4;

// Input is sorted by timestamp asc, output is sorted by timestamp desc
const mockedStrategies = [
  {
    historicalBalances: [
      { timestamp: TIMESTAMP_4, balances: [{ amount: { amountInUSD: '300' } }] },
      { timestamp: TIMESTAMP_2, balances: [{ amount: { amountInUSD: '200' } }] },
      { timestamp: TIMESTAMP_1, balances: [{ amount: { amountInUSD: '100' } }] },
    ],
    history: [],
    balances: [
      {
        token: toToken({ address: '0x0' }),
        amount: { amount: parseUnits('100', 18), amountInUnits: '100', amountInUSD: '100' },
        profit: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
      },
    ],
    strategy: {
      id: '0xstrategy-1',
      asset: toToken({ address: '0x0' }),
    },
  },
  {
    historicalBalances: [
      { timestamp: TIMESTAMP_3, balances: [{ amount: { amountInUSD: '100' } }] },
      { timestamp: TIMESTAMP_2, balances: [{ amount: { amountInUSD: '100' } }] },
      { timestamp: TIMESTAMP_1, balances: [{ amount: { amountInUSD: '100' } }] },
    ],
    history: [],
    balances: [
      {
        token: toToken({ address: '0x0' }),
        amount: { amount: parseUnits('100', 18), amountInUnits: '100', amountInUSD: '100' },
        profit: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
      },
    ],
    strategy: {
      id: '0xstrategy-2',
      asset: toToken({ address: '0x0' }),
    },
  },
] as unknown as EarnPosition[];

describe('tvl-utils', () => {
  describe('getDataForTVLGraph', () => {
    const mockTimestamp = 1677699000; // Some timestamp after all historical balances
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockImplementation(() => mockTimestamp * 1000);
    });

    it('should add missing timestamps from other strategies historical balances', () => {
      const result = getDataForTVLGraph({
        userStrategies: mockedStrategies,
        mode: 'light',
      });

      const upToNowTimestamps = result.map((d) => d.timestamp).slice(0, uniqueTimestampsCount);
      expect(upToNowTimestamps).toEqual([TIMESTAMP_1, TIMESTAMP_2, TIMESTAMP_3, TIMESTAMP_4]);
    });
    it('should merge tvl for the same timestamp', () => {
      const result = getDataForTVLGraph({
        userStrategies: mockedStrategies,
        mode: 'light',
      });

      const upToNowTVL = result.map((d) => d.tvl).slice(0, uniqueTimestampsCount);
      expect(upToNowTVL).toEqual([200, 300, 300, 400]);
    });
  });
});
