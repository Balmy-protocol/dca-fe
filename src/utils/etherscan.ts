export const buildEtherscanTransaction = (tx: string) =>
  `https://${process.env.ETH_NETWORK === 'ropsten' ? 'ropsten.' : ''}etherscan.io/tx/${tx}`;

export const buildEtherscanAddress = (tx: string) =>
  `https://${process.env.ETH_Address === 'ropsten' ? 'ropsten.' : ''}etherscan.io/address/${tx}`;
