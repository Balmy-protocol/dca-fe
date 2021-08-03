export const buildEtherscanTransaction = (tx: string) =>
  `https://${process.env.ETH_NETWORK === 'mainnet' ? '' : `${process.env.ETH_NETWORK}.`}etherscan.io/tx/${tx}`;

export const buildEtherscanAddress = (tx: string) =>
  `https://${process.env.ETH_Address === 'mainnet' ? '' : `${process.env.ETH_NETWORK}.`}etherscan.io/address/${tx}`;
