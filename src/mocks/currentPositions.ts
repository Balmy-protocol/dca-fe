import { WETH, DAI, UNI } from './tokens';

const mockedCurrentPositions = [
  {
    from: UNI.address,
    to: DAI.address,
    remainingDays: 6,
    startedAt: new Date(1623624089 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
    id: 1,
  },
  {
    from: UNI.address,
    to: DAI.address,
    remainingDays: 4,
    startedAt: new Date(1623462089 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
    id: 2,
  },
  {
    from: DAI.address,
    to: UNI.address,
    remainingDays: 2,
    startedAt: new Date(1623289289 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
    id: 3,
  },
  {
    from: WETH.address,
    to: DAI.address,
    remainingDays: 1,
    startedAt: new Date(1623030089 * 1000),
    exercised: 50,
    remainingLiquidity: 0.00004,
    id: 999999,
  },
];

export default mockedCurrentPositions;
