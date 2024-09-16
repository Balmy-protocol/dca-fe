import { Wallet, WalletStatus, WalletType } from '@types';

type ToWalletParameter = Partial<DistributiveOmit<Wallet, 'status'>> & { status: WalletStatus };

export const toWallet = (wallet: ToWalletParameter): Wallet => {
  let baseWallet: Wallet = {
    address: '0xaddress',
    status: WalletStatus.disconnected,
    label: undefined,
    type: WalletType.external,
    isAuth: false,
  };

  if (wallet.status === WalletStatus.connected) {
    baseWallet = {
      ...baseWallet,
      ...wallet,
      status: WalletStatus.connected,
    };
  } else if (wallet.status === WalletStatus.disconnected) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    baseWallet = {
      ...baseWallet,
      ...wallet,
    };
  } else {
    throw new Error('Wallet status unknown');
  }

  return baseWallet;
};

export const getWalletsAddresses = (wallets: Wallet[]) => wallets.map(({ address }) => address.toLowerCase());
