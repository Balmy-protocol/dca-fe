import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION } from '@constants';
import isNaN from 'lodash/isNaN';

const DCA_CREATE_REGEX = /^\/invest\/create\/(\d+).*$/;
const SWAP_REGEX = /^\/swap\/(\d+).*$/;
const DCA_POSITIONS_REGEX = /^\/invest\/positions\/(\d+).*$/;
const EARN_REGEX = /^\/earn\/vaults\/(\d+).*$/;
const TRANSFER_REGEX = /^\/transfer\/(\d+).*$/;

export const getChainIdFromUrl = () => {
  const { pathname } = window.location;
  try {
    let results: RegExpExecArray | null = null;
    if (pathname.startsWith('/swap')) {
      results = SWAP_REGEX.exec(pathname);
    } else if (pathname.startsWith('/invest/create')) {
      results = DCA_CREATE_REGEX.exec(pathname);
    } else if (pathname.startsWith('/invest/positions')) {
      results = DCA_POSITIONS_REGEX.exec(pathname);
    } else if (pathname.startsWith('/earn/vaults')) {
      results = EARN_REGEX.exec(pathname);
    } else if (pathname.startsWith('/transfer')) {
      results = TRANSFER_REGEX.exec(pathname);
    }

    const chainId = results && parseInt(results[1], 10);

    if (chainId && !isNaN(chainId)) {
      return chainId;
    }

    return DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION].chainId;
  } catch {
    return DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION].chainId;
  }
};

export function getLogoURL(logoURI: string) {
  if (logoURI?.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${logoURI.split('//')[1]}`;
  }
  if (typeof logoURI === 'string') {
    return logoURI;
  }
  return '';
}
