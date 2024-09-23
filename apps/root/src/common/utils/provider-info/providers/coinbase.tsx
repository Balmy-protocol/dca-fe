import { type CreateConnectorFn, createConnector } from 'wagmi';
import { type CoinbaseWalletParameters, coinbaseWallet as coinbaseConnector } from 'wagmi/connectors';
import type { Wallet, WalletDetailsParams } from '@rainbow-me/rainbowkit';

export interface CoinbaseWalletOptions {
  appName: string;
  appIcon?: string;
}

interface CoinbaseWallet {
  (params: CoinbaseWalletOptions): Wallet;
}

export function isSmallIOS(): boolean {
  return typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);
}

export function isLargeIOS(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    (/iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  );
}

export function isIOS(): boolean {
  return isSmallIOS() || isLargeIOS();
}

const coinbaseWalletSvg = `
<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="28" height="28" fill="#2C5FF6"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14 23.8C19.4124 23.8 23.8 19.4124 23.8 14C23.8 8.58761 19.4124 4.2 14 4.2C8.58761 4.2 4.2 8.58761 4.2 14C4.2 19.4124 8.58761 23.8 14 23.8ZM11.55 10.8C11.1358 10.8 10.8 11.1358 10.8 11.55V16.45C10.8 16.8642 11.1358 17.2 11.55 17.2H16.45C16.8642 17.2 17.2 16.8642 17.2 16.45V11.55C17.2 11.1358 16.8642 10.8 16.45 10.8H11.55Z" fill="white"/>
</svg>
`;

export const coinbaseWallet: CoinbaseWallet = ({ appName, appIcon }) => {
  const getUri = (uri: string) => uri;
  const ios = isIOS();

  return {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    shortName: 'Coinbase',
    rdns: 'com.coinbase.wallet',
    iconUrl: coinbaseWalletSvg,
    iconAccent: '#2c5ff6',
    iconBackground: '#2c5ff6',
    // If the coinbase wallet browser extension is not installed, a popup will appear
    // prompting the user to connect or create a wallet via passkey. This means if you either have
    // or don't have the coinbase wallet browser extension installed it'll do some action anyways
    installed: true,
    downloadUrls: {
      android: 'https://play.google.com/store/apps/details?id=org.toshi',
      ios: 'https://apps.apple.com/us/app/coinbase-wallet-store-crypto/id1278383455',
      mobile: 'https://coinbase.com/wallet/downloads',
      qrCode: 'https://coinbase-wallet.onelink.me/q5Sx/fdb9b250',
      chrome: 'https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad',
      browserExtension: 'https://coinbase.com/wallet',
    },
    ...(ios
      ? {}
      : {
          qrCode: {
            getUri,
            instructions: {
              learnMoreUrl: 'https://coinbase.com/wallet/articles/getting-started-mobile',
              steps: [
                {
                  description: 'wallet_connectors.coinbase.qr_code.step1.description',
                  step: 'install',
                  title: 'wallet_connectors.coinbase.qr_code.step1.title',
                },
                {
                  description: 'wallet_connectors.coinbase.qr_code.step2.description',
                  step: 'create',
                  title: 'wallet_connectors.coinbase.qr_code.step2.title',
                },
                {
                  description: 'wallet_connectors.coinbase.qr_code.step3.description',
                  step: 'scan',
                  title: 'wallet_connectors.coinbase.qr_code.step3.title',
                },
              ],
            },
          },
          extension: {
            instructions: {
              learnMoreUrl: 'https://coinbase.com/wallet/articles/getting-started-extension',
              steps: [
                {
                  description: 'wallet_connectors.coinbase.extension.step1.description',
                  step: 'install',
                  title: 'wallet_connectors.coinbase.extension.step1.title',
                },
                {
                  description: 'wallet_connectors.coinbase.extension.step2.description',
                  step: 'create',
                  title: 'wallet_connectors.coinbase.extension.step2.title',
                },
                {
                  description: 'wallet_connectors.coinbase.extension.step3.description',
                  step: 'refresh',
                  title: 'wallet_connectors.coinbase.extension.step3.title',
                },
              ],
            },
          },
        }),
    createConnector: (walletDetails: WalletDetailsParams) => {
      const connector: CreateConnectorFn = coinbaseConnector({
        appName,
        appLogoUrl: appIcon,
        version: '3',
      });

      return createConnector((config) => ({
        ...connector(config),
        ...walletDetails,
      }));
    },
  };
};
