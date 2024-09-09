/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import WalletConnectLogo from '../logos/walletconnect-circle.svg';
// @ts-ignore
import PortisLogo from '../logos/portis.svg';
// @ts-ignore
import FortmaticLogo from '../logos/fortmatic.svg';
// @ts-ignore
import VenlyLogo from '../logos/venly.svg';
// @ts-ignore
import TorusLogo from '../logos/torus.svg';
// @ts-ignore
import AuthereumLogo from '../logos/authereum.svg';
// @ts-ignore
import BurnerWalletLogo from '../logos/burnerwallet.png';
// @ts-ignore
import MEWwallet from '../logos/mewwallet.png';
// @ts-ignore
import DcentWalletLogo from '../logos/dcentwallet.png';
// @ts-ignore
import LedgerLogo from '../logos/ledger.png';
// @ts-ignore
import BitskiLogo from '../logos/bitski.svg';
// @ts-ignore
import OperaLogo from '../logos/opera.svg';
// @ts-ignore
import FrameLogo from '../logos/frame.svg';
// @ts-ignore
import BinanceChainWalletLogo from '../logos/binancechainwallet.svg';
// @ts-ignore
import CoinbaseWalletLogo from '../logos/coinbasewallet.svg';
// @ts-ignore
import Web3AuthLogo from '../logos/web3auth.svg';
// @ts-ignore
import SequenceLogo from '../logos/sequence.svg';
// @ts-ignore
import BitkeepLogo from '../logos/bitkeepwallet.png';
// @ts-ignore
import StarzWalletLogo from '../logos/starzwallet.svg';

import { IProviderInfo } from '../../types';

// eslint-disable-next-line import/export
export * from '../injected';

export const WALLETCONNECT: IProviderInfo = {
  id: 'walletconnect',
  name: 'WalletConnect',
  logo: WalletConnectLogo as unknown as string,
  type: 'qrcode',
  check: 'isWalletConnect',
  package: {
    required: [['infuraId', 'rpc']],
  },
};

export const PORTIS: IProviderInfo = {
  id: 'portis',
  name: 'Portis',
  logo: PortisLogo as unknown as string,
  type: 'web',
  check: 'isPortis',
  package: {
    required: ['id'],
  },
};

export const FORTMATIC: IProviderInfo = {
  id: 'fortmatic',
  name: 'Fortmatic',
  logo: FortmaticLogo as unknown as string,
  type: 'web',
  check: 'isFortmatic',
  package: {
    required: ['key'],
  },
};

export const TORUS: IProviderInfo = {
  id: 'torus',
  name: 'Torus',
  logo: TorusLogo as unknown as string,
  type: 'web',
  check: 'isTorus',
};

export const VENLY: IProviderInfo = {
  id: 'venly',
  name: 'Venly',
  logo: VenlyLogo as unknown as string,
  type: 'web',
  check: 'isVenly',
  package: {
    required: ['clientId'],
  },
};

export const AUTHEREUM: IProviderInfo = {
  id: 'authereum',
  name: 'Authereum',
  logo: AuthereumLogo as unknown as string,
  type: 'web',
  check: 'isAuthereum',
};

export const BURNERCONNECT: IProviderInfo = {
  id: 'burnerconnect',
  name: 'Burner Connect',
  logo: BurnerWalletLogo as unknown as string,
  type: 'web',
  check: 'isBurnerProvider',
};

export const MEWCONNECT: IProviderInfo = {
  id: 'mewconnect',
  name: 'MEW wallet',
  logo: MEWwallet as unknown as string,
  type: 'qrcode',
  check: 'isMEWconnect',
  package: {
    required: [['infuraId', 'rpc']],
  },
};

export const DCENT: IProviderInfo = {
  id: 'dcentwallet',
  name: "D'CENT",
  logo: DcentWalletLogo as unknown as string,
  type: 'hardware',
  check: 'isDcentWallet',
  package: {
    required: ['rpcUrl'],
  },
};

export const LEDGER: IProviderInfo = {
  id: 'ledger',
  name: 'Ledger',
  logo: LedgerLogo as unknown as string,
  type: 'hardware',
  check: 'isLedgerConnect',
};

export const BITSKI: IProviderInfo = {
  id: 'bitski',
  name: 'Bitski',
  logo: BitskiLogo as unknown as string,
  type: 'web',
  check: 'isBitski',
  package: {
    required: ['clientId', 'callbackUrl'],
  },
};

export const FRAME: IProviderInfo = {
  id: 'frame',
  name: 'Frame',
  logo: FrameLogo as unknown as string,
  type: 'web',
  check: 'isFrameNative',
};

export const RABBY: IProviderInfo = {
  id: 'rabby',
  name: 'Rabby',
  logo: '',
  type: 'web',
  check: 'isRabby',
};

export const BINANCECHAINWALLET: IProviderInfo = {
  id: 'binancechainwallet',
  name: 'Binance Chain',
  logo: BinanceChainWalletLogo as unknown as string,
  type: 'injected',
  check: 'isBinanceChainWallet',
};

/**
 * @deprecated Use CoinbaseWalletSdk
 */
export const WALLETLINK: IProviderInfo = {
  id: 'walletlink',
  name: 'Coinbase Wallet',
  logo: CoinbaseWalletLogo as unknown as string,
  type: 'qrcode',
  check: 'isWalletLink',
  package: {
    required: [['appName', 'infuraId', 'rpc']],
  },
};

export const COINBASEWALLET: IProviderInfo = {
  id: 'coinbasewallet',
  name: 'Coinbase',
  logo: CoinbaseWalletLogo as unknown as string,
  type: 'injected',
  check: 'isWalletLink',
  package: {
    required: [['appName', 'infuraId', 'rpc']],
  },
};

export const SEQUENCE: IProviderInfo = {
  id: 'sequence',
  name: 'Sequence',
  logo: SequenceLogo as unknown as string,
  type: 'web',
  check: 'isSequenceWeb',
};

// eslint-disable-next-line import/export
export const OPERA: IProviderInfo = {
  id: 'opera',
  name: 'Opera',
  logo: OperaLogo as unknown as string,
  type: 'injected',
  check: 'isOpera',
};

export const WEB3AUTH: IProviderInfo = {
  id: 'web3auth',
  name: 'Web3Auth',
  logo: Web3AuthLogo as unknown as string,
  type: 'injected',
  check: 'isWeb3Auth',
};

// eslint-disable-next-line import/export
export const BITKEEPWALLET: IProviderInfo = {
  id: 'bitkeep',
  name: 'BitKeep Wallet',
  logo: BitkeepLogo as unknown as string,
  type: 'injected',
  check: 'isBitKeep',
};

export const STARZWALLET: IProviderInfo = {
  id: 'starzwallet',
  name: '99Starz',
  logo: StarzWalletLogo as unknown as string,
  type: 'injected',
  check: 'isStarzWallet',
};

/* eslint-enable @typescript-eslint/ban-ts-comment */
