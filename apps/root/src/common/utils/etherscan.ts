import { EXPLORER_URL } from '@constants';

export const buildEtherscanTransaction = (tx: string, network: number) => `${EXPLORER_URL[network]}tx/${tx}`;

export const buildEtherscanAddress = (tx: string, network: number) => `${EXPLORER_URL[network]}address/${tx}`;

export const buildEtherscanToken = (address: string, network: number) => `${EXPLORER_URL[network]}token/${address}`;

export const buildEtherscanBase = (network: number) => `${EXPLORER_URL[network]}`;
