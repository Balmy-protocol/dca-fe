/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DCAHub__factory, DCAPermissionsManager__factory } from '@mean-finance/dca-v2-core/dist';
import { DCAHubCompanion__factory } from '@mean-finance/dca-v2-periphery/dist';
import { OracleAggregator__factory } from '@mean-finance/oracles/dist';
import { TransformerRegistry__factory } from '@mean-finance/transformers/dist';
import { ethers, Signer } from 'ethers';
import { Network, getNetwork as getStringNetwork, Provider, AlchemyProvider } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import find from 'lodash/find';
// import allExportedFromTypechained from '@mean-finance/typechained/lib';

// ABIS
import ERC20ABI from 'abis/erc20.json';
import CHAINLINK_ORACLE_ABI from 'abis/ChainlinkOracle.json';
import UNISWAP_ORACLE_ABI from 'abis/UniswapOracle.json';
import OE_GAS_ORACLE_ABI from 'abis/OEGasOracle.json';
import SMOL_DOMAIN_ABI from 'abis/SmolDomain.json';

// ADDRESSES
import {
  CHAINLINK_ORACLE_ADDRESS,
  COMPANION_ADDRESS,
  HUB_ADDRESS,
  NETWORKS,
  ORACLE_ADDRESS,
  PERMISSION_MANAGER_ADDRESS,
  UNISWAP_ORACLE_ADDRESS,
  PositionVersions,
  LATEST_VERSION,
  OE_GAS_ORACLE_ADDRESS,
  TRANSFORMER_REGISTRY_ADDRESS,
  DEFAULT_NETWORK_FOR_VERSION,
  SMOL_DOMAIN_ADDRESS,
} from 'config/constants';
import { ERC20Contract, HubContract, OEGasOracle, OracleContract, SmolDomainContract } from 'types';

export default class ContractService {
  client: ethers.providers.Web3Provider;

  network: Network;

  signer: Signer;

  constructor(client?: ethers.providers.Web3Provider, chainId?: number) {
    if (client) {
      this.client = client;
    }

    if (chainId) {
      const foundNetwork = find(NETWORKS, { chainId });
      if (foundNetwork) {
        this.network = foundNetwork;
      }
    }
  }

  setClient(client: ethers.providers.Web3Provider) {
    this.client = client;
    this.signer = client.getSigner();
  }

  setNetwork(chainId: number) {
    const foundNetwork = find(NETWORKS, { chainId });
    if (foundNetwork) {
      this.network = foundNetwork;
    }
  }

  getProvider() {
    if (this.signer) {
      return this.signer;
    }

    if (this.client) {
      return this.client;
    }

    try {
      return ethers.getDefaultProvider(getStringNetwork(this.network.name), {
        infura: 'd729b4ddc49d4ce88d4e23865cb74217',
        etherscan: '4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF',
      });
    } catch {
      return detectEthereumProvider() as Promise<Provider>;
    }
  }

