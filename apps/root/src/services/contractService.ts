/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// ABIS
import ERC20ABI from '@abis/erc20';
import ERC721ABI from '@abis/erc721';
import PERMIT2ABI from '@abis/Permit2';
import MEANPERMIT2ABI from '@abis/MeanPermit2';
import EARN_VAULT_ABI from '@abis/EarnVault';
import SMOL_DOMAIN_ABI from '@abis/SmolDomain';
import HUB_ABI from '@abis/Hub';
import HUB_COMPANION_ABI from '@abis/HubCompanion';
import PERMISSION_MANAGER_ABI from '@abis/PermissionsManager';

// ADDRESSES
import {
  COMPANION_ADDRESS,
  HUB_ADDRESS,
  PERMISSION_MANAGER_ADDRESS,
  LATEST_VERSION,
  SMOL_DOMAIN_ADDRESS,
  MEAN_PERMIT_2_ADDRESS,
  PERMIT_2_ADDRESS,
  EARN_COMPANION_ADDRESS,
  EARN_VAULT_ADDRESS,
} from '@constants';
import { PositionVersions } from '@types';
import ProviderService from './providerService';
import { Address, getContract, publicActions } from 'viem';
import { CLAIM_ABIS } from '@constants/campaigns';
import { Chains } from '@balmy/sdk';

export type ContractInstanceParams<ReadOnly extends boolean> = {
  chainId: number;
  readOnly: ReadOnly;
  // wallet?: ReadOnly extends true ? never : NonNullable<Address>;
  // eslint-disable-next-line @typescript-eslint/ban-types
} & (ReadOnly extends false ? { wallet: NonNullable<Address> } : {});

export type ContractInstanceParamsWithVersion<ReadOnly extends boolean> = ContractInstanceParams<ReadOnly> & {
  version?: PositionVersions;
};

export default class ContractService {
  providerService: ProviderService;

  constructor(providerService: ProviderService) {
    this.providerService = providerService;
  }

  // ADDRESSES
  getHUBAddress(chainId: number, version?: PositionVersions): Address | undefined {
    const hubAddress = HUB_ADDRESS[version || LATEST_VERSION][chainId] || HUB_ADDRESS[LATEST_VERSION][chainId];
    if (!hubAddress) return;
    return hubAddress.toLowerCase() as Address;
  }

  getPermissionManagerAddress(chainId: number, version?: PositionVersions): Address | undefined {
    const permissionManagerAddress =
      PERMISSION_MANAGER_ADDRESS[version || LATEST_VERSION][chainId] ||
      PERMISSION_MANAGER_ADDRESS[LATEST_VERSION][chainId];
    if (!permissionManagerAddress) return;
    return permissionManagerAddress.toLowerCase() as Address;
  }

  getHUBCompanionAddress(chainId: number, version?: PositionVersions): Address | undefined {
    const hubCompanionAddress =
      COMPANION_ADDRESS[version || LATEST_VERSION][chainId] || COMPANION_ADDRESS[LATEST_VERSION][chainId];
    if (!hubCompanionAddress) return;
    return hubCompanionAddress.toLowerCase() as Address;
  }

  getMeanPermit2Address(chainId: number): Address {
    return MEAN_PERMIT_2_ADDRESS[chainId].toLowerCase() as Address;
  }

  getPermit2Address(chainId: number): Address {
    return PERMIT_2_ADDRESS[chainId].toLowerCase() as Address;
  }

  getSmolDomainAddress(chainId: number): Address {
    return SMOL_DOMAIN_ADDRESS[chainId].toLowerCase() as Address;
  }

  getEarnCompanionAddress(chainId: number): Address | undefined {
    const earnCompanionAddress = EARN_COMPANION_ADDRESS[chainId] || EARN_COMPANION_ADDRESS[Chains.POLYGON.chainId];
    if (!earnCompanionAddress) return;
    return earnCompanionAddress.toLowerCase() as Address;
  }

  getEarnVaultAddress(chainId: number): `0x${Lowercase<string>}` | undefined {
    const earnVaultAddress = EARN_VAULT_ADDRESS[chainId];
    if (!earnVaultAddress) return;
    return earnVaultAddress.toLowerCase() as `0x${Lowercase<string>}`;
  }

