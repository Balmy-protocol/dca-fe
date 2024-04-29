/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// ABIS
import ERC20ABI from '@abis/erc20';
import ERC721ABI from '@abis/erc721';
import PERMIT2ABI from '@abis/Permit2';
import MEANPERMIT2ABI from '@abis/MeanPermit2';
import OE_GAS_ORACLE_ABI from '@abis/OEGasOracle';
import SMOL_DOMAIN_ABI from '@abis/SmolDomain';
import HUB_ABI from '@abis/Hub';
import HUB_COMPANION_ABI from '@abis/HubCompanion';
import PERMISSION_MANAGER_ABI from '@abis/PermissionsManager';
import MULTICALLABI from '@abis/Multicall';

// ADDRESSES
import {
  COMPANION_ADDRESS,
  HUB_ADDRESS,
  NETWORKS,
  PERMISSION_MANAGER_ADDRESS,
  LATEST_VERSION,
  OE_GAS_ORACLE_ADDRESS,
  SMOL_DOMAIN_ADDRESS,
  MEAN_PERMIT_2_ADDRESS,
  PERMIT_2_ADDRESS,
  MULTICALL_ADDRESS,
  MULTICALL_DEFAULT_ADDRESS,
} from '@constants';
import { PositionVersions } from '@types';
import ProviderService from './providerService';
import { Address, getContract } from 'viem';

export type ContractInstanceBaseParams = {
  chainId: number;
  readOnly: boolean;
};

export type ContractInstanceReadParams = ContractInstanceBaseParams & {
  readOnly: true;
};
export type ContractInstanceWriteParams = ContractInstanceBaseParams & {
  readOnly: false;
  wallet: Address;
};

export type ContractInstanceParams = ContractInstanceReadParams | ContractInstanceWriteParams;

export type ContractInstanceParamsWithVersion = ContractInstanceParams & {
  version?: PositionVersions;
};

export default class ContractService {
  providerService: ProviderService;

  constructor(providerService: ProviderService) {
    this.providerService = providerService;
  }

  // ADDRESSES
  getHUBAddress(chainId: number, version?: PositionVersions): Address {
    return HUB_ADDRESS[version || LATEST_VERSION][chainId] || HUB_ADDRESS[LATEST_VERSION][chainId];
  }

  getPermissionManagerAddress(chainId: number, version?: PositionVersions): Address {
    return (
      PERMISSION_MANAGER_ADDRESS[version || LATEST_VERSION][chainId] ||
      PERMISSION_MANAGER_ADDRESS[LATEST_VERSION][chainId]
    );
  }

  getHUBCompanionAddress(chainId: number, version?: PositionVersions): Address {
    return COMPANION_ADDRESS[version || LATEST_VERSION][chainId] || COMPANION_ADDRESS[LATEST_VERSION][chainId];
  }

  getMeanPermit2Address(chainId: number): Address {
    return MEAN_PERMIT_2_ADDRESS[chainId];
  }

  getPermit2Address(chainId: number): Address {
    return PERMIT_2_ADDRESS[chainId];
  }

  getSmolDomainAddress(chainId: number): Address {
    return SMOL_DOMAIN_ADDRESS[chainId];
  }

  getMulticallAddress(chainId: number): Address {
    return MULTICALL_ADDRESS[chainId] || MULTICALL_DEFAULT_ADDRESS;
  }

  async getPublicClientAndWalletClient(args: ContractInstanceParams) {
    const publicClient = this.providerService.getProvider(args.chainId);
    let walletClient;

    if (!args.readOnly) {
      const { wallet } = args;
      walletClient = await this.providerService.getSigner(wallet);
    }

    return { publicClient, walletClient };
  }

  // CONTRACTS
  async getHubInstance(args: ContractInstanceParamsWithVersion) {
    const { chainId, version = LATEST_VERSION } = args;
    const hubAddress = this.getHUBAddress(chainId, version);
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: HUB_ABI,
      address: hubAddress,
      publicClient: publicClient,
      walletClient,
    });
  }

  async getPermissionManagerInstance(args: ContractInstanceParamsWithVersion) {
    const { chainId, version = LATEST_VERSION } = args;
    const permissionManagerAddress = this.getPermissionManagerAddress(chainId, version);
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: PERMISSION_MANAGER_ABI,
      address: permissionManagerAddress,
      publicClient: publicClient,
      walletClient,
    });
  }

  async getHUBCompanionInstance(args: ContractInstanceParamsWithVersion) {
    const { chainId, version = LATEST_VERSION } = args;
    const hubCompanionAddress = this.getHUBCompanionAddress(chainId, version);
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: HUB_COMPANION_ABI,
      address: hubCompanionAddress,
      publicClient: publicClient,
      walletClient,
    });
  }

  async getOEGasOracleInstance(args: ContractInstanceParams) {
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient({
      ...args,
      chainId: NETWORKS.OPTIMISM.chainId,
    });

    return getContract({
      abi: OE_GAS_ORACLE_ABI,
      address: OE_GAS_ORACLE_ADDRESS,
      publicClient: publicClient,
      walletClient,
    });
  }

  async getERC20TokenInstance(args: ContractInstanceParams & { tokenAddress: Address }) {
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: ERC20ABI,
      address: args.tokenAddress,
      publicClient: publicClient,
      walletClient,
    });
  }

  async getMulticallInstance(args: ContractInstanceParams) {
    const { chainId } = args;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);
    const multicallAddress = this.getMulticallAddress(chainId);

    return getContract({
      abi: MULTICALLABI,
      address: multicallAddress,
      publicClient: publicClient,
      walletClient,
    });
  }

  async getERC721TokenInstance(args: ContractInstanceParams & { tokenAddress: Address }) {
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);

    return getContract({
      abi: ERC721ABI,
      address: args.tokenAddress,
      publicClient: publicClient,
      walletClient,
    });
  }

  async getPermit2Instance(args: ContractInstanceParams) {
    const { chainId } = args;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);
    const permit2Address = this.getPermit2Address(chainId);

    return getContract({
      abi: PERMIT2ABI,
      address: permit2Address,
      publicClient: publicClient,
      walletClient,
    });
  }

  async getMeanPermit2Instance(args: ContractInstanceParams) {
    const { chainId } = args;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);
    const meanPermit2Address = this.getMeanPermit2Address(chainId);

    return getContract({
      abi: MEANPERMIT2ABI,
      address: meanPermit2Address,
      publicClient: publicClient,
      walletClient,
    });
  }

  async getSmolDomainInstance(args: ContractInstanceParams) {
    const { chainId } = args;
    const { publicClient, walletClient } = await this.getPublicClientAndWalletClient(args);
    const smolDomainAddress = this.getSmolDomainAddress(chainId);

    return getContract({
      abi: SMOL_DOMAIN_ABI,
      address: smolDomainAddress,
      publicClient: publicClient,
      walletClient,
    });
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
