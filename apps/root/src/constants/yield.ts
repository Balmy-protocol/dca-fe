import { YieldOption } from '@types';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { NETWORKS } from './addresses';

export const MINIMUM_USD_RATE_FOR_YIELD: Record<number, number> = {
  [NETWORKS.polygon.chainId]: 1,
  [NETWORKS.optimism.chainId]: 5,
  [NETWORKS.arbitrum.chainId]: 5,
  [NETWORKS.mainnet.chainId]: 15,
  [NETWORKS.baseGoerli.chainId]: 1,
};

export const DEFAULT_MINIMUM_USD_RATE_FOR_YIELD = 5;

const BASE_YIELDS_PER_CHAIN: Record<number, Pick<YieldOption, 'id' | 'poolId' | 'name' | 'token' | 'tokenAddress'>[]> =
  Object.keys(NETWORKS).reduce((acc, key) => ({ ...acc, [NETWORKS[key].chainId]: [] }), {});

export const ALLOWED_YIELDS: Record<
  number,
  Pick<YieldOption, 'id' | 'poolId' | 'name' | 'token' | 'tokenAddress' | 'forcedUnderlyings'>[]
> = {
  ...BASE_YIELDS_PER_CHAIN,
  [NETWORKS.polygon.chainId]: [
    {
      id: '37b04faa-95bb-4ccb-9c4e-c70fa167342b', // aave-v3 USDC
      tokenAddress: '0xe3e5e1946d6e4d8a5e5f155b6e059a2ca7c43c58', // aave-v3 USDC
      poolId: '37b04faa-95bb-4ccb-9c4e-c70fa167342b', // aave-v3 USDC
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '6369a2df-838f-4392-a73b-4c2b2898d537', // aave-v3 stMATIC
      tokenAddress: '0xd01eaff32ca784b07e04776f605cdcb39221b017', // aave-v3 stMATIC
      poolId: '6369a2df-838f-4392-a73b-4c2b2898d537', // aave-v3 stMATIC
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
    {
      id: '3c14db00-4252-40aa-a430-9c756e8dce71', // aave-v3 GHST
      tokenAddress: '0x83c0936d916d036f99234fa35de12988abd66a7f', // aave-v3 GHST
      poolId: '3c14db00-4252-40aa-a430-9c756e8dce71', // aave-v3 GHST
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'c57bdc97-3100-41ff-845f-075363f6f5a4', // aave-v3 DAI
      tokenAddress: '0x6e6bbc7b9fe1a8e5b9f27cc5c6478f65f120fe52', // aave-v3 DAI
      poolId: 'c57bdc97-3100-41ff-845f-075363f6f5a4', // aave-v3 DAI
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '7e7821a2-3d20-4ae7-9c3d-04cd57904555', // aave-v3 USDT
      tokenAddress: '0x018532fde0251473f3bc379e133cdb508c412eed', // aave-v3 USDT
      poolId: '7e7821a2-3d20-4ae7-9c3d-04cd57904555', // aave-v3 USDT
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'de9b0b53-a6fc-4ff3-a9a7-065dfc1f998b', // aave-v3 AAVE
      tokenAddress: '0xcc0da22f5e89a7401255682b2e2e74edd4c62fc4', // aave-v3 AAVE
      poolId: 'de9b0b53-a6fc-4ff3-a9a7-065dfc1f998b', // aave-v3 AAVE
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '995a6317-1c32-48c2-a8c9-683263b8412e', // aave-v3 LINK
      tokenAddress: '0x5e474399c0d3da173a76ad6676f3c32c97babeaf', // aave-v3 LINK
      poolId: '995a6317-1c32-48c2-a8c9-683263b8412e', // aave-v3 LINK
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'c6ec5219-e39b-46f2-9ec2-5a61de562957', // aave-v3 jEUR
      tokenAddress: '0x1dd5629903441b2dd0d03f76ec7673add920e765', // aave-v3 jEUR
      poolId: 'c6ec5219-e39b-46f2-9ec2-5a61de562957', // aave-v3 jEUR
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '6ee54ffc-6ede-45a8-b35f-60aca8cc4176', // aave-v3 agEUR
      tokenAddress: '0xc0b8d48064b9137858ccc2d6c07b7432aae2aa90', // aave-v3 agEUR
      poolId: '6ee54ffc-6ede-45a8-b35f-60aca8cc4176', // aave-v3 agEUR
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'e95cadc3-0ea7-4932-9b80-a8baba80eff4', // aave-v3 EURS
      tokenAddress: '0x53e41d76892c681ef0d10df5a0262a3791b771ab', // aave-v3 EURS
      poolId: 'e95cadc3-0ea7-4932-9b80-a8baba80eff4', // aave-v3 EURS
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '0e863358-7fc0-4290-b05e-071b80eac40a', // aave-v3 CRV
      tokenAddress: '0x2bcf2a8c5f9f8b45ece5ba11d8539780fc15cb11', // aave-v3 CRV
      poolId: '0e863358-7fc0-4290-b05e-071b80eac40a', // aave-v3 CRV
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'a5e57d75-82ce-490a-b44e-d426dd3338f7', // aave-v3 SUSHI
      tokenAddress: '0xbf3df32b05efc5d5a084fbe4d2076fbc3ce88f00', // aave-v3 SUSHI
      poolId: 'a5e57d75-82ce-490a-b44e-d426dd3338f7', // aave-v3 SUSHI
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'bec16af1-350f-4b16-bf83-908f4f12df73', // aave-v3 BAL
      tokenAddress: '0x68f677e667dac3b29c646f44a154dec80db6e811', // aave-v3 BAL
      poolId: 'bec16af1-350f-4b16-bf83-908f4f12df73', // aave-v3 BAL
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'b6fbf2c4-2782-4a55-b7d5-c592b5546a67', // aave-v3 MaticX
      tokenAddress: '0xfa02ce0440dc377becc24d376750e5b1edcc8f42', // aave-v3 MaticX
      poolId: 'b6fbf2c4-2782-4a55-b7d5-c592b5546a67', // aave-v3 MaticX
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    // {
    //   id: '59447a2f-7c4d-433a-a84b-ac6e53986680', // aave-v3 DPI
    //   // TODO: put real address
    //   tokenAddress: '0x724dc807b04555b71ed48a6896b6f41593b8c637', // aave-v3 DPI
    //   poolId: '59447a2f-7c4d-433a-a84b-ac6e53986680', // aave-v3 DPI
    //   name: 'Aave V3',
    //   token: emptyTokenWithAddress('AAVE'),
    // },
    {
      id: '1a8a5716-bb77-4baf-a2d9-ba3bebc6652a', // aave-v3 miMATIC
      tokenAddress: '0x25ad39beee8ddc8d6503ef84881426b65e52c640', // aave-v3 miMATIC
      poolId: '1a8a5716-bb77-4baf-a2d9-ba3bebc6652a', // aave-v3 miMATIC
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '4325e562-82c3-420a-bb58-890439cc70be', // beefy stMATIC
      tokenAddress: '0x6cd724aafd1c5f0539d0d97eaa3088431eacdb92', // beefy stMATIC
      poolId: '4325e562-82c3-420a-bb58-890439cc70be', // beefy stMATIC
      name: 'Beefy',
      token: emptyTokenWithAddress('BEEFY'),
    },
    {
      id: '3cb509ca-aa6e-44c0-973c-4dcd8c6b6cce', // beefy maticX
      tokenAddress: '0xfc4c2e8b2c1655693f520e8115b95b057ac2d95b', // beefy maticX
      poolId: '3cb509ca-aa6e-44c0-973c-4dcd8c6b6cce', // beefy maticX
      name: 'Beefy',
      token: emptyTokenWithAddress('BEEFY'),
    },
    {
      id: '388e73cb-1ea5-4cd3-9426-fdb40762c930', // beefy GNS
      tokenAddress: '0xb57f7f48b88ab6041e7d0a7ec28e8b4671094b12', // beefy GNS
      poolId: '388e73cb-1ea5-4cd3-9426-fdb40762c930', // beefy GNS
      name: 'Beefy',
      token: emptyTokenWithAddress('BEEFY'),
    },
    // {
    //   id: 'fe084859-2384-4daf-86ec-63f5f8dcdaaa', // beefy MVX TODO: MISSING IN DEFILLAMA
    //   tokenAddress: '0xaab6af05e12faae0a5d9597c79588846f0df15b8', // beefy MVX
    //   poolId: 'fe084859-2384-4daf-86ec-63f5f8dcdaaa', // beefy MVX
    //   name: 'Beefy',
    //   token: emptyTokenWithAddress('AAVE'),
    // },
  ],
  [NETWORKS.optimism.chainId]: [
    {
      id: '24762515-822a-46af-927c-77a1dc449bd0', // aave-v3 USDC
      tokenAddress: '0xfe7296c374d996d09e2ffe533eeb85d1896e1b14', // aave-v3 USDC
      poolId: '24762515-822a-46af-927c-77a1dc449bd0', // aave-v3 USDC
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '3e332a41-3a15-41bc-8d5c-438c09609349', // aave-v3 WETH
      tokenAddress: '0xdfc636088b4f73f6bda2e9c31e7ffebf4e3646e9', // aave-v3 WETH
      poolId: '3e332a41-3a15-41bc-8d5c-438c09609349', // aave-v3 WETH
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '363e5586-cfee-402c-9b0b-be70366052e8', // aave-v3 DAI
      tokenAddress: '0x4a29af8683ffc6259beccfd583134a0d13be535c', // aave-v3 DAI
      poolId: '363e5586-cfee-402c-9b0b-be70366052e8', // aave-v3 DAI
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'e053590b-54f1-40aa-ae0d-14e701ca734c', // aave-v3 WBTC
      tokenAddress: '0x4f8424ba880b109c31ce8c5eefc4b82b8897eec0', // aave-v3 WBTC
      poolId: 'e053590b-54f1-40aa-ae0d-14e701ca734c', // aave-v3 WBTC
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'bde08c85-41c5-4d80-9bb1-0835a4352efa', // aave-v3 USDT
      tokenAddress: '0x58ffcdac112d0c0f7b6ac38fb15d178b83663249', // aave-v3 USDT
      poolId: 'bde08c85-41c5-4d80-9bb1-0835a4352efa', // aave-v3 USDT
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '7fc727a5-813c-405f-96d6-dd8b23f31e1b', // aave-v3 AAVE
      tokenAddress: '0xda9a381bcbd9173cc841109840feed4d8d7dcb3b', // aave-v3 AAVE
      poolId: '7fc727a5-813c-405f-96d6-dd8b23f31e1b', // aave-v3 AAVE
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'fa740a7c-430b-4521-8890-22b22e601be6', // aave-v3 sUSDC
      tokenAddress: '0x329c754e060c17542f34bf3287c70bfaad7d288a', // aave-v3 sUSDC
      poolId: 'fa740a7c-430b-4521-8890-22b22e601be6', // aave-v3 sUSDC
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'fe084859-2384-4daf-86ec-63f5f8dcdaaa', // aave-v3 LINK
      tokenAddress: '0x8127ce8a7055e2e99c94aee6e20ffc2bdb3770a8', // aave-v3 LINK
      poolId: 'fe084859-2384-4daf-86ec-63f5f8dcdaaa', // aave-v3 LINK
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '03a0cf78-c2f0-4ce5-85a8-2d5b77349276', // aave-v3 wstETH
      tokenAddress: '0xd81cba2ce0c4c2a9d0db16529ee1d1bc532d8c53', // aave-v3 wstETH
      poolId: '03a0cf78-c2f0-4ce5-85a8-2d5b77349276', // aave-v3 wstETH
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '87e476df-2d7c-4ee9-913c-e0d96865ef82', // aave-v3 OP
      tokenAddress: '0x348a1213fa28a43855e5bb103bdfd7f357543626', // aave-v3 OP
      poolId: '87e476df-2d7c-4ee9-913c-e0d96865ef82', // aave-v3 OP
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '3448ace6-076b-430a-9f80-e757b6fb4905', // aave-v3 MAI
      tokenAddress: '0x57F93E3Fcb2b7eF126aeedA1f959c9EE4625aa70', // aave-v3 MAI
      poolId: '3448ace6-076b-430a-9f80-e757b6fb4905', // aave-v3 MAI
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'c34ed51f-3a16-4124-9501-94b36c1bad9d', // Sonne USDC
      tokenAddress: '0xec5993c902d25f43ede0a796dffb202d1d3ae535', // Sonne USDC
      poolId: 'c34ed51f-3a16-4124-9501-94b36c1bad9d', // Sonne USDC
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: '3846eb20-0dd8-433a-9840-ed113420fec2', // Sonne WETH
      tokenAddress: '0x2719dbf6f9f516e255b84f4d0ae85dadd4f25e57', // Sonne WETH
      poolId: '3846eb20-0dd8-433a-9840-ed113420fec2', // Sonne WETH
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: '4e2bef65-8fcc-4b7a-a48e-db16770981a1', // Sonne DAI
      tokenAddress: '0xd874e814bc4c5aec377af63cc6813bc1c2840d8a', // Sonne DAI
      poolId: '4e2bef65-8fcc-4b7a-a48e-db16770981a1', // Sonne DAI
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: '5fae807c-8386-4832-9df0-6de05f74374b', // Sonne WBTC
      tokenAddress: '0x81a6eabb22a0a76097c4c5b7b003af1dc9c876b6', // Sonne WBTC
      poolId: '5fae807c-8386-4832-9df0-6de05f74374b', // Sonne WBTC
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: '0196f69f-f690-41c4-aa09-1001ef2f3145', // Sonne USDT
      tokenAddress: '0xdb412643e22ab8d2d70a4eb1fcab685eb1557532', // Sonne USDT
      poolId: '0196f69f-f690-41c4-aa09-1001ef2f3145', // Sonne USDT
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: '173ba0e8-d88f-43f4-9339-0e23a35a4cb0', // Sonne sUSD
      tokenAddress: '0xa6e3150bdc939e2e5b6bf8f7cb657fd9500a1fc3', // Sonne sUSD
      poolId: '173ba0e8-d88f-43f4-9339-0e23a35a4cb0', // Sonne sUSD
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: 'dc9995a3-dcb1-470b-82ef-bd152b8cad08', // Sonne OP
      tokenAddress: '0xf96fe010716976e6c0a38eccaf6136df0294726d', // Sonne OP
      poolId: 'dc9995a3-dcb1-470b-82ef-bd152b8cad08', // Sonne OP
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: '3b8d22da-cd9b-4ec5-951d-379e85fac52b', // Sonne SNX
      tokenAddress: '0xe3033ee37c14f83ac7765eca84360ae79b1b567e', // Sonne SNX
      poolId: '3b8d22da-cd9b-4ec5-951d-379e85fac52b', // Sonne SNX
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: '288a4d89-62fa-4f26-9134-6686b7f15932', // Sonne LUSD
      tokenAddress: '0xd0532fc413868abaa09d429de2388a9f155919d5', // Sonne LUSD
      poolId: '288a4d89-62fa-4f26-9134-6686b7f15932', // Sonne LUSD
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: 'ef88396f-130e-477d-b9af-e568e296a5a7', // Sonne wstETH
      tokenAddress: '0xc8bad65d5ffb33b1b26db5edb1e976fa8e248155', // Sonne wstETH
      poolId: 'ef88396f-130e-477d-b9af-e568e296a5a7', // Sonne wstETH
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: '3f963985-c6c9-4c56-9d5e-f5c20f80881e', // Sonne MAI
      tokenAddress: '0x8214BC5875EF5A8A22a2d53F5E68c3Bb0b01B92e', // Sonne MAI
      poolId: '3f963985-c6c9-4c56-9d5e-f5c20f80881e', // Sonne MAI
      name: 'Sonne',
      token: emptyTokenWithAddress('SONNE'),
    },
    {
      id: '334eb8d2-d8fa-401c-837a-221faf82021c', // Exactly OP
      tokenAddress: '0x67f70429750e38d6bae20839ace2692ff2eff52f', // Exactly OP
      poolId: '334eb8d2-d8fa-401c-837a-221faf82021c', // Exactly OP
      name: 'Exactly',
      token: emptyTokenWithAddress('EXACTLY'),
    },
    {
      id: '9e6bd721-3862-42fc-9015-4c2916197938', // Exactly USDC
      tokenAddress: '0xe9a15d436390beb7d9eb312546de3fb01b1468ea', // Exactly USDC
      poolId: '9e6bd721-3862-42fc-9015-4c2916197938', // Exactly USDC
      name: 'Exactly',
      token: emptyTokenWithAddress('EXACTLY'),
    },
    {
      id: '755541b1-6df1-4ae5-8e48-853640448dc6', // Exactly WETH
      tokenAddress: '0x7eb7deac4929da076910c4aa35128ec70b0b820f', // Exactly WETH
      poolId: '755541b1-6df1-4ae5-8e48-853640448dc6', // Exactly WETH
      name: 'Exactly',
      token: emptyTokenWithAddress('EXACTLY'),
    },
    {
      id: '01a0ab55-7324-4ac5-9ee1-f1c7f31346ea', // Exactly wstETH
      tokenAddress: '0xa61ef65f330bb9f3fce823aee704052d8dcdb27a', // Exactly wstETH
      poolId: '01a0ab55-7324-4ac5-9ee1-f1c7f31346ea', // Exactly wstETH
      name: 'Exactly',
      token: emptyTokenWithAddress('EXACTLY'),
    },
    {
      id: '46aa0b40-cafc-485f-9014-e196d0b5da81', // Yearn WETH
      tokenAddress: '0x1fa23ee1319f6f3f2973fd41f83a08cdd99fea5d', // Yearn WETH
      poolId: '46aa0b40-cafc-485f-9014-e196d0b5da81', // Yearn WETH
      name: 'Yearn',
      token: emptyTokenWithAddress('YEARN'),
      forcedUnderlyings: ['0x4200000000000000000000000000000000000006'],
    },
    {
      id: '72e5842f-a9c6-48e3-9fcb-96c0844d9d49', // Yearn USDC
      tokenAddress: '0x60b828bd57b35078f728c8a40d768600410e796d', // Yearn USDC
      poolId: '72e5842f-a9c6-48e3-9fcb-96c0844d9d49', // Yearn USDC
      name: 'Yearn',
      token: emptyTokenWithAddress('YEARN'),
      forcedUnderlyings: ['0x7f5c764cbc14f9669b88837ca1490cca17c31607'],
    },
    // {
    //   id: '', // Yearn WBTC
    //   tokenAddress: '0x1bbc5845e7e2000938c840f0343a975269c348ef', // Yearn WBTC
    //   poolId: '', // Yearn WBTC
    //   name: 'Yearn',
    //   token: emptyTokenWithAddress('YEARN'),
    //   forcedUnderlyings: ['0x68f180fcce6836688e9084f035309e29bf0a2095'],
    // },
    {
      id: '8c5a1d0d-4300-4070-beff-fed553438e17', // Yearn sUSD
      tokenAddress: '0x23a6e4d15a52407e760e9a2bb6c38f27c5a6e667', // Yearn sUSD
      poolId: '8c5a1d0d-4300-4070-beff-fed553438e17', // Yearn sUSD
      name: 'Yearn',
      token: emptyTokenWithAddress('YEARN'),
      forcedUnderlyings: ['0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9'],
    },
    {
      id: '9e7ff39f-dcc0-4127-9e9e-fe90a984cff9', // Yearn DAI
      tokenAddress: '0xcc69c0c520e8faf9eec1e1e8946b67e0c9c427b0', // Yearn DAI
      poolId: '9e7ff39f-dcc0-4127-9e9e-fe90a984cff9', // Yearn DAI
      name: 'Yearn',
      token: emptyTokenWithAddress('YEARN'),
      forcedUnderlyings: ['0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'],
    },
    // {
    //   id: 'e5f45aa7-437e-4c35-8beb-9012bab859c5', // beefy WBTC
    //   tokenAddress: '0xf0cbbfad265a0e7c7e4fd2e1e6027a8dfa25676b', // beefy WBTC
    //   poolId: 'e5f45aa7-437e-4c35-8beb-9012bab859c5', // beefy WBTC
    //   name: 'Beefy',
    //   token: emptyTokenWithAddress('BEEFY'),
    // },
    // {
    //   id: '248c7b16-a0dc-46a6-a0c0-5d38017e2f86', // beefy DAI
    //   tokenAddress: '0x72b25ce2f946c95a2194f5ac3322443d0057bc94', // beefy DAI
    //   poolId: '248c7b16-a0dc-46a6-a0c0-5d38017e2f86', // beefy DAI
    //   name: 'Beefy',
    //   token: emptyTokenWithAddress('BEEFY'),
    // },
    // {
    //   id: '09a8f967-f675-4bd2-a3e8-98b43fe20382', // beefy USDC
    //   tokenAddress: '0x185d3a08140efaeb3c6bf173e751afb0bcb0d0c6', // beefy USDC
    //   poolId: '09a8f967-f675-4bd2-a3e8-98b43fe20382', // beefy USDC
    //   name: 'Beefy',
    //   token: emptyTokenWithAddress('BEEFY'),
    // },
  ],
  [NETWORKS.arbitrum.chainId]: [
    {
      id: '7aab7b0f-01c1-4467-bc0d-77826d870f19', // aave-v3 USDC
      tokenAddress: '0x2285b7dc4426c29ed488c65c72a9feaadb44c7ae', // aave-v3 USDC
      poolId: '7aab7b0f-01c1-4467-bc0d-77826d870f19', // aave-v3 USDC
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '43644487-e26c-450c-8bcb-fb10c1e512e0', // aave-v3 LINK
      tokenAddress: '0x0669cec75e88f721efbe7d78d1783786a2f36bfe', // aave-v3 LINK
      poolId: '43644487-e26c-450c-8bcb-fb10c1e512e0', // aave-v3 LINK
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'e302de4d-952e-4e18-9749-0a9dc86e98bc', // aave-v3 WETH
      tokenAddress: '0x4b6e42407db855fb101b9d39e084e36c90a52652', // aave-v3 WETH
      poolId: 'e302de4d-952e-4e18-9749-0a9dc86e98bc', // aave-v3 WETH
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'a8e3d841-2788-4647-ad54-5a36fac451b1', // aave-v3 DAI
      tokenAddress: '0x30303a134e1850f1eda2e36dad15d052402131a7', // aave-v3 DAI
      poolId: 'a8e3d841-2788-4647-ad54-5a36fac451b1', // aave-v3 DAI
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '7c5e69a4-2430-4fa2-b7cb-857f79d7d1bf', // aave-v3 WBTC
      tokenAddress: '0x9ca453e4585d1acde7bd13f7da2294cfaaec4376', // aave-v3 WBTC
      poolId: '7c5e69a4-2430-4fa2-b7cb-857f79d7d1bf', // aave-v3 WBTC
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '3a6cc030-738d-4e19-8a40-e63e9c4d5a6f', // aave-v3 USDT
      tokenAddress: '0x8fd68006d23df27fc36d3e3eda1fdcc4f0baa8c6', // aave-v3 USDT
      poolId: '3a6cc030-738d-4e19-8a40-e63e9c4d5a6f', // aave-v3 USDT
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: 'e62bcb01-ed4c-4ec9-8cfa-e86e7ccf7688', // aave-v3 wstETH
      tokenAddress: '0xca362c48eb09e39a31b3bd0a305737b11df10808', // aave-v3 wstETH
      poolId: 'e62bcb01-ed4c-4ec9-8cfa-e86e7ccf7688', // aave-v3 wstETH
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '', // aave-v3 MAI
      tokenAddress: '0x7597f9b2944809de4e5a841d6fa5e499099a5a42', // aave-v3 MAI
      poolId: '', // aave-v3 MAI
      name: 'Aave V3',
      token: emptyTokenWithAddress('AAVE'),
    },
    {
      id: '65a7aa13-309a-4431-b7eb-f6dab368dca0', // beefy GNS
      tokenAddress: '0x1a55d9164417856ad31df3705bbc263c380e56b1', // beefy GNS
      poolId: '65a7aa13-309a-4431-b7eb-f6dab368dca0', // beefy GNS
      name: 'Beefy',
      token: emptyTokenWithAddress('BEEFY'),
    },
    {
      id: 'ba935cb2-a371-4f2b-9bd3-9881a995d68f', // beefy GMX
      tokenAddress: '0x78e30dfd5ef67fd414002ec6b4136a7a687c3c03', // beefy GMX
      poolId: 'ba935cb2-a371-4f2b-9bd3-9881a995d68f', // beefy GMX
      name: 'Beefy',
      token: emptyTokenWithAddress('BEEFY'),
    },
  ],
  [NETWORKS.baseGoerli.chainId]: [],
  [NETWORKS.mainnet.chainId]: [
    {
      id: '61b7623c-9ac2-4a73-a748-8db0b1c8c5bc', // euler USDC
      tokenAddress: '0xcd0e5871c97c663d43c62b5049c123bb45bfe2cc', // euler USDC
      poolId: '61b7623c-9ac2-4a73-a748-8db0b1c8c5bc', // euler USDC
      name: 'Euler',
      token: emptyTokenWithAddress('EULER'),
      forcedUnderlyings: ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    },
    {
      id: '618ddb92-fe0d-41e6-bdbe-e00d2a721055', // euler WETH
      tokenAddress: '0xd4de9d2fc1607d1df63e1c95ecbfa8d7946f5457', // euler WETH
      poolId: '618ddb92-fe0d-41e6-bdbe-e00d2a721055', // euler WETH
      name: 'Euler',
      token: emptyTokenWithAddress('EULER'),
      forcedUnderlyings: ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    },
    {
      id: 'c256de58-4176-49f9-99af-f48226573bb5', // euler DAI
      tokenAddress: '0xc4113b7605d691e073c162809060b6c5ae402f1e', // euler DAI
      poolId: 'c256de58-4176-49f9-99af-f48226573bb5', // euler DAI
      name: 'Euler',
      token: emptyTokenWithAddress('EULER'),
      forcedUnderlyings: ['0x6b175474e89094c44da98b954eedeac495271d0f'],
    },
    {
      id: '62be2bfe-80c8-484c-836b-a5fe97634e92', // euler WBTC
      tokenAddress: '0x48e345cb84895eab4db4c44ff9b619ca0be671d9', // euler WBTC
      poolId: '62be2bfe-80c8-484c-836b-a5fe97634e92', // euler WBTC
      name: 'Euler',
      token: emptyTokenWithAddress('EULER'),
      forcedUnderlyings: ['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'],
    },
    {
      id: '72f85156-068d-44e6-8c4d-94845370daef', // euler LUSD
      tokenAddress: '0xb95e6eee428902c234855990e18a632fa34407dc', // euler LUSD
      poolId: '72f85156-068d-44e6-8c4d-94845370daef', // euler LUSD
      name: 'Euler',
      token: emptyTokenWithAddress('EULER'),
      forcedUnderlyings: ['0x5f98805a4e8be255a32880fdec7f6728c6568ba0'],
    },
    {
      id: '1e31049a-403b-4029-a662-4342e70c20b8', // euler wstETH
      tokenAddress: '0x7c6d161b367ec0605260628c37b8dd778446256b', // euler wstETH
      poolId: '1e31049a-403b-4029-a662-4342e70c20b8', // euler wstETH
      name: 'Euler',
      token: emptyTokenWithAddress('EULER'),
      forcedUnderlyings: ['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'],
    },
  ],
  [NETWORKS.bsc.chainId]: [
    // {
    //   id: '', // Venus WBNB
    //   tokenAddress: '', // Venus WBNB
    //   poolId: '', // Venus WBNB
    //   name: 'Venus',
    //   token: emptyTokenWithAddress('VENUS'),
    // },
    {
      id: '89eba1e5-1b1b-47b6-958b-38138a04c244', // Venus USDC
      tokenAddress: '0x5ea1f5eb87ef6564ff8efc101ec3b24fab5583b4', // Venus USDC
      poolId: '89eba1e5-1b1b-47b6-958b-38138a04c244', // Venus USDC
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: '9f3a6015-5045-4471-ba65-ad3dc7c38269', // Venus USDT
      tokenAddress: '0xC721aa11BaA89Df3cF59dE754a8a891EFc64f2EF', // Venus USDT
      poolId: '9f3a6015-5045-4471-ba65-ad3dc7c38269', // Venus USDT
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: '483533e6-3112-44a1-beae-7cae023065a6', // Venus BUSD
      tokenAddress: '0xc2327D99C09a7fd60b423C96Dd76573546f1885E', // Venus BUSD
      poolId: '483533e6-3112-44a1-beae-7cae023065a6', // Venus BUSD
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: '87c8ee0d-b812-47c1-803f-f91a3907079e', // Venus BTCB
      tokenAddress: '0xFf8Beda0C55Bf0e6963e8Ae986d76479BdEA9D4B', // Venus BTCB
      poolId: '87c8ee0d-b812-47c1-803f-f91a3907079e', // Venus BTCB
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: 'de8928ad-d03a-423d-92d7-3c4648e3ffd2', // Venus ETH
      tokenAddress: '0x50aE1B194d9e030c98405545EBa295319B49cA33', // Venus ETH
      poolId: 'de8928ad-d03a-423d-92d7-3c4648e3ffd2', // Venus ETH
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: '7f81b151-a769-45d3-ae54-ef378633f035', // Venus DAI
      tokenAddress: '0x319d8497F6d8e5408A93e46538A681980F5DEEA5', // Venus DAI
      poolId: '7f81b151-a769-45d3-ae54-ef378633f035', // Venus DAI
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    // ---
    {
      id: '3cbdf078-5b0a-4483-8308-46e2f5f60c83', // Venus ADA
      tokenAddress: '0xB562CC5300e2Dd51f9770923b52cE5F372f97a0e', // Venus ADA
      poolId: '3cbdf078-5b0a-4483-8308-46e2f5f60c83', // Venus ADA
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: '88472ba3-f1e9-4da6-89da-eb12cf07e151', // Venus CAKE
      tokenAddress: '0xc492eA9B5D9e3f4188a6c57F5F146dbfa37AC6D6', // Venus CAKE
      poolId: '88472ba3-f1e9-4da6-89da-eb12cf07e151', // Venus CAKE
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: '1403642f-2083-4173-bfb9-979a44a75ec4', // Venus MATIC
      tokenAddress: '0xf3638ACAc71740e55C14d99e288F10ba4EDef348', // Venus MATIC
      poolId: '1403642f-2083-4173-bfb9-979a44a75ec4', // Venus MATIC
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: '422f1356-9e9c-471a-9641-135742da9891', // Venus DOT
      tokenAddress: '0x69B8FdEd983a19C81bbF8b0Ea21e702395bb6E36', // Venus DOT
      poolId: '422f1356-9e9c-471a-9641-135742da9891', // Venus DOT
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: '866ae932-54a6-4cf2-af45-2e70a94f2d09', // Venus DOGE
      tokenAddress: '0x0BADC4caa20E84e25e26a54CeC3faFeBcC7AB085', // Venus DOGE
      poolId: '866ae932-54a6-4cf2-af45-2e70a94f2d09', // Venus DOGE
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: '0204c8ff-0805-4515-a27e-742d23a15719', // Venus XRP
      tokenAddress: '0xa2b783bB283cA621f32a8792FFE4A10ad817C039', // Venus XRP
      poolId: '0204c8ff-0805-4515-a27e-742d23a15719', // Venus XRP
      name: 'Venus',
      token: emptyTokenWithAddress('VENUS'),
    },
    {
      id: '040aa2e6-372b-482c-98c1-7ad0feb2fa38', // beefy ETH
      tokenAddress: '0x353699126117ba6ed8f5d5928dfa797564e99e40', // beefy ETH
      poolId: '040aa2e6-372b-482c-98c1-7ad0feb2fa38', // beefy ETH
      name: 'Beefy',
      token: emptyTokenWithAddress('BEEFY'),
    },
    {
      id: '04b3c6cf-22c7-45eb-9de7-b5657477484e', // beefy BTCB
      tokenAddress: '0xea35aae53b30465f7362d5ebcb5d3ba01e17926e', // beefy BTCB
      poolId: '04b3c6cf-22c7-45eb-9de7-b5657477484e', // beefy BTCB
      name: 'Beefy',
      token: emptyTokenWithAddress('BEEFY'),
    },
    {
      id: '1ef337a5-9881-4756-8c72-47922679625a', // beefy BUSD
      tokenAddress: '0x45c53c0068bf31715fb41685bab59fd0bbc387f9', // beefy BUSD
      poolId: '1ef337a5-9881-4756-8c72-47922679625a', // beefy BUSD
      name: 'Beefy',
      token: emptyTokenWithAddress('BEEFY'),
    },
  ],
};
