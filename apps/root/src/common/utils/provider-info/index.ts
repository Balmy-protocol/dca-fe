import { filterMatches } from './helpers';
import { providers, injected } from './providers';
import { IProviderInfo } from './types';

declare global {
  interface Window {
    updateWeb3Modal: any;
    BinanceChain: any;
    web3: any;
    celo: any;
    clover: any;
    opera: any;
    bitkeep: any;
    starzwallet: any;
  }
}

export function filterProviderChecks(checks: string[]): string {
  if (!!checks && checks.length) {
    if (checks.length > 1) {
      if (checks[0] === injected.METAMASK.check || checks[0] === injected.CIPHER.check) {
        return checks[1];
      }
    }
    return checks[0];
  }
  return providers.FALLBACK.check;
}

export function filterProviders(param: string, value: string | null): IProviderInfo {
  if (!value) return providers.FALLBACK;
  const match = filterMatches<IProviderInfo>(
    Object.values(providers),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (x) => x[param] === value,
    providers.FALLBACK
  );
  return match || providers.FALLBACK;
}

export function getProviderInfoFromChecksArray(checks: string[]): IProviderInfo {
  const check = filterProviderChecks(checks);
  return filterProviders('check', check);
}

export function getProviderInfo(provider: any, privyWallet?: boolean): IProviderInfo {
  if (!provider) return providers.FALLBACK;
  const checks = Object.values(providers)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .filter((x) => provider[x.check])
    .map((x) => x.check);

  const providerInfo = {
    ...getProviderInfoFromChecksArray(checks),
    ...(privyWallet ? { name: 'privy' } : {}),
  };

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (providerInfo.id === 'walletconnect' && provider.connector && provider.connector.peerMeta) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      providerInfo.name = provider.connector.peerMeta.name;
    }
  } catch {
    console.error('Failed to set providerInfo name for wc');
  }

  return providerInfo;
}
