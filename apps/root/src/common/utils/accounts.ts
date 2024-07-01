import { Wallet, WalletStatus, WalletType } from '@types';

type ToWalletParameter = Partial<Omit<Wallet, 'status'>> & { status: WalletStatus };

export const toWallet = (wallet: ToWalletParameter): Wallet => {
  let baseWallet: Wallet = {
    address: '0xaddress',
    status: WalletStatus.disconnected,
    label: undefined,
    type: WalletType.external,
    isAuth: false,
    walletClient: undefined,
    providerInfo: undefined,
  };

  if (wallet.status === WalletStatus.connected) {
    if (!wallet.walletClient) {
      throw new Error('Get provider should be supplied for connected wallets');
    }
    if (!wallet.providerInfo) {
      throw new Error('Provider info should be supplied for connected wallets');
    }

    baseWallet = {
      ...baseWallet,
      ...wallet,
      status: WalletStatus.connected,
      walletClient: wallet.walletClient,
      providerInfo: wallet.providerInfo,
      chainId: wallet.chainId!,
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
