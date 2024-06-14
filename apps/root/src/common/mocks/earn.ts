import { SdkStrategy, StrategyRiskLevel, StrategyYieldType } from 'common-types';

export const sdkStrategyMock: SdkStrategy = {
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
    fees: [{ percentage: 0.1, type: 'deposit' }],
    name: 'X',
    logo: 'ipfs://QmSepeRhMhihdz38hVuzmowHD8AFuBmGbm4EFLX8YFr4Pp',
  },
  riskLevel: StrategyRiskLevel.MEDIUM,
};

export const sdkStrategyMock2: SdkStrategy = {
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
          address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
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
    fees: [{ percentage: 0.1, type: 'performance' }],
    name: 'Y',
    logo: 'ipfs://QmSepeRhMhihdz38hVuzmowHD8AFuBmGbm4EFLX8YFr4Pp',
  },
  riskLevel: StrategyRiskLevel.LOW,
};
