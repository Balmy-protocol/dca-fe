export type ClaimWithBalance = Record<
  string,
  { balance: bigint; wethToClaim: bigint; daiToClaim: bigint; usdcToClaim: bigint }
>;
