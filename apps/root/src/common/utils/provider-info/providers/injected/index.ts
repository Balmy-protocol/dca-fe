/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IProviderInfo } from '../../types';

// @ts-ignore
import Web3DefaultLogo from '../logos/web3-default.svg';
// @ts-ignore
import MetaMaskLogo from '../logos/metamask.svg';
// @ts-ignore
import SafeLogo from '../logos/safe.svg';
// @ts-ignore
import NiftyWalletLogo from '../logos/niftyWallet.png';
// @ts-ignore
import TrustLogo from '../logos/trust.svg';
// @ts-ignore
import DapperLogo from '../logos/dapper.png';
// @ts-ignore
import CoinbaseLogo from '../logos/coinbase.svg';
// @ts-ignore
import CipherLogo from '../logos/cipher.svg';
// @ts-ignore
import imTokenLogo from '../logos/imtoken.svg';
// @ts-ignore
import StatusLogo from '../logos/status.svg';
// @ts-ignore
import TokenaryLogo from '../logos/tokenary.png';
// @ts-ignore
import OperaLogo from '../logos/opera.svg';
// @ts-ignore
import FrameLogo from '../logos/frame.svg';
// @ts-ignore
import LiqualityLogo from '../logos/liquality.png';
// @ts-ignore
import BoltXLogo from '../logos/boltx.svg';
// @ts-ignore
import MathWalletLogo from '../logos/mathwallet.png';
// @ts-ignore
import RWalletLogo from '../logos/rwallet.svg';
// @ts-ignore
import BitpieLogo from '../logos/bitpie.svg';
// @ts-ignore
import XDEFILogo from '../logos/xdefi.svg';
// @ts-ignore
import CeloExtensionWalletLogo from '../logos/celoExtensionWallet.svg';
// @ts-ignore
import BlockWalletLogo from '../logos/blockwallet.svg';
// @ts-ignore
import TallyLogo from '../logos/tally.svg';
// @ts-ignore
import PortalLogo from '../logos/portal.svg';
// @ts-ignore
import SequenceLogo from '../logos/sequence.svg';
// @ts-ignore
import BraveLogo from '../logos/brave.svg';
// @ts-ignore
import RabbyLogo from '../logos/rabby.svg';
// @ts-ignore
import BitkeepLogo from '../logos/bitkeepwallet.png';
// @ts-ignore
import ClvLogo from '../logos/clv.svg';
// @ts-ignore
import TokenPocketLogo from '../logos/tokenpocket.svg';
// @ts-ignore
import CoreLogo from '../logos/core.svg';
// @ts-ignore
import GameStopLogo from '../logos/gamestopwallet.svg';
// @ts-ignore
import ZerionLogo from '../logos/zerion.svg';
// @ts-ignore
import PhantomLogo from '../logos/phantom.svg';
// @ts-ignore
import RainbowLogo from '../logos/rainbow.svg';

export const FALLBACK: IProviderInfo = {
  id: 'fallback',
  name: 'Web3',
  logo: Web3DefaultLogo as unknown as string,
  type: 'injected',
  check: 'isWeb3',
};

export const METAMASK: IProviderInfo = {
  id: 'metamask',
  name: 'MetaMask',
  logo: MetaMaskLogo as unknown as string,
  type: 'injected',
  check: 'isMetaMask',
};

export const SAFE: IProviderInfo = {
  id: 'safe',
  name: 'Safe',
  logo: SafeLogo as unknown as string,
  type: 'injected',
  check: 'isSafe',
};

export const NIFTY: IProviderInfo = {
  id: 'nifty',
  name: 'Nifty',
  logo: NiftyWalletLogo as unknown as string,
  type: 'injected',
  check: 'isNiftyWallet',
};

export const DAPPER: IProviderInfo = {
  id: 'dapper',
  name: 'Dapper',
  logo: DapperLogo as unknown as string,
  type: 'injected',
  check: 'isDapper',
};

export const OPERA: IProviderInfo = {
  id: 'opera',
  name: 'Opera',
  logo: OperaLogo as unknown as string,
  type: 'injected',
  check: 'isOpera',
};

export const TRUST: IProviderInfo = {
  id: 'trust',
  name: 'Trust',
  logo: TrustLogo as unknown as string,
  type: 'injected',
  check: 'isTrust',
};

export const COINBASE: IProviderInfo = {
  id: 'coinbase',
  name: 'Coinbase',
  logo: CoinbaseLogo as unknown as string,
  type: 'injected',
  check: 'isCoinbaseWallet',
};

export const CIPHER: IProviderInfo = {
  id: 'cipher',
  name: 'Cipher',
  logo: CipherLogo as unknown as string,
  type: 'injected',
  check: 'isCipher',
};

export const IMTOKEN: IProviderInfo = {
  id: 'imtoken',
  name: 'imToken',
  logo: imTokenLogo as unknown as string,
  type: 'injected',
  check: 'isImToken',
};

export const STATUS: IProviderInfo = {
  id: 'status',
  name: 'Status',
  logo: StatusLogo as unknown as string,
  type: 'injected',
  check: 'isStatus',
};

