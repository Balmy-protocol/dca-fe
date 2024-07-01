export enum IntervalSetActions {
  balance = 1000 * 60 * 5,
  selectedTokenBalance = 1000 * 30,
  // price = 1000 * 60 * 20,
  // transactions = 1000,
  allowance = 30000,
  tokens = 10000,
  globalBalance = 1000 * 60 * 1, // one minute
  strategyUpdate = 1000 * 60 * 60, // 1 hour
}

export enum TimeoutPromises {
  COMMON = '30s',
}
