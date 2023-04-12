import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION } from 'config';
import isNaN from 'lodash/isNaN';

const CREATE_REGEX = /^\/create\/(\d+).*$/;
const SWAP_REGEX = /^\/swap\/(\d+).*$/;
const POSITIONS_REGEX = /^\/(\d+)\/positions\/.*$$/;

export const getChainIdFromUrl = () => {
  const { pathname } = window.location;
  try {
    let results: RegExpExecArray | null = null;
    if (pathname.startsWith('/swap')) {
      results = SWAP_REGEX.exec(pathname);
    } else if (pathname.startsWith('/create')) {
      results = CREATE_REGEX.exec(pathname);
    } else {
      results = POSITIONS_REGEX.exec(pathname);
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