export const TOKENARY: IProviderInfo = {
  id: 'tokenary',
  name: 'Tokenary',
  logo: TokenaryLogo as unknown as string,
  type: 'injected',
  check: 'isTokenary',
};

export const FRAMEINJECTED: IProviderInfo = {
  id: 'frame',
  name: 'Frame',
  logo: FrameLogo as unknown as string,
  type: 'injected',
  check: 'isFrame',
};

export const LIQUALITY: IProviderInfo = {
  id: 'liquality',
  name: 'Liquality',
  logo: LiqualityLogo as unknown as string,
  type: 'injected',
  check: 'isLiquality',
};

export const BOLTX: IProviderInfo = {
  id: 'boltx',
  name: 'Bolt-X',
  logo: BoltXLogo as unknown as string,
  type: 'injected',
  check: 'isBoltX',
};

export const MATHWALLET: IProviderInfo = {
  id: 'mathwallet',
  name: 'Math Wallet',
  logo: MathWalletLogo as unknown as string,
  type: 'injected',
  check: 'isMathWallet',
};

export const RWALLET: IProviderInfo = {
  id: 'rwallet',
  name: 'rWallet',
  logo: RWalletLogo as unknown as string,
  type: 'injected',
  check: 'isRWallet',
};

export const XDEFI: IProviderInfo = {
  id: 'xdefi',
  name: 'XDEFI',
  logo: XDEFILogo as unknown as string,
  type: 'injected',
  check: '__XDEFI',
};

export const BITPIE: IProviderInfo = {
  id: 'bitpie',
  name: 'Bitpie',
  logo: BitpieLogo as unknown as string,
  type: 'injected',
  check: 'isBitpie',
};

export const CELOINJECTED: IProviderInfo = {
  id: 'celo',
  name: 'Celo extension wallet',
  logo: CeloExtensionWalletLogo as unknown as string,
  type: 'injected',
  check: 'isCelo',
};

export const BLOCKWALLET: IProviderInfo = {
  id: 'blockwallet',
  name: 'BlockWallet',
  logo: BlockWalletLogo as unknown as string,
  type: 'injected',
  check: 'isBlockWallet',
};

export const TALLYINJECTED: IProviderInfo = {
  id: 'tally',
  name: 'Tally',
  logo: TallyLogo as unknown as string,
  type: 'injected',
  check: 'isTally',
};

export const PORTAL: IProviderInfo = {
  id: 'portal',
  name: 'Ripio Portal',
  logo: PortalLogo as unknown as string,
  type: 'injected',
  check: 'isPortal',
};

export const SEQUENCEINJECTED: IProviderInfo = {
  id: 'sequence',
  name: 'Sequence',
  logo: SequenceLogo as unknown as string,
  type: 'injected',
  check: 'isSequence',
};

export const RABBY: IProviderInfo = {
  id: 'rabby',
  name: 'Rabby',
  logo: RabbyLogo as unknown as string,
  type: 'injected',
  check: 'isRabby',
};

export const BRAVE: IProviderInfo = {
  id: 'brave',
  name: 'Brave',
  logo: BraveLogo as unknown as string,
  type: 'injected',
  check: 'isBraveWallet',
};

export const CLV: IProviderInfo = {
  id: 'clv',
  name: 'CLV',
  logo: ClvLogo as unknown as string,
  type: 'injected',
  check: 'isCloverWallet',
};

export const BITKEEPWALLET: IProviderInfo = {
  id: 'bitkeep',
  name: 'BitKeep Wallet',
  logo: BitkeepLogo as unknown as string,
  type: 'injected',
  check: 'isBitKeep',
};

export const CORE: IProviderInfo = {
  id: 'core',
  name: 'Core',
  logo: CoreLogo as unknown as string,
  type: 'injected',
  check: 'isAvalanche',
};

export const TOKENPOCKET: IProviderInfo = {
  id: 'tokenpocket',
  name: 'TokenPocket Wallet',
  logo: TokenPocketLogo as unknown as string,
  type: 'injected',
  check: 'isTokenPocket',
};

export const GAMESTOP: IProviderInfo = {
  id: 'gamestop',
  name: 'GameStop Wallet',
  logo: GameStopLogo as unknown as string,
  type: 'injected',
  check: 'isGamestop',
};

export const ZERION: IProviderInfo = {
  id: 'zerion',
  name: 'Zerion Wallet',
  logo: ZerionLogo as unknown as string,
  type: 'injected',
  check: 'isZerion',
};

export const PHANTOM: IProviderInfo = {
  id: 'phantom',
  name: 'Phantom',
  logo: PhantomLogo as unknown as string,
  type: 'injected',
  check: 'isPhantom',
  package: {
    required: ['networkType'],
  },
};

export const RAINBOW: IProviderInfo = {
  id: 'rainbow',
  name: 'Rainbow',
  logo: RainbowLogo as unknown as string,
  type: 'injected',
  check: 'isRainbow',
};
/* eslint-enable @typescript-eslint/ban-ts-comment */
