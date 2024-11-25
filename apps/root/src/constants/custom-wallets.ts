/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import {
  RainbowKitWalletConnectParameters,
  Wallet,
  WalletDetailsParams,
  getWalletConnectConnector,
} from '@rainbow-me/rainbowkit';
import { baseColors } from 'ui-library';
import { EIP1193Provider } from 'viem';
import { Connector, CreateConnectorFn, createConnector } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Robbed from rainbowkit
export type WalletProviderFlags =
  | 'isApexWallet'
  | 'isAvalanche'
  | 'isBackpack'
  | 'isBifrost'
  | 'isBitKeep'
  | 'isBitski'
  | 'isBlockWallet'
  | 'isBraveWallet'
  | 'isCoinbaseWallet'
  | 'isDawn'
  | 'isEnkrypt'
  | 'isExodus'
  | 'isFrame'
  | 'isFrontier'
  | 'isGamestop'
  | 'isHyperPay'
  | 'isImToken'
  | 'isKuCoinWallet'
  | 'isMathWallet'
  | 'isMetaMask'
  | 'isNestWallet'
  | 'isOkxWallet'
  | 'isOKExWallet'
  | 'isOneInchAndroidWallet'
  | 'isOneInchIOSWallet'
  | 'isOpera'
  | 'isPhantom'
  | 'isPortal'
  | 'isDefiant'
  | 'isRabby'
  | 'isRainbow'
  | 'isStatus'
  | 'isTally'
  | 'isTokenPocket'
  | 'isTokenary'
  | 'isTrust'
  | 'isTrustWallet'
  | 'isXDEFI'
  | 'isZerion'
  | 'isTalisman'
  | 'isZeal'
  | 'isCoin98'
  | 'isMEWwallet'
  | 'isSafeheron'
  | 'isSafePal';

/** Combines members of an intersection into a readable type. */
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-redundant-type-constituents
export type Evaluate<type> = { [key in keyof type]: type[key] } & unknown;

export type WalletProvider = Evaluate<
  EIP1193Provider & {
    [key in WalletProviderFlags]?: true | undefined;
  } & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    providers?: any[] | undefined;
    /** Only exists in MetaMask as of 2022/04/03 */
    _events?: { connect?: (() => void) | undefined } | undefined;
    /** Only exists in MetaMask as of 2022/04/03 */
    _state?:
      | {
          accounts?: string[];
          initialized?: boolean;
          isConnected?: boolean;
          isPermanentlyDisconnected?: boolean;
          isUnlocked?: boolean;
        }
      | undefined;
  }
>;
export type WindowProvider = {
  coinbaseWalletExtension?: WalletProvider | undefined;
  ethereum?: WalletProvider | undefined;
  phantom?: { ethereum: WalletProvider } | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providers?: any[] | undefined; // Adjust the type as needed
};

/*
 * Returns the explicit window provider that matches the flag and the flag is true
 */
function getExplicitInjectedProvider(flag: WalletProviderFlags) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _window = typeof window !== 'undefined' ? (window as WindowProvider) : undefined;
  if (typeof _window === 'undefined' || typeof _window.ethereum === 'undefined') return;
  const providers = _window.ethereum.providers;
  return providers
    ? providers.find((provider) => provider[flag])
    : _window.ethereum[flag]
      ? _window.ethereum
      : undefined;
}

/*
 * Gets the `window.namespace` window provider if it exists
 */
function getWindowProviderNamespace(namespace: string) {
  // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-explicit-any
  const providerSearch = (provider: any, namespace: string): any => {
    const [property, ...path] = namespace.split('.');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _provider = provider[property];
    if (_provider) {
      if (path.length === 0) return _provider;
      return providerSearch(_provider, path.join('.'));
    }
  };
  if (typeof window !== 'undefined') return providerSearch(window, namespace);
}

export function hasInjectedProvider({ flag, namespace }: { flag?: WalletProviderFlags; namespace?: string }): boolean {
  if (namespace && typeof getWindowProviderNamespace(namespace) !== 'undefined') return true;
  if (flag && typeof getExplicitInjectedProvider(flag) !== 'undefined') return true;
  return false;
}

export interface MyWalletOptions {
  projectId: string;
  walletConnectParameters?: RainbowKitWalletConnectParameters;
}

