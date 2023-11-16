/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DCAHub__factory, DCAPermissionsManager__factory } from '@mean-finance/dca-v2-core/dist';
import { DCAHubCompanion__factory } from '@mean-finance/dca-v2-periphery/dist';
import { ethers, Signer } from 'ethers';
import { Network, AlchemyProvider } from '@ethersproject/providers';
import find from 'lodash/find';

// ABIS
import ERC20ABI from '@abis/erc20.json';
import ERC721ABI from '@abis/erc721.json';
import PERMIT2ABI from '@abis/Permit2.json';
import MEANPERMIT2ABI from '@abis/MeanPermit2.json';
import OE_GAS_ORACLE_ABI from '@abis/OEGasOracle.json';
import SMOL_DOMAIN_ABI from '@abis/SmolDomain.json';

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
} from '@constants';
import {
  ERC20Contract,
  HubContract,
  OEGasOracle,
  SmolDomainContract,
  PositionVersions,
  Permit2Contract,
  MeanPermit2Contract,
  ERC721Contract,
} from '@types';
import ProviderService from './providerService';

export default class ContractService {
  client: ethers.providers.Web3Provider;

  network: Network;

  signer: Signer;

  providerService: ProviderService;

  constructor(providerService: ProviderService, chainId?: number) {
    this.providerService = providerService;
    if (chainId) {
      const foundNetwork = find(NETWORKS, { chainId });
      if (foundNetwork) {
        this.network = foundNetwork;
      }
    }
  }

  setNetwork(chainId: number) {
    const foundNetwork = find(NETWORKS, { chainId });
    if (foundNetwork) {
      this.network = foundNetwork;
    }
  }

  // ADDRESSES
  getHUBAddress(chainId: number, version?: PositionVersions): string {
    return HUB_ADDRESS[version || LATEST_VERSION][chainId] || HUB_ADDRESS[LATEST_VERSION][chainId];
  }

  getPermissionManagerAddress(chainId: number, version?: PositionVersions): string {
    return (
      PERMISSION_MANAGER_ADDRESS[version || LATEST_VERSION][chainId] ||
      PERMISSION_MANAGER_ADDRESS[LATEST_VERSION][chainId]
    );
  }

  getHUBCompanionAddress(chainId: number, version?: PositionVersions): string {
    return COMPANION_ADDRESS[version || LATEST_VERSION][chainId] || COMPANION_ADDRESS[LATEST_VERSION][chainId];
  }

  getMeanPermit2Address(chainId: number): string {
    return MEAN_PERMIT_2_ADDRESS[chainId];
  }

  getPermit2Address(chainId: number): string {
    return PERMIT_2_ADDRESS[chainId];
  }

  getSmolDomainAddress(chainId: number): string {
    return SMOL_DOMAIN_ADDRESS[chainId];
  }

  // CONTRACTS
  async getHubInstance(chainId: number, wallet: string, version?: PositionVersions): Promise<HubContract> {
    const hubAddress = this.getHUBAddress(chainId, version || LATEST_VERSION);
    const provider = await this.providerService.getSigner(wallet, chainId);

    const hub = DCAHub__factory.connect(hubAddress, provider as Signer);

    (hub as unknown as HubContract).deposit =
      hub['deposit(address,address,uint256,uint32,uint32,address,(address,uint8[])[])'];
    (hub as unknown as HubContract).estimateGas.deposit =
      hub.estimateGas['deposit(address,address,uint256,uint32,uint32,address,(address,uint8[])[])'];
    (hub as unknown as HubContract).populateTransaction.deposit =
      hub.populateTransaction['deposit(address,address,uint256,uint32,uint32,address,(address,uint8[])[])'];

    return hub as unknown as HubContract;
  }

  async getPermissionManagerInstance(chainId: number, wallet: string, version?: PositionVersions) {
    const permissionManagerAddress = this.getPermissionManagerAddress(chainId, version || LATEST_VERSION);
    const provider = await this.providerService.getSigner(wallet, chainId);

    return DCAPermissionsManager__factory.connect(permissionManagerAddress, provider);
  }

  async getHUBCompanionInstance(chainId: number, wallet: string, version?: PositionVersions) {
    const hubCompanionAddress = this.getHUBCompanionAddress(chainId, version || LATEST_VERSION);
    const provider = await this.providerService.getSigner(wallet, chainId);

    return DCAHubCompanion__factory.connect(hubCompanionAddress, provider);
  }

  async getOEGasOracleInstance(chainId: number, wallet: string): Promise<OEGasOracle> {
    let provider;

    if (!this.client || !this.signer || this.network.chainId !== NETWORKS.optimism.chainId) {
      provider = new AlchemyProvider('optimism', 'rMtUNxulZtkQesuF2x8XwydCS_SfsF5U');
    } else {
      provider = await this.providerService.getSigner(wallet, chainId);
    }
    return new ethers.Contract(OE_GAS_ORACLE_ADDRESS, OE_GAS_ORACLE_ABI.abi, provider) as unknown as OEGasOracle;
  }

  async getERC20TokenInstance(chainId: number, tokenAddress: string, wallet: string): Promise<ERC20Contract> {
    const provider = await this.providerService.getSigner(wallet, chainId);
    return new ethers.Contract(tokenAddress, ERC20ABI, provider) as unknown as ERC20Contract;
  }

  async getERC721TokenInstance(chainId: number, tokenAddress: string, wallet: string): Promise<ERC721Contract> {
    const signer = await this.providerService.getSigner(wallet, chainId);
    return new ethers.Contract(tokenAddress, ERC721ABI, signer) as unknown as ERC721Contract;
  }

  async getPermit2Instance(chainId: number, wallet: string): Promise<Permit2Contract> {
    const provider = await this.providerService.getSigner(wallet, chainId);
    const permit2Address = this.getPermit2Address(chainId);

    return new ethers.Contract(permit2Address, PERMIT2ABI, provider) as unknown as Permit2Contract;
  }

  async getMeanPermit2Instance(chainId: number, wallet: string): Promise<MeanPermit2Contract> {
    const provider = await this.providerService.getSigner(wallet, chainId);
    const meanPermit2Address = this.getMeanPermit2Address(chainId);

    return new ethers.Contract(meanPermit2Address, MEANPERMIT2ABI, provider) as unknown as MeanPermit2Contract;
  }

  async getSmolDomainInstance(chainId: number, wallet: string): Promise<SmolDomainContract> {
    const provider = await this.providerService.getSigner(wallet, chainId);
    const smolDomainAddress = this.getSmolDomainAddress(chainId);

    return new ethers.Contract(smolDomainAddress, SMOL_DOMAIN_ABI, provider) as unknown as SmolDomainContract;
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