  async getNetwork(skipDefaultNetwork = false) {
    if (!skipDefaultNetwork && this.network) {
      return this.network;
    }

    try {
      if (this.client) {
        return await this.client.getNetwork();
      }
    } catch (e) {
      console.error('Failed to getNetwork through this.client');
    }

    try {
      if (window.ethereum) {
        if (window.ethereum.isMetaMask) {
          // eslint-disable-next-line no-underscore-dangle
          if (window?.ethereum?._state?.initialized || window?.ethereum?._state?.isUnlocked) {
            // eslint-disable-next-line no-underscore-dangle
            return await new ethers.providers.Web3Provider(window.ethereum).getNetwork();
          }
        } else {
          return await new ethers.providers.Web3Provider(window.ethereum).getNetwork();
        }
      }
    } catch (e) {
      console.error('Failed to getNetwork through metamask');
    }

    return Promise.resolve(DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION]);
  }

  // ADDRESSES
  async getHUBAddress(version?: PositionVersions): Promise<string> {
    const network = await this.getNetwork();

    return HUB_ADDRESS[version || LATEST_VERSION][network.chainId] || HUB_ADDRESS[LATEST_VERSION][network.chainId];
  }

  async getPermissionManagerAddress(version?: PositionVersions): Promise<string> {
    const network = await this.getNetwork();

    return (
      PERMISSION_MANAGER_ADDRESS[version || LATEST_VERSION][network.chainId] ||
      PERMISSION_MANAGER_ADDRESS[LATEST_VERSION][network.chainId]
    );
  }

  async getTransformerRegistryAddress(version?: PositionVersions): Promise<string> {
    const network = await this.getNetwork();

    return (
      TRANSFORMER_REGISTRY_ADDRESS[version || LATEST_VERSION][network.chainId] ||
      TRANSFORMER_REGISTRY_ADDRESS[LATEST_VERSION][network.chainId]
    );
  }

  async getHUBCompanionAddress(version?: PositionVersions): Promise<string> {
    const network = await this.getNetwork();

    return (
      COMPANION_ADDRESS[version || LATEST_VERSION][network.chainId] ||
      COMPANION_ADDRESS[LATEST_VERSION][network.chainId]
    );
  }

  async getOracleAddress(version?: PositionVersions): Promise<string> {
    const network = await this.getNetwork();

    return (
      ORACLE_ADDRESS[version || LATEST_VERSION][network.chainId] || ORACLE_ADDRESS[LATEST_VERSION][network.chainId]
    );
  }

  async getChainlinkOracleAddress(version?: PositionVersions): Promise<string> {
    const network = await this.getNetwork();

    return (
      CHAINLINK_ORACLE_ADDRESS[version || LATEST_VERSION][network.chainId] ||
      CHAINLINK_ORACLE_ADDRESS[LATEST_VERSION][network.chainId]
    );
  }

  async getUniswapOracleAddress(version?: PositionVersions): Promise<string> {
    const network = await this.getNetwork();

    return (
      UNISWAP_ORACLE_ADDRESS[version || LATEST_VERSION][network.chainId] ||
      UNISWAP_ORACLE_ADDRESS[LATEST_VERSION][network.chainId]
    );
  }

  async getSmolDomainAddress(): Promise<string> {
    const network = await this.getNetwork();

    return SMOL_DOMAIN_ADDRESS[network.chainId];
  }

  // CONTRACTS
  async getHubInstance(version?: PositionVersions): Promise<HubContract> {
    const hubAddress = await this.getHUBAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    const hub = DCAHub__factory.connect(hubAddress, provider as Signer);

    (hub as unknown as HubContract).deposit =
      hub['deposit(address,address,uint256,uint32,uint32,address,(address,uint8[])[])'];
    (hub as unknown as HubContract).estimateGas.deposit =
      hub.estimateGas['deposit(address,address,uint256,uint32,uint32,address,(address,uint8[])[])'];

    return hub as unknown as HubContract;
  }

  async getPermissionManagerInstance(version?: PositionVersions) {
    const permissionManagerAddress = await this.getPermissionManagerAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return DCAPermissionsManager__factory.connect(permissionManagerAddress, provider);
  }

  async getTransformerRegistryInstance(version?: PositionVersions) {
    const transformerRegistryAddress = await this.getTransformerRegistryAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return TransformerRegistry__factory.connect(transformerRegistryAddress, provider);
  }

  async getHUBCompanionInstance(version?: PositionVersions) {
    const hubCompanionAddress = await this.getHUBCompanionAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return DCAHubCompanion__factory.connect(hubCompanionAddress, provider);
  }

  async getOracleInstance(version?: PositionVersions) {
    const oracleAddress = await this.getOracleAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return OracleAggregator__factory.connect(oracleAddress, provider);
  }

  async getChainlinkOracleInstance(version?: PositionVersions): Promise<OracleContract> {
    const chainlinkOracleAddress = await this.getChainlinkOracleAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return new ethers.Contract(chainlinkOracleAddress, CHAINLINK_ORACLE_ABI.abi, provider) as unknown as OracleContract;
  }

  async getUniswapOracleInstance(version?: PositionVersions): Promise<OracleContract> {
    const uniswapOracleAddress = await this.getUniswapOracleAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return new ethers.Contract(uniswapOracleAddress, UNISWAP_ORACLE_ABI.abi, provider) as unknown as OracleContract;
  }

  async getOEGasOracleInstance(): Promise<OEGasOracle> {
    let provider;

    if (!this.client || !this.signer || this.network.chainId !== NETWORKS.optimism.chainId) {
      provider = new AlchemyProvider('optimism', 'rMtUNxulZtkQesuF2x8XwydCS_SfsF5U');
    } else {
      provider = await this.getProvider();
    }
    return new ethers.Contract(OE_GAS_ORACLE_ADDRESS, OE_GAS_ORACLE_ABI.abi, provider) as unknown as OEGasOracle;
  }

  async getTokenInstance(tokenAddress: string): Promise<ERC20Contract> {
    const provider = await this.getProvider();

    return new ethers.Contract(tokenAddress, ERC20ABI, provider) as unknown as ERC20Contract;
  }

  async getSmolDomainInstance(): Promise<SmolDomainContract> {
    const provider = await this.getProvider();
    const smolDomainAddress = await this.getSmolDomainAddress();

    return new ethers.Contract(smolDomainAddress, SMOL_DOMAIN_ABI, provider) as unknown as SmolDomainContract;
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