export type RainbowKitDetails = DistributiveOmit<Wallet, 'createConnector' | 'hidden'> & {
  index: number;
  groupIndex: number;
  groupName: string;
  isWalletConnectModalConnector?: boolean;
  isRainbowKitConnector: boolean;
  walletConnectModalConnector?: Connector;
  // Used specifically in `connectorsForWallets` logic
  // to make sure we can also get WalletConnect modal in rainbowkit
  showQrModal?: true;
};

/*
 * Returns an injected provider that favors the flag match, but falls back to window.ethereum
 */
function getInjectedProvider({ flag, namespace }: { flag?: WalletProviderFlags; namespace?: string }) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _window = typeof window !== 'undefined' ? (window as WindowProvider) : undefined;
  if (typeof _window === 'undefined') return;
  if (namespace) {
    // prefer custom eip1193 namespaces
    const windowProvider = getWindowProviderNamespace(namespace);
    if (windowProvider) return windowProvider;
  }
  const providers = _window.ethereum?.providers;
  if (flag) {
    const provider = getExplicitInjectedProvider(flag);
    if (provider) return provider;
  }
  if (typeof providers !== 'undefined' && providers.length > 0) return providers[0];
  return _window.ethereum;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createInjectedConnector(provider?: any): CreateConnector {
  return (walletDetails: WalletDetailsParams) => {
    // Create the injected configuration object conditionally based on the provider.
    const injectedConfig = provider
      ? {
          target: () => ({
            id: walletDetails.rkDetails.id,
            name: walletDetails.rkDetails.name,
            provider,
          }),
        }
      : {};

    return createConnector((config) => ({
      // Spread the injectedConfig object, which may be empty or contain the target function
      ...injected(injectedConfig)(config),
      ...walletDetails,
    }));
  };
}

export type CreateConnector = (walletDetails: { rkDetails: RainbowKitDetails }) => CreateConnectorFn;

export function getInjectedConnector({
  flag,
  namespace,
  target,
}: {
  flag?: WalletProviderFlags;
  namespace?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target?: any;
}): CreateConnector {
  const provider = target ? target : getInjectedProvider({ flag, namespace });
  return createInjectedConnector(provider);
}

export const bitkeepWallet = ({ projectId, walletConnectParameters }: MyWalletOptions): Wallet => {
  const isBitKeepInjected = hasInjectedProvider({ flag: 'isBitKeep' });
  const shouldUseWalletConnect = !isBitKeepInjected;

  return {
    id: 'bitkeep',
    name: 'Bitkeep',
    iconUrl:
      'data:image/png;base64,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',
    iconBackground: baseColors.white,
    installed: true,
    downloadUrls: {
      android: 'https://bitkeep.com/en/download?type=0',
      ios: 'https://bitkeep.com/en/download?type=1',
      browserExtension: 'https://bitkeep.com/en/download?type=2',
    },
    createConnector: shouldUseWalletConnect
      ? getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        })
      : getInjectedConnector({ flag: 'isBitKeep' }),
  };
};

export const ripioWallet = ({ projectId, walletConnectParameters }: MyWalletOptions): Wallet => {
  const isRipioInjected = hasInjectedProvider({ flag: 'isPortal' });
  const shouldUseWalletConnect = !isRipioInjected;

  return {
    id: 'ripioportal',
    name: 'Ripio Portal',
    iconUrl:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHlSURBVHgB3ZZLSwJRFMf/hpFJaJRk0IMCMYIoJKhw7dZFH8FtbesTBK3cto52tQpqa62iF0UPIgqLQg0yVEp6J9Q5Q0Lj3LnzqFz4g1l45zo/zrnnnBnHJ4EqUocqU/tCp9mN5yjgALc4QhbP+KCrBDf9vQsedNIVQQ98tGKEw6ho0ihiCaeK0IgwqaMISMVS4RqusUgyK7SiEZMYViK3JLQjK+NGPaYwKpQKiyZPJ2RXxvAZz2FfOWdTwjh2YJaH3RQuZ9fxeHanWs/jBQlcafZrqpSLI0ebZZSKr8gunyCfuMA9CRlfJKDZx8cSQa9SzbrCTWQgiyZHEpax1AhO7SG1ElevrjBFbSDiZmFPSZ1V+HnhH781Z5jREZaKb7BDAepM/Ptoe8K7XOg2P+1soRHqTQgZzSPdcHV4hfcqn6cJJ0jDyczcdHpc8I8PKO3gJaEeIbTLhSH4sYok9Gjqb1NEfLFUBs/VPrSo1oSzdB7Hmn7MJ5IkaJBGU0kMg6oe1BVyw85gw3DiyAhSZNMY06wL24Kn/QS9YuxWLKcyhiHhPen7kAdwHNuWIuXIWOYjqWUhw+ldoSLaojMVvW7KcDaipONPDRkOs9+lLONBzLMx/T3+OPWcPi79ymr8tfCvqP3v0i/FnrObAPopYwAAAABJRU5ErkJggg==',
    iconBackground: baseColors.white,
    installed: isRipioInjected,
    downloadUrls: {
      browserExtension: 'https://www.ripio.com/ar/portal/',
    },
    createConnector: shouldUseWalletConnect
      ? getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        })
      : getInjectedConnector({ flag: 'isPortal' }),
  };
};

