import { YieldOption } from 'types';
import { emptyTokenWithAddress } from 'utils/currency';
import { NETWORKS } from './addresses';

export const ALLOWED_YIELDS: Record<number, Pick<YieldOption, 'id' | 'poolId' | 'name' | 'token' | 'tokenAddress'>[]> =
  {
    [NETWORKS.polygon.chainId]: [
      {
        id: '0x625e7708f30ca75bfd92586e17077590c60eb4cd', // aave-v3 USDC
        tokenAddress: '0xe3e5e1946d6e4d8a5e5f155b6e059a2ca7c43c58', // aave-v3 USDC
        poolId: '0x625e7708f30ca75bfd92586e17077590c60eb4cd-polygon', // aave-v3 USDC
        name: 'Aave V3',
        token: emptyTokenWithAddress('AAVE'),
      },
      {
        id: '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8', // aave-v3 WETH
        tokenAddress: '0xa7a7ffe0520e90491e58c9c77f78d7cfc32d019e', // aave-v3 WETH
        poolId: '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8-polygon', // aave-v3 WETH
        name: 'Aave V3',
        token: emptyTokenWithAddress('AAVE'),
      },
      {
        id: '0x078f358208685046a11c85e8ad32895ded33a249', // aave-v3 WBTC
        tokenAddress: '0x42474cdc4a9d9c06e91c745984dd319c1f107f9a', // aave-v3 WBTC
        poolId: '0x078f358208685046a11c85e8ad32895ded33a249-polygon', // aave-v3 WBTC
        name: 'Aave V3',
        token: emptyTokenWithAddress('AAVE'),
      },
      {
        id: '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97', // aave-v3 WMATIC
        tokenAddress: '0x021c618f299e0f55e8a684898b03b027eb51df5c', // aave-v3 WMATIC
        poolId: '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97-polygon', // aave-v3 WMATIC
        name: 'Aave V3',
        token: emptyTokenWithAddress('AAVE'),
      },
      // {
      //   id: '0x8eb270e296023e9d92081fdf967ddd7878724424', // aave-v3 GHST
      //   // TODO: put real address
      //   tokenAddress: '0x8eb270e296023e9d92081fdf967ddd7878724424', // aave-v3 GHST
      //   poolId: '0x8eb270e296023e9d92081fdf967ddd7878724424-polygon', // aave-v3 GHST
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee', // aave-v3 DAI
      //   // TODO: put real address
      //   tokenAddress: '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee', // aave-v3 DAI
      //   poolId: '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee-polygon', // aave-v3 DAI
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x6ab707aca953edaefbc4fd23ba73294241490620', // aave-v3 USDT
      //   // TODO: put real address
      //   tokenAddress: '0x6ab707aca953edaefbc4fd23ba73294241490620', // aave-v3 USDT
      //   poolId: '0x6ab707aca953edaefbc4fd23ba73294241490620-polygon', // aave-v3 USDT
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0xf329e36c7bf6e5e86ce2150875a84ce77f477375', // aave-v3 AAVE
      //   // TODO: put real address
      //   tokenAddress: '0xf329e36c7bf6e5e86ce2150875a84ce77f477375', // aave-v3 AAVE
      //   poolId: '0xf329e36c7bf6e5e86ce2150875a84ce77f477375-polygon', // aave-v3 AAVE
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x191c10aa4af7c30e871e70c95db0e4eb77237530', // aave-v3 LINK
      //   // TODO: put real address
      //   tokenAddress: '0x191c10aa4af7c30e871e70c95db0e4eb77237530', // aave-v3 LINK
      //   poolId: '0x191c10aa4af7c30e871e70c95db0e4eb77237530-polygon', // aave-v3 LINK
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x6533afac2e7bccb20dca161449a13a32d391fb00', // aave-v3 jEUR
      //   // TODO: put real address
      //   tokenAddress: '0x6533afac2e7bccb20dca161449a13a32d391fb00', // aave-v3 jEUR
      //   poolId: '0x6533afac2e7bccb20dca161449a13a32d391fb00-polygon', // aave-v3 jEUR
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x8437d7c167dfb82ed4cb79cd44b7a32a1dd95c77', // aave-v3 agEUR
      //   // TODO: put real address
      //   tokenAddress: '0x8437d7c167dfb82ed4cb79cd44b7a32a1dd95c77', // aave-v3 agEUR
      //   poolId: '0x8437d7c167dfb82ed4cb79cd44b7a32a1dd95c77-polygon', // aave-v3 agEUR
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x38d693ce1df5aadf7bc62595a37d667ad57922e5', // aave-v3 EURS
      //   // TODO: put real address
      //   tokenAddress: '0x38d693ce1df5aadf7bc62595a37d667ad57922e5', // aave-v3 EURS
      //   poolId: '0x38d693ce1df5aadf7bc62595a37d667ad57922e5-polygon', // aave-v3 EURS
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff', // aave-v3 CRV
      //   // TODO: put real address
      //   tokenAddress: '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff', // aave-v3 CRV
      //   poolId: '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff-polygon', // aave-v3 CRV
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0xc45a479877e1e9dfe9fcd4056c699575a1045daa', // aave-v3 SUSHI
      //   // TODO: put real address
      //   tokenAddress: '0xc45a479877e1e9dfe9fcd4056c699575a1045daa', // aave-v3 SUSHI
      //   poolId: '0xc45a479877e1e9dfe9fcd4056c699575a1045daa-polygon', // aave-v3 SUSHI
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x8ffdf2de812095b1d19cb146e4c004587c0a0692', // aave-v3 BAL
      //   // TODO: put real address
      //   tokenAddress: '0x8ffdf2de812095b1d19cb146e4c004587c0a0692', // aave-v3 BAL
      //   poolId: '0x8ffdf2de812095b1d19cb146e4c004587c0a0692-polygon', // aave-v3 BAL
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x724dc807b04555b71ed48a6896b6f41593b8c637', // aave-v3 DPI
      //   // TODO: put real address
      //   tokenAddress: '0x724dc807b04555b71ed48a6896b6f41593b8c637', // aave-v3 DPI
      //   poolId: '0x724dc807b04555b71ed48a6896b6f41593b8c637-polygon', // aave-v3 DPI
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0xebe517846d0f36eced99c735cbf6131e1feb775d', // aave-v3 miMATIC
      //   // TODO: put real address
      //   tokenAddress: '0xebe517846d0f36eced99c735cbf6131e1feb775d', // aave-v3 miMATIC
      //   poolId: '0xebe517846d0f36eced99c735cbf6131e1feb775d-polygon', // aave-v3 miMATIC
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
    ],
    [NETWORKS.optimism.chainId]: [
      // {
      //   id: '0x7f5c764cbc14f9669b88837ca1490cca17c316070xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 USDC
      //   // TODO: put real address
      //   tokenAddress: '0x7f5c764cbc14f9669b88837ca1490cca17c316070xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 USDC
      //   poolId: '0x7f5c764cbc14f9669b88837ca1490cca17c316070xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 USDC
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x42000000000000000000000000000000000000060xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 WETH
      //   // TODO: put real address
      //   tokenAddress: '0x42000000000000000000000000000000000000060xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 WETH
      //   poolId: '0x42000000000000000000000000000000000000060xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 WETH
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da10xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 DAI
      //   // TODO: put real address
      //   tokenAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da10xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 DAI
      //   poolId: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da10xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 DAI
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x68f180fcce6836688e9084f035309e29bf0a20950xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 WBTC
      //   // TODO: put real address
      //   tokenAddress: '0x68f180fcce6836688e9084f035309e29bf0a20950xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 WBTC
      //   poolId: '0x68f180fcce6836688e9084f035309e29bf0a20950xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 WBTC
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e580xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 USDT
      //   // TODO: put real address
      //   tokenAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e580xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 USDT
      //   poolId: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e580xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 USDT
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x76fb31fb4af56892a25e32cfc43de717950c92780xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 AAVE
      //   // TODO: put real address
      //   tokenAddress: '0x76fb31fb4af56892a25e32cfc43de717950c92780xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 AAVE
      //   poolId: '0x76fb31fb4af56892a25e32cfc43de717950c92780xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 AAVE
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d90xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 sUSDC
      //   // TODO: put real address
      //   tokenAddress: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d90xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 sUSDC
      //   poolId: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d90xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 sUSDC
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f60xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 LINK
      //   // TODO: put real address
      //   tokenAddress: '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f60xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 LINK
      //   poolId: '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f60xa97684ead0e402dc232d5a977953df7ecbab3cdb-optimism', // aave-v3 LINK
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
    ],
  };
