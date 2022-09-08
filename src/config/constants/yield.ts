import { YieldOption } from 'types';
import { emptyTokenWithAddress } from 'utils/currency';
import { NETWORKS } from './addresses';

export const ALLOWED_YIELDS: Record<number, Pick<YieldOption, 'id' | 'poolId' | 'name' | 'token' | 'tokenAddress'>[]> =
  {
    [NETWORKS.polygon.chainId]: [
      {
        id: '37b04faa-95bb-4ccb-9c4e-c70fa167342b', // aave-v3 USDC
        tokenAddress: '0xe3e5e1946d6e4d8a5e5f155b6e059a2ca7c43c58', // aave-v3 USDC
        poolId: '37b04faa-95bb-4ccb-9c4e-c70fa167342b', // aave-v3 USDC
        name: 'Aave V3',
        token: emptyTokenWithAddress('AAVE'),
      },
      {
        id: '2b9bf1c6-a018-4e93-a32f-7cf6ccd311fc', // aave-v3 WETH
        tokenAddress: '0xa7a7ffe0520e90491e58c9c77f78d7cfc32d019e', // aave-v3 WETH
        poolId: '2b9bf1c6-a018-4e93-a32f-7cf6ccd311fc', // aave-v3 WETH
        name: 'Aave V3',
        token: emptyTokenWithAddress('AAVE'),
      },
      {
        id: '58d18059-f1d1-45ed-acd3-f386e98cc506', // aave-v3 WBTC
        tokenAddress: '0x42474cdc4a9d9c06e91c745984dd319c1f107f9a', // aave-v3 WBTC
        poolId: '58d18059-f1d1-45ed-acd3-f386e98cc506', // aave-v3 WBTC
        name: 'Aave V3',
        token: emptyTokenWithAddress('AAVE'),
      },
      {
        id: 'f67c3baa-613a-409e-940e-5366f474871b', // aave-v3 WMATIC
        tokenAddress: '0x021c618f299e0f55e8a684898b03b027eb51df5c', // aave-v3 WMATIC
        poolId: 'f67c3baa-613a-409e-940e-5366f474871b', // aave-v3 WMATIC
        name: 'Aave V3',
        token: emptyTokenWithAddress('AAVE'),
      },
      // {
      //   id: '3c14db00-4252-40aa-a430-9c756e8dce71', // aave-v3 GHST
      //   // TODO: put real address
      //   tokenAddress: '0x8eb270e296023e9d92081fdf967ddd7878724424', // aave-v3 GHST
      //   poolId: '3c14db00-4252-40aa-a430-9c756e8dce71', // aave-v3 GHST
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: 'c57bdc97-3100-41ff-845f-075363f6f5a4', // aave-v3 DAI
      //   // TODO: put real address
      //   tokenAddress: '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee', // aave-v3 DAI
      //   poolId: 'c57bdc97-3100-41ff-845f-075363f6f5a4', // aave-v3 DAI
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '7e7821a2-3d20-4ae7-9c3d-04cd57904555', // aave-v3 USDT
      //   // TODO: put real address
      //   tokenAddress: '0x6ab707aca953edaefbc4fd23ba73294241490620', // aave-v3 USDT
      //   poolId: '7e7821a2-3d20-4ae7-9c3d-04cd57904555', // aave-v3 USDT
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: 'de9b0b53-a6fc-4ff3-a9a7-065dfc1f998b', // aave-v3 AAVE
      //   // TODO: put real address
      //   tokenAddress: '0xf329e36c7bf6e5e86ce2150875a84ce77f477375', // aave-v3 AAVE
      //   poolId: 'de9b0b53-a6fc-4ff3-a9a7-065dfc1f998b', // aave-v3 AAVE
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '995a6317-1c32-48c2-a8c9-683263b8412e', // aave-v3 LINK
      //   // TODO: put real address
      //   tokenAddress: '0x191c10aa4af7c30e871e70c95db0e4eb77237530', // aave-v3 LINK
      //   poolId: '995a6317-1c32-48c2-a8c9-683263b8412e', // aave-v3 LINK
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: 'c6ec5219-e39b-46f2-9ec2-5a61de562957', // aave-v3 jEUR
      //   // TODO: put real address
      //   tokenAddress: '0x6533afac2e7bccb20dca161449a13a32d391fb00', // aave-v3 jEUR
      //   poolId: 'c6ec5219-e39b-46f2-9ec2-5a61de562957', // aave-v3 jEUR
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '6ee54ffc-6ede-45a8-b35f-60aca8cc4176', // aave-v3 agEUR
      //   // TODO: put real address
      //   tokenAddress: '0x8437d7c167dfb82ed4cb79cd44b7a32a1dd95c77', // aave-v3 agEUR
      //   poolId: '6ee54ffc-6ede-45a8-b35f-60aca8cc4176', // aave-v3 agEUR
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: 'e95cadc3-0ea7-4932-9b80-a8baba80eff4', // aave-v3 EURS
      //   // TODO: put real address
      //   tokenAddress: '0x38d693ce1df5aadf7bc62595a37d667ad57922e5', // aave-v3 EURS
      //   poolId: 'e95cadc3-0ea7-4932-9b80-a8baba80eff4', // aave-v3 EURS
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '0e863358-7fc0-4290-b05e-071b80eac40a', // aave-v3 CRV
      //   // TODO: put real address
      //   tokenAddress: '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff', // aave-v3 CRV
      //   poolId: '0e863358-7fc0-4290-b05e-071b80eac40a', // aave-v3 CRV
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: 'a5e57d75-82ce-490a-b44e-d426dd3338f7', // aave-v3 SUSHI
      //   // TODO: put real address
      //   tokenAddress: '0xc45a479877e1e9dfe9fcd4056c699575a1045daa', // aave-v3 SUSHI
      //   poolId: 'a5e57d75-82ce-490a-b44e-d426dd3338f7', // aave-v3 SUSHI
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: 'bec16af1-350f-4b16-bf83-908f4f12df73', // aave-v3 BAL
      //   // TODO: put real address
      //   tokenAddress: '0x8ffdf2de812095b1d19cb146e4c004587c0a0692', // aave-v3 BAL
      //   poolId: 'bec16af1-350f-4b16-bf83-908f4f12df73', // aave-v3 BAL
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '59447a2f-7c4d-433a-a84b-ac6e53986680', // aave-v3 DPI
      //   // TODO: put real address
      //   tokenAddress: '0x724dc807b04555b71ed48a6896b6f41593b8c637', // aave-v3 DPI
      //   poolId: '59447a2f-7c4d-433a-a84b-ac6e53986680', // aave-v3 DPI
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '1a8a5716-bb77-4baf-a2d9-ba3bebc6652a', // aave-v3 miMATIC
      //   // TODO: put real address
      //   tokenAddress: '0xebe517846d0f36eced99c735cbf6131e1feb775d', // aave-v3 miMATIC
      //   poolId: '1a8a5716-bb77-4baf-a2d9-ba3bebc6652a', // aave-v3 miMATIC
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
    ],
    [NETWORKS.optimism.chainId]: [
      // {
      //   id: '24762515-822a-46af-927c-77a1dc449bd0', // aave-v3 USDC
      //   // TODO: put real address
      //   tokenAddress: '24762515-822a-46af-927c-77a1dc449bd0', // aave-v3 USDC
      //   poolId: '24762515-822a-46af-927c-77a1dc449bd0', // aave-v3 USDC
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '3e332a41-3a15-41bc-8d5c-438c09609349', // aave-v3 WETH
      //   // TODO: put real address
      //   tokenAddress: '3e332a41-3a15-41bc-8d5c-438c09609349', // aave-v3 WETH
      //   poolId: '3e332a41-3a15-41bc-8d5c-438c09609349', // aave-v3 WETH
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '363e5586-cfee-402c-9b0b-be70366052e8', // aave-v3 DAI
      //   // TODO: put real address
      //   tokenAddress: '363e5586-cfee-402c-9b0b-be70366052e8', // aave-v3 DAI
      //   poolId: '363e5586-cfee-402c-9b0b-be70366052e8', // aave-v3 DAI
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: 'e053590b-54f1-40aa-ae0d-14e701ca734c', // aave-v3 WBTC
      //   // TODO: put real address
      //   tokenAddress: 'e053590b-54f1-40aa-ae0d-14e701ca734c', // aave-v3 WBTC
      //   poolId: 'e053590b-54f1-40aa-ae0d-14e701ca734c', // aave-v3 WBTC
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: 'bde08c85-41c5-4d80-9bb1-0835a4352efa', // aave-v3 USDT
      //   // TODO: put real address
      //   tokenAddress: 'bde08c85-41c5-4d80-9bb1-0835a4352efa', // aave-v3 USDT
      //   poolId: 'bde08c85-41c5-4d80-9bb1-0835a4352efa', // aave-v3 USDT
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: '7fc727a5-813c-405f-96d6-dd8b23f31e1b', // aave-v3 AAVE
      //   // TODO: put real address
      //   tokenAddress: '7fc727a5-813c-405f-96d6-dd8b23f31e1b', // aave-v3 AAVE
      //   poolId: '7fc727a5-813c-405f-96d6-dd8b23f31e1b', // aave-v3 AAVE
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: 'fa740a7c-430b-4521-8890-22b22e601be6', // aave-v3 sUSDC
      //   // TODO: put real address
      //   tokenAddress: 'fa740a7c-430b-4521-8890-22b22e601be6', // aave-v3 sUSDC
      //   poolId: 'fa740a7c-430b-4521-8890-22b22e601be6', // aave-v3 sUSDC
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
      // {
      //   id: 'fe084859-2384-4daf-86ec-63f5f8dcdaaa', // aave-v3 LINK
      //   // TODO: put real address
      //   tokenAddress: 'fe084859-2384-4daf-86ec-63f5f8dcdaaa', // aave-v3 LINK
      //   poolId: 'fe084859-2384-4daf-86ec-63f5f8dcdaaa', // aave-v3 LINK
      //   name: 'Aave V3',
      //   token: emptyTokenWithAddress('AAVE'),
      // },
    ],
  };