export const defiantWallet = ({ projectId, walletConnectParameters }: MyWalletOptions): Wallet => {
  const isDefiantInjected = hasInjectedProvider({ flag: 'isDefiant' });
  const shouldUseWalletConnect = !isDefiantInjected;

  return {
    id: 'defiant',
    name: 'Defiant',
    iconUrl:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAM+SURBVHgB5VZbTxNREP522e2NUgoFRC5iQkhUNOIt0RdNjC9q9Nk/4A/wL/gb/AEm+mB8MJoYjdFEDfFCBBMQAZFABa3chFJKKW1315lO17bQ0AuGB53k9PScPWe+OXNmvjmKRYJdFBW7LGUDxjeA+V/SVyJaOYvjCeDWXRNGijbqKtqagePdQFdH6TrKAnQ5gO5OE+8HUqiqAoIJDQuLGma6gFNHgRpPcR1KJUETmjPx5kMKn8cIWFNQF3Ci3q/i6nnAW42/D2hLOGLh9bskpkMWnG4HgSm4fA6o9e0QcOgL8Ina3CJgmIDHBexvA073AAE/8HEE6B+yoNNp+YQXCdTrqQAwEgUePgd+zMlYpZiuoqbS/WmqjNv3iiG53xrqCPSszG2WbdPi3hO6r3mySqGFisyxdYptLf35OZ/9zx+4C0eAkYnCOgsCstvYhUvLosAGMGk+kbCwGjUJ2MoD3tzGg2LcZtmSFrF14PYDcWdaIf2w0y3TIkOsNKhpWAivmGgMaAKAnJaxIpkENogcXM4igOz3aCw7ZjCTgQwbUEDXoik0NQig1wvsCdDpk7LfSfna0rQVLG1/oaBZWQX6Bin6hpEDQoBGpqcWWzdxoNMFjUy+RFHZ2oySpOAd1tYAZyjkPW6iMcNuApjK9DoBfQ3GCTgBt8tEqbJtWnC0DQxbmAmZWFiysLhsA5viaktO7PcpuHnDUzANygK0havD/acUUDFyZdygAErh+jWdPKFifMrARNDAlQsOIgSlmKrigGOTwLNekCsBnZL6xGHg5BEJjEqkaLVgt3a2A/XEHscOgu4LOxLl/3lifAtRYBB3fp/Nfnz8Mr/PFa4gYcrXF2+JxqaEc1l6+4E7j7LrWG+u/HEpKxgcBfa1AMt0bw663Wla3EgMYhhC3tVUcjpapfIz3zJBM5DfJ2UqSU+PeJyimSitg/TMLhC9JaRccQXJO2F6oMomjaIxSpzq0GWe5zxuChxS+qpPamE7KRydlJrIZWktJjTI7x4WTiV+hvhqsmB5J7RfYWwRAzAYn3IjKSkQWeM8lKjtOSRrmQKZlXgvk7WZCT9ez3o4lard+ZxaVpSyYl2XE1Uq/35a/AZQtItS4ilAgwAAAABJRU5ErkJggg==',
    iconBackground: baseColors.white,
    installed: isDefiantInjected,
    downloadUrls: {
      browserExtension: 'https://defiantapp.tech',
    },
    createConnector: shouldUseWalletConnect
      ? getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        })
      : getInjectedConnector({ flag: 'isDefiant' }),
  };
};
/* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
