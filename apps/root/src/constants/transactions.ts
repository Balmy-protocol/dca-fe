import { Chains } from '@balmy/sdk';

export const DEFAULT_TRANSACTION_RETRIES = 10;
export const RABBY_GAS_ACCOUNT_RETRIES = 60;

export const TRANSACTION_RETRIES_PER_NETWORK = {
  [Chains.ETHEREUM.chainId]: 15,
  [Chains.ROOTSTOCK.chainId]: 90,
};

export const getTransactionRetries = (chainId: number) => {
  return TRANSACTION_RETRIES_PER_NETWORK[chainId] || DEFAULT_TRANSACTION_RETRIES;
};
