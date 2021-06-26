export const buildEtherscanTransaction = (tx: string) =>
  `https://${process.env.ETH_NETWORK === 'ropsten' ? 'ropsten.' : ''}etherscan.io/tx/${tx}`;
