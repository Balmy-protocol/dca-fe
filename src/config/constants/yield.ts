import { YieldOption } from 'types';
import { emptyTokenWithAddress } from 'utils/currency';
import { NETWORKS } from './addresses';

export const ALLOWED_YIELDS: Record<number, Pick<YieldOption, 'id' | 'poolId' | 'name' | 'token'>[]> = {
  [NETWORKS.optimism.chainId]: [
    {
      id: '0x7f5c764cbc14f9669b88837ca1490cca17c316070xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 USDC
      poolId: '0x7f5c764cbc14f9669b88837ca1490cca17c316070xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 USDC
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '0x42000000000000000000000000000000000000060xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 WETH
      poolId: '0x42000000000000000000000000000000000000060xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 WETH
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da10xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 DAI
      poolId: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da10xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 DAI
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '0x68f180fcce6836688e9084f035309e29bf0a20950xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 WBTC
      poolId: '0x68f180fcce6836688e9084f035309e29bf0a20950xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 WBTC
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e580xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 USDT
      poolId: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e580xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 USDT
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '0x76fb31fb4af56892a25e32cfc43de717950c92780xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 AAVE
      poolId: '0x76fb31fb4af56892a25e32cfc43de717950c92780xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 AAVE
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d90xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 sUSDC
      poolId: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d90xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 sUSDC
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f60xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 LINK
      poolId: '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f60xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 LINK
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
  ],
};
