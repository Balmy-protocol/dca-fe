import { WETH, DAI } from './tokens';

const mockedCurrentPositions = [
  {
    from: WETH.address,
    to: DAI.address,
    remainingDays: 6,
    startedAt: new Date(1623624089 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
  },
  {
    from: WETH.address,
    to: DAI.address,
    remainingDays: 4,
    startedAt: new Date(1623462089 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
  },
  {
    from: WETH.address,
    to: DAI.address,
    remainingDays: 2,
    startedAt: new Date(1623289289 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
  },
  {
    from: WETH.address,
    to: DAI.address,
    remainingDays: 1,
    startedAt: new Date(1623030089 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
  },
];

export default mockedCurrentPositions;
