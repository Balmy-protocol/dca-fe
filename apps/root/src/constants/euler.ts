import { Address } from 'viem';

export const EULER_CLAIM_MIGRATORS_ADDRESSES: Record<Address, Address> = {
  '0xcd0e5871c97c663d43c62b5049c123bb45bfe2cc': '0xa4692e06e702631a5792ca14bcf63a9304297896', // ETH - USDC.
  '0xd4de9d2fc1607d1df63e1c95ecbfa8d7946f5457': '0x70d7359cd520f4c6df281dbaffc3d205dfed0bcd', // ETH - WETH.
  '0xc4113b7605d691e073c162809060b6c5ae402f1e': '0x6793c6fd0b05761d8b7448b66e1c7a4b05b2d946', // ETH - DAI.
  '0x48e345cb84895eab4db4c44ff9b619ca0be671d9': '0x9720d19b53d84c63fbbeacb6385f690d3478c8fc', // ETH - WBTC.
  '0xb95e6eee428902c234855990e18a632fa34407dc': '0xc303024c3747b47dbaadb29f2b1963589caca9b9', // ETH - LUSD.
};
