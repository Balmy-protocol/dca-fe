import { hexToSignature, signatureToHex } from 'viem';

export function parseSignatureValues(rawSignature: `0x${string}`) {
  // NOTE: Invalid Ledger + Metamask signatures need to be reconstructed until issue is solved and released
  // https://github.com/MetaMask/eth-ledger-bridge-keyring/pull/152
  // https://github.com/MetaMask/metamask-extension/issues/10240
  // found in https://github.com/yearn/yearn-finance-v3/pull/750/files
  const isInvalidLedgerSignature = rawSignature.endsWith('00') || rawSignature.endsWith('01');
  const { r, v, s } = hexToSignature(rawSignature);

  if (!isInvalidLedgerSignature) {
    return {
      rawSignature,
      v,
      r,
      s,
    };
  }

  const newV = v === 0n || v === 1n ? v + 27n : v;
  const rebuiltSignature = signatureToHex({ r, v: newV, s });
  const { r: r1, v: v1, s: s1 } = hexToSignature(rebuiltSignature);

  return {
    rawSignature: rebuiltSignature,
    // Thank you POAP! https://github.com/poap-xyz/poap-fun/pull/62/files
    v: v1,
    r: r1,
    s: s1,
  };
}
