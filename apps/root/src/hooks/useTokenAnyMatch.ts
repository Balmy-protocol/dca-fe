import { Token } from 'common-types';
import { findEquivalentTokenById } from '@common/utils/currency';
import React from 'react';

// tokenString can be a tokenId, an address or a symbol. We should look for any match in that order.
export function useTokenAnyMatch(list: Token[], tokenString?: string) {
  return React.useMemo<Token | undefined>(() => {
    if (!tokenString) return;
    return (
      // By tokenId
      findEquivalentTokenById(list, tokenString.toLowerCase()) ||
      // By address
      list.find(
        (asset) =>
          asset.address.toLowerCase() === tokenString.toLowerCase() ||
          asset.chainAddresses.some(({ address }) => address === tokenString.toLowerCase())
      ) ||
      // By symbol
      list.find((asset) => asset.symbol.toLowerCase() === tokenString.toLowerCase())
    );
  }, [list, tokenString]);
}
