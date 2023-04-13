import { BigNumber } from 'ethers';

export type ClaimWithBalance = Record<
  string,
  { balance: BigNumber; wethToClaim: BigNumber; daiToClaim: BigNumber; usdcToClaim: BigNumber }
>;