  async getPublicClientAndWalletClient<ReadOnly extends boolean>(
    args: ContractInstanceParams<ReadOnly>
  ): Promise<{
    publicClient: ReturnType<ProviderService['getProvider']>;
    walletClient: ReadOnly extends false
      ? NonNullable<Awaited<ReturnType<ProviderService['getSigner']>>>
      : Awaited<ReturnType<ProviderService['getSigner']>>;
  }> {
    const publicClient = this.providerService.getProvider(args.chainId);
    let walletClient;

    if ('wallet' in args && args.readOnly === false) {
      const wallet = args.wallet;
      walletClient = (await this.providerService.getSigner(wallet))?.extend(publicActions);
    }

    // const newClient = walletClient as (typeof args['readOnly'] extends false ? NonNullable<Awaited<ReturnType<ProviderService['getSigner']>>> : Awaited<ReturnType<ProviderService['getSigner']>> | undefined)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return { publicClient, walletClient } as any;
  }

  // CONTRACTS
  async getHubInstance<ReadOnly extends boolean>(args: ContractInstanceParamsWithVersion<ReadOnly>) {
    const { chainId, version = LATEST_VERSION } = args;
    const hubAddress = this.getHUBAddress(chainId, version);
    if (!hubAddress) return;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: HUB_ABI,
      address: hubAddress,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }

  async getPermissionManagerInstance<ReadOnly extends boolean>(args: ContractInstanceParamsWithVersion<ReadOnly>) {
    const { chainId, version = LATEST_VERSION } = args;
    const permissionManagerAddress = this.getPermissionManagerAddress(chainId, version);
    if (!permissionManagerAddress) return;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: PERMISSION_MANAGER_ABI,
      address: permissionManagerAddress,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }

  async getHUBCompanionInstance<ReadOnly extends boolean>(args: ContractInstanceParamsWithVersion<ReadOnly>) {
    const { chainId, version = LATEST_VERSION } = args;
    const hubCompanionAddress = this.getHUBCompanionAddress(chainId, version);
    if (!hubCompanionAddress) return;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: HUB_COMPANION_ABI,
      address: hubCompanionAddress,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }

  async getERC20TokenInstance<ReadOnly extends boolean>(
    args: ContractInstanceParams<ReadOnly> & { tokenAddress: Address }
  ) {
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: ERC20ABI,
      address: args.tokenAddress,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }

  async getERC721TokenInstance<ReadOnly extends boolean>(
    args: ContractInstanceParams<ReadOnly> & { tokenAddress: Address }
  ) {
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: ERC721ABI,
      address: args.tokenAddress,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }

  async getPermit2Instance<ReadOnly extends boolean>(args: ContractInstanceParams<ReadOnly>) {
    const { chainId } = args;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);
    const permit2Address = this.getPermit2Address(chainId);

    return getContract({
      abi: PERMIT2ABI,
      address: permit2Address,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }

  async getEarnVaultInstance<ReadOnly extends boolean>(args: ContractInstanceParams<ReadOnly>) {
    const { chainId } = args;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);
    const earnVaultAddress = this.getEarnVaultAddress(chainId);
    if (!earnVaultAddress) return;
    return getContract({
      abi: EARN_VAULT_ABI,
      address: earnVaultAddress,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }

  async getMeanPermit2Instance<ReadOnly extends boolean>(args: ContractInstanceParams<ReadOnly>) {
    const { chainId } = args;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);
    const meanPermit2Address = this.getMeanPermit2Address(chainId);

    return getContract({
      abi: MEANPERMIT2ABI,
      address: meanPermit2Address,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }

  async getSmolDomainInstance<ReadOnly extends boolean>(args: ContractInstanceParams<ReadOnly>) {
    const { chainId } = args;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);
    const smolDomainAddress = this.getSmolDomainAddress(chainId);

    return getContract({
      abi: SMOL_DOMAIN_ABI,
      address: smolDomainAddress,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }

  async getCampaignInstance<ReadOnly extends boolean>(
    args: ContractInstanceParams<ReadOnly>,
    address: Address,
    campaignId: string
  ) {
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: CLAIM_ABIS[campaignId as keyof typeof CLAIM_ABIS],
      address,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
