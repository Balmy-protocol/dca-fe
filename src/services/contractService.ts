/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ethers, Signer } from 'ethers';
import { Network, getNetwork as getStringNetwork, Provider } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import find from 'lodash/find';

// ABIS
import ERC20ABI from 'abis/erc20.json';
import ORACLE_AGGREGATOR_ABI from 'abis/OracleAggregator.json';
import HUB_COMPANION_ABI from 'abis/HubCompanion.json';
import HUB_ABI from 'abis/Hub.json';
import CHAINLINK_ORACLE_ABI from 'abis/ChainlinkOracle.json';
import UNISWAP_ORACLE_ABI from 'abis/UniswapOracle.json';
import PERMISSION_MANAGER_ABI from 'abis/PermissionsManager.json';
import MIGRATOR_ABI from 'abis/BetaMigrator.json';
import OE_GAS_ORACLE_ABI from 'abis/OEGasOracle.json';

// ADDRESSES
import {
  MIGRATOR_ADDRESS,
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
} from 'config/constants';
import {
  BetaMigratorContract,
  ERC20Contract,
  HubCompanionContract,
  HubContract,
  OEGasOracle,
  OracleContract,
  PermissionManagerContract,
} from 'types';

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
        infura: '5744aff1d49f4eee923c5f3e5af4cc1c',
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

    return Promise.resolve(NETWORKS.optimism);
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

  async getMigratorAddress(version?: PositionVersions): Promise<string> {
    const network = await this.getNetwork();

    return (
      MIGRATOR_ADDRESS[version || LATEST_VERSION][network.chainId] || MIGRATOR_ADDRESS[LATEST_VERSION][network.chainId]
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

  // CONTRACTS
  async getHubInstance(version?: PositionVersions): Promise<HubContract> {
    const hubAddress = await this.getHUBAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return new ethers.Contract(hubAddress, HUB_ABI.abi, provider) as unknown as HubContract;
  }

  async getPermissionManagerInstance(version?: PositionVersions): Promise<PermissionManagerContract> {
    const permissionManagerAddress = await this.getPermissionManagerAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      provider
    ) as unknown as PermissionManagerContract;
  }

  async getMigratorInstance(version?: PositionVersions): Promise<BetaMigratorContract> {
    const migratorAddress = await this.getMigratorAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return new ethers.Contract(migratorAddress, MIGRATOR_ABI.abi, provider) as unknown as BetaMigratorContract;
  }

  async getHUBCompanionInstance(version?: PositionVersions): Promise<HubCompanionContract> {
    const hubCompanionAddress = await this.getHUBCompanionAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return new ethers.Contract(hubCompanionAddress, HUB_COMPANION_ABI.abi, provider) as unknown as HubCompanionContract;
  }

  async getOracleInstance(version?: PositionVersions): Promise<OracleContract> {
    const oracleAddress = await this.getOracleAddress(version || LATEST_VERSION);
    const provider = await this.getProvider();

    return new ethers.Contract(oracleAddress, ORACLE_AGGREGATOR_ABI.abi, provider) as unknown as OracleContract;
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
    const provider = await this.getProvider();

    return new ethers.Contract(OE_GAS_ORACLE_ADDRESS, OE_GAS_ORACLE_ABI.abi, provider) as unknown as OEGasOracle;
  }

  async getTokenInstance(tokenAddress: string): Promise<ERC20Contract> {
    const provider = await this.getProvider();

    return new ethers.Contract(tokenAddress, ERC20ABI, provider) as unknown as ERC20Contract;
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
