import isUndefined from 'lodash/isUndefined';
import { parseSignature, serializeSignature } from 'viem';

export function parseSignatureValues(rawSignature: `0x${string}`) {
  // NOTE: Invalid Ledger + Metamask signatures need to be reconstructed until issue is solved and released
  // https://github.com/MetaMask/eth-ledger-bridge-keyring/pull/152
  // https://github.com/MetaMask/metamask-extension/issues/10240
  // found in https://github.com/yearn/yearn-finance-v3/pull/750/files
  const isInvalidLedgerSignature = rawSignature.endsWith('00') || rawSignature.endsWith('01');
  const { r, v, s, yParity } = parseSignature(rawSignature);

  if (!isInvalidLedgerSignature) {
    return {
      rawSignature,
      v: isUndefined(v) ? (yParity === 0 ? 27 : 28) : v,
      r,
      s,
      yParity,
    };
  }

  const newV = v === 0n || v === 1n ? v + 27n : v;
  const rebuiltSignature = serializeSignature({ r, v: newV, s, yParity });
  const { r: r1, v: v1, s: s1, yParity: yParity1 } = parseSignature(rebuiltSignature);

  return {
    rawSignature: rebuiltSignature,
    // Thank you POAP! https://github.com/poap-xyz/poap-fun/pull/62/files
    v: isUndefined(v1) ? (yParity1 === 0 ? 27 : 28) : v1,
    r: r1,
    s: s1,
    yParity: yParity1,
  };
}
