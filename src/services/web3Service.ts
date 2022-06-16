import { ethers, Signer, BigNumber, VoidSigner } from 'ethers';
import { Interface, LogDescription } from '@ethersproject/abi';
import {
  ExternalProvider,
  Log,
  Provider,
  TransactionResponse,
  getNetwork as getStringNetwork,
} from '@ethersproject/providers';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';
import { getProviderInfo } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import detectEthereumProvider from '@metamask/detect-provider';
import Authereum from 'authereum';
import Torus from '@toruslabs/torus-embed';
import values from 'lodash/values';
import orderBy from 'lodash/orderBy';
import keyBy from 'lodash/keyBy';
import find from 'lodash/find';
import { AxiosInstance, AxiosResponse } from 'axios';
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal';
import {
  CoinGeckoPriceResponse,
  Token,
  AvailablePairResponse,
  AvailablePairs,
  PositionResponse,
  TransactionPositionTypeDataOptions,
  Position,
  PositionKeyBy,
  TransactionDetails,
  NewPositionTypeData,
  TerminatePositionTypeData,
  WithdrawTypeData,
  AddFundsTypeData,
  ModifySwapsPositionTypeData,
  RemoveFundsTypeData,
  TokenList,
  ResetPositionTypeData,
  ModifyRateAndSwapsPositionTypeData,
  PoolLiquidityData,
  TxPriceResponse,
  GetNextSwapInfo,
  NFTData,
  GetUsedTokensData,
  PositionsGraphqlResponse,
  AvailablePairsGraphqlResponse,
  PoolsLiquidityDataGraphqlResponse,
  SwapsToPerform,
  FullPosition,
  TransferTypeData,
  PositionPermission,
  MigratePositionTypeData,
  ModifyPermissionsTypeData,
} from 'types';
import { MaxUint256 } from '@ethersproject/constants';
import { sortTokens, sortTokensByAddress } from 'utils/parsing';
import { buildSwapInput } from 'utils/swap';

// GQL queries
import GET_AVAILABLE_PAIRS from 'graphql/getAvailablePairs.graphql';
import GET_POSITIONS from 'graphql/getPositions.graphql';
import GET_PAIR_LIQUIDITY from 'graphql/getPairLiquidity.graphql';
import gqlFetchAll from 'utils/gqlFetchAll';

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

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, ETH_COMPANION_ADDRESS, getWrappedProtocolToken, getProtocolToken } from 'mocks/tokens';
import {
  MIGRATOR_ADDRESS,
  CHAINLINK_GRAPHQL_URL,
  CHAINLINK_ORACLE_ADDRESS,
  COINGECKO_IDS,
  COMPANION_ADDRESS,
  COMPANION_V2_ADDRESS,
  DEFILLAMA_IDS,
  HUB_ADDRESS,
  HUB_V2_ADDRESS,
  MAX_UINT_32,
  MEAN_GRAPHQL_URL,
  MEAN_V2_GRAPHQL_URL,
  NETWORKS,
  OE_GAS_ORACLE_ADDRESS,
  ORACLES,
  ORACLE_ADDRESS,
  PERMISSIONS,
  PERMISSION_MANAGER_ADDRESS,
  PERMISSION_V2_MANAGER_ADDRESS,
  POSITION_VERSION_2,
  POSITION_VERSION_3,
  SWAP_INTERVALS_MAP,
  TOKEN_DESCRIPTOR_ADDRESS,
  TRANSACTION_TYPES,
  UNISWAP_ORACLE_ADDRESS,
  UNI_GRAPHQL_URL,
  SUPPORTED_NETWORKS,
} from 'config/constants';
import {
  BetaMigratorContract,
  ERC20Contract,
  HubCompanionContract,
  HubContract,
  OEGasOracle,
  OracleContract,
  Oracles,
  PermissionManagerContract,
} from 'types/contracts';
import { setupAxiosClient } from 'state';
import { fromRpcSig } from 'ethereumjs-util';
import GraphqlService from './graphql';
import injectedConnector from './InjectedConnector';

export default class Web3Service {
  client: ethers.providers.Web3Provider;

  modal: SafeAppWeb3Modal;

  signer: Signer;

  availablePairs: AvailablePairs;

  apolloClient: GraphqlService;

  uniClient: GraphqlService;

  chainlinkClient: GraphqlService;

  account: string;

  setAccountCallback: React.Dispatch<React.SetStateAction<string>>;

  currentPositions: PositionKeyBy;

  pastPositions: PositionKeyBy;

  tokenList: TokenList;

  providerInfo: { id: string; logo: string; name: string };

  axiosClient: AxiosInstance;

  constructor(
    setAccountCallback?: React.Dispatch<React.SetStateAction<string>>,
    client?: ethers.providers.Web3Provider,
    modal?: SafeAppWeb3Modal
  ) {
    if (setAccountCallback) {
      this.setAccountCallback = setAccountCallback;
    }

    if (client) {
      this.client = client;
    }
    if (modal) {
      this.modal = modal;
    }

    this.axiosClient = setupAxiosClient();
    this.apolloClient = new GraphqlService();
    this.uniClient = new GraphqlService();
    this.chainlinkClient = new GraphqlService();
  }

  // GETTERS AND SETTERS
  setClient(client: ethers.providers.Web3Provider) {
    this.client = client;
  }

  setSigner(signer: Signer) {
    this.signer = signer;
  }

  getClient() {
    return this.client;
  }

  getDCAGraphqlClient() {
    return this.apolloClient;
  }

  getUNIGraphqlClient() {
    return this.uniClient;
  }

  getChainlinkGraphqlClient() {
    return this.chainlinkClient;
  }

  getProviderInfo() {
    return this.providerInfo;
  }

  setModal(modal: SafeAppWeb3Modal) {
    this.modal = modal;
  }

  getModal() {
    return this.modal;
  }

  setAccount(account: string) {
    this.account = account;
    this.setAccountCallback(account);
  }

  async getNetwork() {
    if (this.client) {
      return this.client.getNetwork();
    }

    if (window.ethereum) {
      return new ethers.providers.Web3Provider(window.ethereum).getNetwork();
    }

    return Promise.resolve(NETWORKS.optimism);
  }

  getAccount() {
    return this.account;
  }

  getSigner() {
    return this.signer;
  }

  getCurrentPositions() {
    return orderBy(values(this.currentPositions), 'startedAt', 'desc');
  }

  getPastPositions() {
    return orderBy(values(this.pastPositions), 'startedAt', 'desc');
  }

  getAvailablePairs() {
    return this.availablePairs;
  }

  getTokenList() {
    return this.tokenList;
  }

  getUsedTokens() {
    return this.axiosClient.get<GetUsedTokensData>(
      `https://api.ethplorer.io/getAddressInfo/${this.getAccount()}?apiKey=${process.env.ETHPLORER_KEY || ''}`
    );
  }

  // ADDRESSES
  async getHUBAddress() {
    const network = await this.getNetwork();

    return HUB_ADDRESS[network.chainId] || HUB_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getHUBV2Address() {
    const network = await this.getNetwork();

    return HUB_V2_ADDRESS[network.chainId] || HUB_V2_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getPermissionManagerAddress() {
    const network = await this.getNetwork();

    return PERMISSION_MANAGER_ADDRESS[network.chainId] || PERMISSION_MANAGER_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getPermissionManagerV2Address() {
    const network = await this.getNetwork();

    return PERMISSION_V2_MANAGER_ADDRESS[network.chainId] || PERMISSION_V2_MANAGER_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getMigratorAddress() {
    const network = await this.getNetwork();

    return MIGRATOR_ADDRESS[network.chainId] || MIGRATOR_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getHUBCompanionAddress() {
    const network = await this.getNetwork();

    return COMPANION_ADDRESS[network.chainId] || COMPANION_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getHUBCompanionV2Address() {
    const network = await this.getNetwork();

    return COMPANION_V2_ADDRESS[network.chainId] || COMPANION_V2_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getOracleAddress() {
    const network = await this.getNetwork();

    return ORACLE_ADDRESS[network.chainId] || ORACLE_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getChainlinkOracleAddress() {
    const network = await this.getNetwork();

    return CHAINLINK_ORACLE_ADDRESS[network.chainId] || CHAINLINK_ORACLE_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getUniswapOracleAddress() {
    const network = await this.getNetwork();

    return UNISWAP_ORACLE_ADDRESS[network.chainId] || UNISWAP_ORACLE_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getTokenDescriptorAddress() {
    const network = await this.getNetwork();

    return TOKEN_DESCRIPTOR_ADDRESS[network.chainId] || TOKEN_DESCRIPTOR_ADDRESS[NETWORKS.optimism.chainId];
  }

  // BOOTSTRAP
  async connect(chainId: number, suppliedProvider?: Provider) {
    const provider: Provider = suppliedProvider || ((await this.modal?.requestProvider()) as Provider);

    this.providerInfo = getProviderInfo(provider);
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    const ethersProvider = new ethers.providers.Web3Provider(provider as ExternalProvider);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = ethersProvider.getSigner();

    this.apolloClient = new GraphqlService(MEAN_GRAPHQL_URL[chainId] || MEAN_GRAPHQL_URL[10]);
    const v2Client = MEAN_V2_GRAPHQL_URL[chainId] && new GraphqlService(MEAN_V2_GRAPHQL_URL[chainId]);
    this.uniClient = new GraphqlService(UNI_GRAPHQL_URL[chainId] || UNI_GRAPHQL_URL[10]);
    this.chainlinkClient = new GraphqlService(CHAINLINK_GRAPHQL_URL[chainId] || CHAINLINK_GRAPHQL_URL[1]);
    this.setClient(ethersProvider);
    this.setSigner(signer);

    const account = await this.signer.getAddress();

    provider.on('network', (newNetwork: number, oldNetwork: null | number) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network

      if (oldNetwork) {
        window.location.reload();
      }
    });

    const protocolToken = getProtocolToken(chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(chainId);

    const currentPositionsResponse = await gqlFetchAll<PositionsGraphqlResponse>(
      this.apolloClient.getClient(),
      GET_POSITIONS,
      {
        address: account.toLowerCase(),
        status: ['ACTIVE', 'COMPLETED'],
      },
      'positions',
      'network-only'
    );

    if (currentPositionsResponse.data) {
      this.currentPositions = keyBy(
        currentPositionsResponse.data.positions.map((position: PositionResponse) => ({
          from: position.from.address === wrappedProtocolToken.address ? protocolToken : position.from,
          to: position.to.address === wrappedProtocolToken.address ? protocolToken : position.to,
          user: position.user,
          swapInterval: BigNumber.from(position.swapInterval.interval),
          swapped: BigNumber.from(position.totalSwapped),
          rate: BigNumber.from(position.current.rate),
          remainingLiquidity: BigNumber.from(position.current.remainingLiquidity),
          remainingSwaps: BigNumber.from(position.current.remainingSwaps),
          withdrawn: BigNumber.from(position.totalWithdrawn),
          toWithdraw: BigNumber.from(position.current.idleSwapped),
          totalSwaps: BigNumber.from(position.totalSwaps),
          id: position.id,
          status: position.status,
          startedAt: position.createdAtTimestamp,
          executedSwaps: BigNumber.from(position.executedSwaps),
          totalDeposits: BigNumber.from(position.totalDeposits),
          pendingTransaction: '',
          pairId: position.pair.id,
          version: POSITION_VERSION_3,
        })),
        'id'
      );
    }

    if (v2Client) {
      const currentV2PositionsResponse = await gqlFetchAll<PositionsGraphqlResponse>(
        v2Client.getClient(),
        GET_POSITIONS,
        {
          address: account.toLowerCase(),
          status: ['ACTIVE', 'COMPLETED'],
        },
        'positions',
        'network-only'
      );

      if (currentV2PositionsResponse.data) {
        this.currentPositions = {
          ...this.currentPositions,
          ...keyBy(
            currentV2PositionsResponse.data.positions.map((position: PositionResponse) => ({
              from: position.from.address === wrappedProtocolToken.address ? protocolToken : position.from,
              to: position.to.address === wrappedProtocolToken.address ? protocolToken : position.to,
              user: position.user,
              swapInterval: BigNumber.from(position.swapInterval.interval),
              swapped: BigNumber.from(position.totalSwapped),
              rate: BigNumber.from(position.current.rate),
              remainingLiquidity: BigNumber.from(position.current.remainingLiquidity),
              remainingSwaps: BigNumber.from(position.current.remainingSwaps),
              withdrawn: BigNumber.from(position.totalWithdrawn),
              toWithdraw: BigNumber.from(position.current.idleSwapped),
              totalSwaps: BigNumber.from(position.totalSwaps),
              id: `${position.id}-v2`,
              status: position.status,
              startedAt: position.createdAtTimestamp,
              executedSwaps: BigNumber.from(position.executedSwaps),
              totalDeposits: BigNumber.from(position.totalDeposits),
              pendingTransaction: '',
              pairId: position.pair.id,
              version: POSITION_VERSION_2,
            })),
            'id'
          ),
        };
      }
    }

    const pastPositionsResponse = await gqlFetchAll<PositionsGraphqlResponse>(
      this.apolloClient.getClient(),
      GET_POSITIONS,
      {
        address: account.toLowerCase(),
        status: ['TERMINATED'],
      },
      'positions',
      'network-only'
    );

    if (pastPositionsResponse.data) {
      this.pastPositions = keyBy(
        pastPositionsResponse.data.positions.map((position: PositionResponse) => ({
          from: position.from.address === wrappedProtocolToken.address ? protocolToken : position.from,
          to: position.to.address === wrappedProtocolToken.address ? protocolToken : position.to,
          user: position.user,
          totalDeposits: BigNumber.from(position.totalDeposits),
          swapInterval: BigNumber.from(position.swapInterval.interval),
          swapped: BigNumber.from(position.totalSwapped),
          rate: BigNumber.from(position.current.rate),
          remainingLiquidity: BigNumber.from(position.current.remainingLiquidity),
          remainingSwaps: BigNumber.from(position.current.remainingSwaps),
          totalSwaps: BigNumber.from(position.totalSwaps),
          withdrawn: BigNumber.from(position.totalWithdrawn),
          toWithdraw: BigNumber.from(position.current.idleSwapped),
          executedSwaps: BigNumber.from(position.executedSwaps),
          id: position.id,
          status: position.status,
          startedAt: position.createdAtTimestamp,
          pendingTransaction: '',
          pairId: position.pair.id,
          version: POSITION_VERSION_3,
        })),
        'id'
      );
    }

    if (v2Client) {
      const pastPositionsV2Response = await gqlFetchAll<PositionsGraphqlResponse>(
        v2Client.getClient(),
        GET_POSITIONS,
        {
          address: account.toLowerCase(),
          status: ['TERMINATED'],
        },
        'positions',
        'network-only'
      );

      if (pastPositionsV2Response.data) {
        this.pastPositions = {
          ...this.pastPositions,
          ...keyBy(
            pastPositionsV2Response.data.positions.map((position: PositionResponse) => ({
              from: position.from.address === wrappedProtocolToken.address ? protocolToken : position.from,
              to: position.to.address === wrappedProtocolToken.address ? protocolToken : position.to,
              user: position.user,
              totalDeposits: BigNumber.from(position.totalDeposits),
              swapInterval: BigNumber.from(position.swapInterval.interval),
              swapped: BigNumber.from(position.totalSwapped),
              rate: BigNumber.from(position.current.rate),
              remainingLiquidity: BigNumber.from(position.current.remainingLiquidity),
              remainingSwaps: BigNumber.from(position.current.remainingSwaps),
              totalSwaps: BigNumber.from(position.totalSwaps),
              withdrawn: BigNumber.from(position.totalWithdrawn),
              toWithdraw: BigNumber.from(position.current.idleSwapped),
              executedSwaps: BigNumber.from(position.executedSwaps),
              id: position.id,
              status: position.status,
              startedAt: position.createdAtTimestamp,
              pendingTransaction: '',
              pairId: position.pair.id,
              version: POSITION_VERSION_2,
            })),
            'id'
          ),
        };
      }
    }

    this.setAccount(account);
  }

  async disconnect() {
    this.modal?.clearCachedProvider();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    if (this.client && (this.client as any).disconnect) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await (this.client as any).disconnect();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (this.client && (this.client as any).close) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await (this.client as any).close();
    }

    this.setAccount('');

    this.setClient(new ethers.providers.Web3Provider({}));
  }

  async setUpModal(chainId = NETWORKS.optimism.chainId) {
    let chainIdToUse = chainId;
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: '5744aff1d49f4eee923c5f3e5af4cc1c', // required
        },
      },
      // frame: {
      //   package: ethProvider as WalletConnectProvider,
      // },
      'custom-bitkeep': {
        display: {
          logo: 'data:image/png;base64,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',
          name: 'Bitkeep',
          description: 'Connect with your Bitkeep wallet',
        },
        package: injectedConnector,
        connector: injectedConnector,
      },
      authereum: {
        package: Authereum as WalletConnectProvider, // required
      },
      torus: {
        package: Torus, // required
      },
    };

    const web3Modal = new SafeAppWeb3Modal({
      cacheProvider: true, // optional
      providerOptions, // required
    });

    this.setModal(web3Modal);

    const loadedAsSafeApp = await web3Modal.isSafeApp();

    if (web3Modal.cachedProvider || loadedAsSafeApp) {
      const provider = (await this.modal?.requestProvider()) as Provider;
      const ethersProvider = new ethers.providers.Web3Provider(provider as ExternalProvider);

      const fetchedNetwork = await ethersProvider.getNetwork();

      if (SUPPORTED_NETWORKS.includes(fetchedNetwork.chainId)) {
        chainIdToUse = fetchedNetwork.chainId;
      }

      await this.connect(chainIdToUse, provider);
    }

    if (window.ethereum) {
      // handle metamask account change
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });

      // extremely recommended by metamask
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    if (!this.apolloClient.getClient() || !this.uniClient.getClient()) {
      this.apolloClient = new GraphqlService(MEAN_GRAPHQL_URL[chainIdToUse] || MEAN_GRAPHQL_URL[10]);
      this.uniClient = new GraphqlService(UNI_GRAPHQL_URL[chainIdToUse] || UNI_GRAPHQL_URL[10]);
    }

    const availablePairsResponse = await gqlFetchAll<AvailablePairsGraphqlResponse>(
      this.apolloClient.getClient(),
      GET_AVAILABLE_PAIRS,
      {},
      'pairs',
      'network-only'
    );

    if (availablePairsResponse.data) {
      this.availablePairs = await Promise.all(
        availablePairsResponse.data.pairs.map(async (pair: AvailablePairResponse) => {
          const oldestCreatedPosition =
            (pair.positions && pair.positions[0] && pair.positions[0].createdAtTimestamp) || 0;
          const lastCreatedAt =
            oldestCreatedPosition > pair.createdAtTimestamp ? oldestCreatedPosition : pair.createdAtTimestamp;
          let pairOracle;
          try {
            pairOracle = await this.getPairOracle({ tokenA: pair.tokenA.address, tokenB: pair.tokenB.address }, true);
          } catch {
            pairOracle = ORACLES.CHAINLINK;
          }

          return {
            token0: pair.tokenA,
            token1: pair.tokenB,
            lastExecutedAt: (pair.swaps && pair.swaps[0] && pair.swaps[0].executedAtTimestamp) || 0,
            id: pair.id,
            lastCreatedAt,
            swapInfo: pair.nextSwapAvailableAt,
            oracle: pairOracle,
          };
        })
      );
    }
  }

  // TOKEN METHODS
  async getUsdPrice(token: Token) {
    const network = await this.getNetwork();
    const price = await this.axiosClient.get<Record<string, { usd: number }>>(
      `https://api.coingecko.com/api/v3/simple/token_price/${
        COINGECKO_IDS[network.chainId] || COINGECKO_IDS[NETWORKS.optimism.chainId]
      }?contract_addresses=${token.address}&vs_currencies=usd`
    );

    const usdPrice = price.data[token.address] && price.data[token.address].usd;

    return usdPrice || 0;
  }

  async getUsdHistoricPrice(token: Token, date?: string) {
    const network = await this.getNetwork();
    const price = await this.axiosClient.post<{ coins: Record<string, { price: number }> }>(
      'https://coins.llama.fi/prices',
      {
        coins: [`${DEFILLAMA_IDS[network.chainId]}:${token.address}`],
        ...(date && { timestamp: parseInt(date, 10) }),
      }
    );

    const tokenPrice = price.data.coins[`${DEFILLAMA_IDS[network.chainId]}:${token.address}`].price;

    return parseUnits(tokenPrice.toString(), 18);
  }

  // ADDRESS METHODS
  async getEns(address: string) {
    let ens = null;
    try {
      const provider = ethers.getDefaultProvider('homestead', {
        infura: '5744aff1d49f4eee923c5f3e5af4cc1c',
        etherscan: '4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF',
      });
      ens = await provider.lookupAddress(address);
      // eslint-disable-next-line no-empty
    } catch {}

    return ens;
  }

  async changeNetwork(newChainId: number): Promise<void> {
    if (!window.ethereum) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${newChainId.toString(16)}` }],
      });
    } catch (switchError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (switchError.code === 4902) {
        try {
          const network = find(NETWORKS, { chainId: newChainId });

          if (network) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${newChainId.toString(16)}`,
                  chainName: network.name,
                  nativeCurrency: network.nativeCurrency,
                  rpcUrls: network.rpc,
                },
              ],
            });
          }
        } catch (addError) {
          console.error('Error adding new chain to metamask');
        }
      }
    }
  }

  getBalance(address?: string): Promise<BigNumber> {
    if (!address) return Promise.resolve(BigNumber.from(0));

    if (address === PROTOCOL_TOKEN_ADDRESS) return this.signer.getBalance();

    const ERC20Interface = new Interface(ERC20ABI);

    const erc20 = new ethers.Contract(address, ERC20Interface, this.client) as unknown as ERC20Contract;

    return erc20.balanceOf(this.getAccount());
  }

  async getAllowance(token: Token) {
    if (token.address === PROTOCOL_TOKEN_ADDRESS) {
      return Promise.resolve({ token, allowance: formatUnits(MaxUint256, 18) });
    }

    const addressToCheck = await this.getHUBAddress();

    const ERC20Interface = new Interface(ERC20ABI);

    const erc20 = new ethers.Contract(token.address, ERC20Interface, this.client) as unknown as ERC20Contract;

    const allowance = await erc20.allowance(this.getAccount(), addressToCheck);

    return {
      token,
      allowance: formatUnits(allowance, token.decimals),
    };
  }

  async approveToken(token: Token): Promise<TransactionResponse> {
    const addressToApprove = await this.getHUBAddress();

    const ERC20Interface = new Interface(ERC20ABI);

    const erc20 = new ethers.Contract(token.address, ERC20Interface, this.getSigner()) as unknown as ERC20Contract;

    return erc20.approve(addressToApprove, MaxUint256);
  }

  async getTokenQuote(from: Token, to: Token, fromAmount: BigNumber) {
    const currentNetwork = await this.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const fromToUse = from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : from;
    const toToUse = to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : to;

    const oracleAddress = await this.getOracleAddress();

    const oracleInstance = new ethers.Contract(
      oracleAddress,
      ORACLE_AGGREGATOR_ABI.abi,
      this.getSigner()
    ) as unknown as OracleContract;

    return oracleInstance.quote(fromToUse.address, fromAmount, toToUse.address);
  }

  // PAIR METHODS
  async getPairOracle(pair: { tokenA: string; tokenB: string }, isExistingPair: boolean): Promise<Oracles> {
    const currentNetwork = await this.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const [tokenA, tokenB] = sortTokensByAddress(
      pair.tokenA === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : pair.tokenA,
      pair.tokenB === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : pair.tokenB
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let provider: any = this.client;
    if (!this.client) {
      try {
        provider = ethers.getDefaultProvider(getStringNetwork(currentNetwork.name), {
          infura: '5744aff1d49f4eee923c5f3e5af4cc1c',
          etherscan: '4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF',
        });
      } catch {
        provider = await detectEthereumProvider();
      }
    }

    if (isExistingPair) {
      const oracleAddress = await this.getOracleAddress();
      const oracleInstance = new ethers.Contract(
        oracleAddress,
        ORACLE_AGGREGATOR_ABI.abi,
        provider
      ) as unknown as OracleContract;
      let oracleInUse: Oracles = ORACLES.NONE;
      try {
        oracleInUse = await oracleInstance.oracleInUse(tokenA, tokenB);
      } catch (e) {
        console.error('Error fetching oracle in use for existing pair', pair, e);
      }

      return oracleInUse;
    }

    const chainlinkOracleAddress = await this.getChainlinkOracleAddress();
    const uniswapOracleAddress = await this.getUniswapOracleAddress();
    const chainLinkOracle = new ethers.Contract(
      chainlinkOracleAddress,
      CHAINLINK_ORACLE_ABI.abi,
      provider
    ) as unknown as OracleContract;
    const uniswapOracle = new ethers.Contract(
      uniswapOracleAddress,
      UNISWAP_ORACLE_ABI.abi,
      provider
    ) as unknown as OracleContract;
    let oracleInUse: Oracles = ORACLES.NONE;
    try {
      const chainlinkSupportsPair = await chainLinkOracle.canSupportPair(tokenA, tokenB);
      if (chainlinkSupportsPair) {
        oracleInUse = ORACLES.CHAINLINK;
      } else {
        const uniswapSupportsPair = await uniswapOracle.canSupportPair(tokenA, tokenB);
        if (uniswapSupportsPair) {
          oracleInUse = ORACLES.UNISWAP;
        }
      }
    } catch (e) {
      console.error('Error fetching oracle support for pair', pair, e);
    }

    return oracleInUse;
  }

  async getNextSwapInfo(pair: { tokenA: string; tokenB: string }): Promise<GetNextSwapInfo> {
    const [tokenA, tokenB] = sortTokensByAddress(pair.tokenA, pair.tokenB);
    const currentNetwork = await this.getNetwork();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let provider: any = this.client;
    if (!this.client) {
      try {
        provider = ethers.getDefaultProvider(getStringNetwork(currentNetwork.name), {
          infura: '5744aff1d49f4eee923c5f3e5af4cc1c',
          etherscan: '4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF',
        });
      } catch {
        provider = await detectEthereumProvider();
      }
    }

    const hubAddress = await this.getHUBAddress();
    const hubContract = new ethers.Contract(hubAddress, HUB_ABI.abi, provider) as unknown as HubContract;

    const { tokens, pairIndexes } = buildSwapInput([{ tokenA, tokenB }], []);

    let swapsToPerform: SwapsToPerform[] = [];
    try {
      const nextSwapInfo = await hubContract.getNextSwapInfo(tokens, pairIndexes);

      const { pairs } = nextSwapInfo;

      const [{ intervalsInSwap }] = pairs;

      swapsToPerform = SWAP_INTERVALS_MAP.filter(
        // eslint-disable-next-line no-bitwise
        (swapInterval) => swapInterval.key & parseInt(intervalsInSwap, 16)
      ).map((swapInterval) => ({ interval: swapInterval.value.toNumber() }));
    } catch {
      console.error('Error fetching pair', pair);
    }

    return {
      swapsToPerform,
    };
  }

  async getPairLiquidity(token0: Token, token1: Token) {
    let tokenA;
    let tokenB;
    if (token0.address < token1.address) {
      tokenA = token0.address;
      tokenB = token1.address;
    } else {
      tokenA = token1.address;
      tokenB = token0.address;
    }
    const poolsWithLiquidityResponse = await gqlFetchAll<PoolsLiquidityDataGraphqlResponse>(
      this.uniClient.getClient(),
      GET_PAIR_LIQUIDITY,
      {
        tokenA,
        tokenB,
      },
      'pools'
    );

    let liquidity = 0;
    if (poolsWithLiquidityResponse.data) {
      liquidity = poolsWithLiquidityResponse.data.pools.reduce((acc: number, pool: PoolLiquidityData) => {
        pool.poolHourData.forEach((hourData) => {
          // eslint-disable-next-line no-param-reassign
          acc += parseFloat(hourData.volumeUSD);
        });

        return acc;
      }, 0);
    }

    return liquidity;
  }

  async canSupportPair(token0: Token, token1: Token) {
    const [tokenA, tokenB] = sortTokens(token0, token1);

    // if they are not connected we show everything as available
    if (!this.client) return true;

    const network = await this.getNetwork();

    const oracleAddress = await this.getOracleAddress();
    const oracleInstance = new ethers.Contract(
      oracleAddress,
      ORACLE_AGGREGATOR_ABI.abi,
      this.client
    ) as unknown as OracleContract;

    return oracleInstance.canSupportPair(
      tokenA.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(network.chainId).address : tokenA.address,
      tokenB.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(network.chainId).address : tokenB.address
    );
  }

  async getGasPrice() {
    const currentNetwork = await this.getNetwork();

    if (currentNetwork.chainId !== NETWORKS.optimism.chainId && currentNetwork.chainId !== NETWORKS.polygon.chainId)
      return BigNumber.from(0);

    if (currentNetwork.chainId === NETWORKS.optimism.chainId) {
      return this.client.getGasPrice();
    }

    if (currentNetwork.chainId === NETWORKS.polygon.chainId) {
      try {
        const polyGasResponse = await this.axiosClient.get<{
          estimatedBaseFee: number;
          standard: { maxPriorityFee: number };
        }>('https://gasstation-mainnet.matic.network/v2');

        return parseUnits(
          (polyGasResponse.data.estimatedBaseFee + polyGasResponse.data.standard.maxPriorityFee).toFixed(9).toString(),
          'gwei'
        );
      } catch {
        return BigNumber.from(0);
      }
    }

    return BigNumber.from(0);
  }

  async getL1GasPrice(data: string) {
    const currentNetwork = await this.getNetwork();

    if (currentNetwork.chainId !== NETWORKS.optimism.chainId) return BigNumber.from(0);

    const oeGasOracle = new ethers.Contract(
      OE_GAS_ORACLE_ADDRESS,
      OE_GAS_ORACLE_ABI.abi,
      this.getClient()
    ) as unknown as OEGasOracle;

    return oeGasOracle.getL1Fee(data);
  }

  async getEstimatedPairCreation(
    token0: Token,
    token1: Token,
    amountToDeposit: string,
    amountOfSwaps: string,
    swapInterval: BigNumber
  ) {
    if (!token0 || !token1) return Promise.resolve();

    const chain = await this.getNetwork();

    let tokenA = token0;
    let tokenB = token1;

    if (token0.address > token1.address) {
      tokenA = token1;
      tokenB = token0;
    }

    // check for ETH
    tokenA = tokenA.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(chain.chainId) : tokenA;
    tokenB = tokenB.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(chain.chainId) : tokenB;

    const hubAddress = await this.getHUBAddress();
    const hubInstance = new ethers.Contract(hubAddress, HUB_ABI.abi, this.getSigner());

    const weiValue = parseUnits(amountToDeposit, token0.decimals);

    return Promise.all([
      hubInstance.estimateGas.deposit(
        tokenA.address,
        tokenB.address,
        weiValue,
        BigNumber.from(amountOfSwaps),
        swapInterval,
        this.account,
        []
      ),
      this.axiosClient.get<TxPriceResponse>('https://api.txprice.com/'),
      this.axiosClient.get<CoinGeckoPriceResponse>(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum&order=market_cap_desc&per_page=1&page=1&sparkline=false'
      ),
    ]).then((promiseValues: [BigNumber, AxiosResponse<TxPriceResponse>, AxiosResponse<CoinGeckoPriceResponse>]) => {
      const [gasLimitRaw, gasPriceResponse, ethPriceResponse] = promiseValues;

      const gasLimit = BigNumber.from(gasLimitRaw);
      const gasPrice = parseUnits(
        gasPriceResponse.data.blockPrices[0].estimatedPrices[2].price.toString(),
        gasPriceResponse.data.unit
      );
      const ethPrice = ethPriceResponse.data[0].current_price;

      const gas = gasLimit.mul(gasPrice);

      return {
        gas: formatUnits(gas, 'gwei'),
        gasUsd: parseFloat(formatEther(gas)) * ethPrice,
        gasEth: gas,
      };
    });
  }

  // POSITION METHODS
  async getSignatureForPermission(
    positionId: string,
    contractAddress: string,
    permission: number,
    permissionManagerAddressProvided?: string,
    erc712Name?: string
  ) {
    const signer = this.getSigner();
    const permissionManagerAddress = permissionManagerAddressProvided || (await this.getPermissionManagerAddress());
    const signName = erc712Name || 'Mean Finance - DCA Position';
    const currentNetwork = await this.getNetwork();
    const MAX_UINT_256 = BigNumber.from('2').pow('256').sub(1);

    const permissionManagerInstance = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      signer
    ) as unknown as PermissionManagerContract;

    const [hasIncrease, hasReduce, hasWithdraw, hasTerminate] = await Promise.all([
      permissionManagerInstance.hasPermission(positionId, contractAddress, PERMISSIONS.INCREASE),
      permissionManagerInstance.hasPermission(positionId, contractAddress, PERMISSIONS.REDUCE),
      permissionManagerInstance.hasPermission(positionId, contractAddress, PERMISSIONS.WITHDRAW),
      permissionManagerInstance.hasPermission(positionId, contractAddress, PERMISSIONS.TERMINATE),
    ]);

    const defaultPermissions = [
      ...(hasIncrease ? [PERMISSIONS.INCREASE] : []),
      ...(hasReduce ? [PERMISSIONS.REDUCE] : []),
      ...(hasWithdraw ? [PERMISSIONS.WITHDRAW] : []),
      ...(hasTerminate ? [PERMISSIONS.TERMINATE] : []),
    ];

    const nextNonce = await permissionManagerInstance.nonces(await signer.getAddress());

    const PermissionSet = [
      { name: 'operator', type: 'address' },
      { name: 'permissions', type: 'uint8[]' },
    ];

    const PermissionPermit = [
      { name: 'permissions', type: 'PermissionSet[]' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];

    const permissions = [{ operator: contractAddress, permissions: [...defaultPermissions, permission] }];

    // eslint-disable-next-line no-underscore-dangle
    const rawSignature = await (signer as VoidSigner)._signTypedData(
      {
        name: signName,
        version: '1',
        chainId: currentNetwork.chainId,
        verifyingContract: permissionManagerAddress,
      },
      { PermissionSet, PermissionPermit },
      { tokenId: positionId, permissions, nonce: nextNonce, deadline: MAX_UINT_256 }
    );

    const { v, r, s } = fromRpcSig(rawSignature);

    return {
      permissions,
      deadline: MAX_UINT_256,
      v,
      r,
      s,
    };
  }

  async migratePosition(positionId: string): Promise<TransactionResponse> {
    const signer = this.getSigner();
    const migratorAddress = await this.getMigratorAddress();
    const permissionManagerV2Address = await this.getPermissionManagerV2Address();
    const hubAddress = await this.getHUBAddress();
    const hubV2Address = await this.getHUBV2Address();
    const betaMigratorInstance = new ethers.Contract(
      migratorAddress,
      MIGRATOR_ABI.abi,
      signer
    ) as unknown as BetaMigratorContract;

    const erc712Name = 'Mean Finance DCA';

    const generatedSignature = await this.getSignatureForPermission(
      positionId,
      migratorAddress,
      PERMISSIONS.TERMINATE,
      permissionManagerV2Address,
      erc712Name
    );

    return betaMigratorInstance.migrate(hubV2Address, positionId, generatedSignature, hubAddress);
  }

  async companionHasPermission(position: Position, permission: number) {
    const permissionManagerAddress =
      position.version === POSITION_VERSION_3
        ? await this.getPermissionManagerAddress()
        : await this.getPermissionManagerV2Address();
    const companionAddress =
      position.version === POSITION_VERSION_3
        ? await this.getHUBCompanionAddress()
        : await this.getHUBCompanionV2Address();

    const permissionManagerInstance = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      this.getSigner()
    ) as unknown as PermissionManagerContract;

    return permissionManagerInstance.hasPermission(position.id, companionAddress, permission);
  }

  async companionIsApproved(position: FullPosition): Promise<boolean> {
    const permissionManagerAddress = await this.getPermissionManagerAddress();
    const companionAddress = await this.getHUBCompanionAddress();

    const permissionManagerInstance = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      this.getSigner()
    ) as unknown as PermissionManagerContract;

    try {
      await permissionManagerInstance.ownerOf(position.id);
    } catch (e) {
      // hack for when the subgraph has not updated yet but the position has been terminated
      const error = e as { data?: { message?: string } };
      if (
        error &&
        error.data &&
        error.data.message &&
        error.data.message === 'execution reverted: ERC721: owner query for nonexistent token'
      )
        return true;
    }

    const [hasIncrease, hasReduce, hasWithdraw, hasTerminate] = await Promise.all([
      permissionManagerInstance.hasPermission(position.id, companionAddress, PERMISSIONS.INCREASE),
      permissionManagerInstance.hasPermission(position.id, companionAddress, PERMISSIONS.REDUCE),
      permissionManagerInstance.hasPermission(position.id, companionAddress, PERMISSIONS.WITHDRAW),
      permissionManagerInstance.hasPermission(position.id, companionAddress, PERMISSIONS.TERMINATE),
    ]);

    return hasIncrease && hasReduce && hasWithdraw && hasTerminate;
  }

  async approveCompanionForPosition(position: FullPosition): Promise<TransactionResponse> {
    const permissionManagerAddress = await this.getPermissionManagerAddress();
    const companionAddress = await this.getHUBCompanionAddress();

    const permissionManagerInstance = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      this.getSigner()
    ) as unknown as PermissionManagerContract;

    return permissionManagerInstance.modify(position.id, [
      {
        operator: companionAddress,
        permissions: [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.TERMINATE, PERMISSIONS.WITHDRAW],
      },
    ]);
  }

  async modifyPermissions(position: FullPosition, newPermissions: PositionPermission[]): Promise<TransactionResponse> {
    const permissionManagerAddress = await this.getPermissionManagerAddress();

    const permissionManagerInstance = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      this.getSigner()
    ) as unknown as PermissionManagerContract;

    return permissionManagerInstance.modify(
      position.id,
      newPermissions.map(({ permissions, operator }) => ({
        operator,
        permissions: permissions.map((permission) => PERMISSIONS[permission]),
      }))
    );
  }

  async transfer(position: FullPosition, toAddress: string): Promise<TransactionResponse> {
    const permissionManagerAddress = await this.getPermissionManagerAddress();

    const permissionManagerInstance = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      this.getSigner()
    ) as unknown as PermissionManagerContract;

    return permissionManagerInstance.transferFrom(position.user, toAddress, position.id);
  }

  async getTokenNFT(id: string): Promise<NFTData> {
    const permissionManagerAddress = await this.getPermissionManagerAddress();
    const tokenDescriptorContract = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      this.client
    ) as unknown as PermissionManagerContract;

    const tokenData = await tokenDescriptorContract.tokenURI(id);
    return JSON.parse(atob(tokenData.substring(29))) as NFTData;
  }

  async deposit(
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: BigNumber,
    frequencyValue: string
  ): Promise<TransactionResponse> {
    const token = from;

    const weiValue = parseUnits(fromValue, token.decimals);

    const amountOfSwaps = BigNumber.from(frequencyValue);
    const swapInterval = frequencyType;
    const currentNetwork = await this.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);

    if (amountOfSwaps.gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    if (from.address.toLowerCase() === PROTOCOL_TOKEN_ADDRESS.toLowerCase()) {
      const companionAddress = await this.getHUBCompanionAddress();

      const hubCompanionInstance = new ethers.Contract(
        companionAddress,
        HUB_COMPANION_ABI.abi,
        this.getSigner()
      ) as unknown as HubCompanionContract;

      return hubCompanionInstance.depositUsingProtocolToken(
        from.address === PROTOCOL_TOKEN_ADDRESS ? ETH_COMPANION_ADDRESS : from.address,
        to.address === PROTOCOL_TOKEN_ADDRESS ? ETH_COMPANION_ADDRESS : to.address,
        weiValue,
        amountOfSwaps,
        swapInterval,
        this.account,
        [],
        [],
        from.address === PROTOCOL_TOKEN_ADDRESS ? { value: weiValue } : {}
      );
    }

    const hubAddress = await this.getHUBAddress();

    const hubInstance = new ethers.Contract(hubAddress, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;

    const toToUse = to.address.toLowerCase() === PROTOCOL_TOKEN_ADDRESS.toLowerCase() ? wrappedProtocolToken : to;

    return hubInstance['deposit(address,address,uint256,uint32,uint32,address,(address,uint8[])[])'](
      from.address,
      toToUse.address,
      weiValue,
      amountOfSwaps,
      swapInterval,
      this.account,
      []
    );
  }

  async withdraw(position: Position, useProtocolToken: boolean): Promise<TransactionResponse> {
    const currentNetwork = await this.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const signer = this.getSigner();
    const companionAddress = await this.getHUBCompanionAddress();

    if (
      position.to.address !== PROTOCOL_TOKEN_ADDRESS &&
      position.to.address !== wrappedProtocolToken.address &&
      useProtocolToken
    ) {
      throw new Error('Should not call withdraw without it being protocol token');
    }

    if (!useProtocolToken) {
      const hubAddress = await this.getHUBAddress();

      const hubInstance = new ethers.Contract(hubAddress, HUB_ABI.abi, signer) as unknown as HubContract;

      return hubInstance.withdrawSwapped(position.id, this.account);
    }

    const hubCompanionInstance = new ethers.Contract(
      companionAddress,
      HUB_COMPANION_ABI.abi,
      this.getSigner()
    ) as unknown as HubCompanionContract;

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.WITHDRAW);

    if (companionHasPermission) {
      return hubCompanionInstance.withdrawSwappedUsingProtocolToken(position.id, this.account);
    }

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position.id,
      companionAddress,
      PERMISSIONS.WITHDRAW
    );

    const { data: permissionData } = await hubCompanionInstance.populateTransaction.permissionPermitProxy(
      permissions,
      position.id,
      deadline,
      v,
      r,
      s
    );

    const { data: withdrawData } = await hubCompanionInstance.populateTransaction.withdrawSwappedUsingProtocolToken(
      position.id,
      this.account
    );

    if (!permissionData || !withdrawData) {
      throw new Error('Permission or withdraw data cannot be undefined');
    }

    return hubCompanionInstance.multicall([permissionData, withdrawData]);
  }

  async terminate(position: Position, useProtocolToken: boolean): Promise<TransactionResponse> {
    const currentNetwork = await this.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const companionAddress =
      position.version === POSITION_VERSION_3
        ? await this.getHUBCompanionAddress()
        : await this.getHUBCompanionV2Address();

    if (
      position.from.address !== wrappedProtocolToken.address &&
      position.from.address !== PROTOCOL_TOKEN_ADDRESS &&
      position.to.address !== PROTOCOL_TOKEN_ADDRESS &&
      position.to.address !== wrappedProtocolToken.address &&
      useProtocolToken
    ) {
      throw new Error('Should not call terminate without it being protocol token');
    }

    if (!useProtocolToken) {
      const hubAddress =
        position.version === POSITION_VERSION_3 ? await this.getHUBAddress() : await this.getHUBV2Address();

      const hubInstance = new ethers.Contract(hubAddress, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;

      return hubInstance.terminate(position.id, this.account, this.account);
    }

    const hubCompanionInstance = new ethers.Contract(
      companionAddress,
      HUB_COMPANION_ABI.abi,
      this.getSigner()
    ) as unknown as HubCompanionContract;

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.TERMINATE);

    if (companionHasPermission) {
      if (position.to.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === wrappedProtocolToken.address) {
        return hubCompanionInstance.terminateUsingProtocolTokenAsTo(position.id, this.account, this.account);
      }
      return hubCompanionInstance.terminateUsingProtocolTokenAsFrom(position.id, this.account, this.account);
    }

    const permissionManagerAddress =
      position.version === POSITION_VERSION_3
        ? await this.getPermissionManagerAddress()
        : await this.getPermissionManagerV2Address();

    const erc712Name = position.version === POSITION_VERSION_3 ? undefined : 'Mean Finance DCA';

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position.id,
      companionAddress,
      PERMISSIONS.TERMINATE,
      permissionManagerAddress,
      erc712Name
    );

    const { data: permissionData } = await hubCompanionInstance.populateTransaction.permissionPermitProxy(
      permissions,
      position.id,
      deadline,
      v,
      r,
      s
    );

    let terminateData;
    if (position.to.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === wrappedProtocolToken.address) {
      ({ data: terminateData } = await hubCompanionInstance.populateTransaction.terminateUsingProtocolTokenAsTo(
        position.id,
        this.account,
        this.account
      ));
    } else {
      ({ data: terminateData } = await hubCompanionInstance.populateTransaction.terminateUsingProtocolTokenAsFrom(
        position.id,
        this.account,
        this.account
      ));
    }

    if (!permissionData || !terminateData) {
      throw new Error('Permission or withdraw data cannot be undefined');
    }

    return hubCompanionInstance.multicall([permissionData, terminateData]);
  }

  async addFunds(position: Position, newDeposit: string): Promise<TransactionResponse> {
    const hubAddress = await this.getHUBAddress();
    const companionAddress = await this.getHUBCompanionAddress();

    const hubInstance = new ethers.Contract(hubAddress, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;
    const hubCompanionInstance = new ethers.Contract(
      companionAddress,
      HUB_COMPANION_ABI.abi,
      this.getSigner()
    ) as unknown as HubCompanionContract;

    const newRate = parseUnits(newDeposit, position.from.decimals)
      .add(position.remainingLiquidity)
      .div(BigNumber.from(position.remainingSwaps));

    const newAmount = newRate.mul(BigNumber.from(position.remainingSwaps));
    if (newAmount.gte(position.remainingLiquidity)) {
      if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
        return hubCompanionInstance.increasePositionUsingProtocolToken(
          position.id,
          newAmount.sub(position.remainingLiquidity),
          position.remainingSwaps,
          position.from.address === PROTOCOL_TOKEN_ADDRESS ? { value: newAmount.sub(position.remainingLiquidity) } : {}
        );
      }
      return hubInstance.increasePosition(
        position.id,
        newAmount.sub(position.remainingLiquidity),
        position.remainingSwaps
      );
    }

    if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
      return hubCompanionInstance.reducePositionUsingProtocolToken(
        position.id,
        position.remainingLiquidity.sub(newAmount),
        position.remainingSwaps,
        this.account
      );
    }

    return hubInstance.reducePosition(
      position.id,
      position.remainingLiquidity.sub(newAmount),
      position.remainingSwaps,
      this.account
    );
  }

  async resetPosition(position: Position, newDeposit: string, newSwaps: string): Promise<TransactionResponse> {
    const hubAddress = await this.getHUBAddress();
    const companionAddress = await this.getHUBCompanionAddress();
    const hubInstance = new ethers.Contract(hubAddress, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;
    const hubCompanionInstance = new ethers.Contract(
      companionAddress,
      HUB_COMPANION_ABI.abi,
      this.getSigner()
    ) as unknown as HubCompanionContract;

    if (BigNumber.from(newSwaps).gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    const newRate = parseUnits(newDeposit, position.from.decimals)
      .add(position.remainingLiquidity)
      .div(BigNumber.from(newSwaps));

    const newAmount = newRate.mul(BigNumber.from(newSwaps));
    if (newAmount.gte(position.remainingLiquidity)) {
      if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
        return hubCompanionInstance.increasePositionUsingProtocolToken(
          position.id,
          newAmount.sub(position.remainingLiquidity),
          BigNumber.from(newSwaps),
          position.from.address === PROTOCOL_TOKEN_ADDRESS ? { value: newAmount.sub(position.remainingLiquidity) } : {}
        );
      }
      return hubInstance.increasePosition(
        position.id,
        newAmount.sub(position.remainingLiquidity),
        BigNumber.from(newSwaps)
      );
    }

    if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
      return hubCompanionInstance.reducePositionUsingProtocolToken(
        position.id,
        position.remainingLiquidity.sub(newAmount),
        BigNumber.from(newSwaps),
        this.account
      );
    }

    return hubInstance.reducePosition(
      position.id,
      position.remainingLiquidity.sub(newAmount),
      BigNumber.from(newSwaps),
      this.account
    );
  }

  async modifyRateAndSwaps(
    position: Position,
    newRate: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean
  ): Promise<TransactionResponse> {
    const hubAddress = await this.getHUBAddress();
    const companionAddress = await this.getHUBCompanionAddress();
    const hubInstance = new ethers.Contract(hubAddress, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;
    const currentNetwork = await this.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const hubCompanionInstance = new ethers.Contract(
      companionAddress,
      HUB_COMPANION_ABI.abi,
      this.getSigner()
    ) as unknown as HubCompanionContract;

    if (
      position.from.address !== wrappedProtocolToken.address &&
      position.from.address !== PROTOCOL_TOKEN_ADDRESS &&
      useWrappedProtocolToken
    ) {
      throw new Error('Should not call modify rate and swaps without it being protocol token');
    }

    if (BigNumber.from(newSwaps).gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    const newAmount = BigNumber.from(parseUnits(newRate, position.from.decimals)).mul(BigNumber.from(newSwaps));

    if (position.from.address !== PROTOCOL_TOKEN_ADDRESS || useWrappedProtocolToken) {
      if (newAmount.gte(position.remainingLiquidity)) {
        return hubInstance.increasePosition(
          position.id,
          newAmount.sub(position.remainingLiquidity),
          BigNumber.from(newSwaps)
        );
      }

      return hubInstance.reducePosition(
        position.id,
        position.remainingLiquidity.sub(newAmount),
        BigNumber.from(newSwaps),
        this.account
      );
    }

    if (newAmount.gte(position.remainingLiquidity)) {
      const companionHasIncrease = await this.companionHasPermission(position, PERMISSIONS.INCREASE);

      if (companionHasIncrease) {
        return hubCompanionInstance.increasePositionUsingProtocolToken(
          position.id,
          newAmount.sub(position.remainingLiquidity),
          BigNumber.from(newSwaps),
          { value: newAmount.sub(position.remainingLiquidity) }
        );
      }

      const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
        position.id,
        companionAddress,
        PERMISSIONS.INCREASE
      );

      const { data: permissionData } = await hubCompanionInstance.populateTransaction.permissionPermitProxy(
        permissions,
        position.id,
        deadline,
        v,
        r,
        s
      );

      const { data: increaseData } = await hubCompanionInstance.populateTransaction.increasePositionUsingProtocolToken(
        position.id,
        newAmount.sub(position.remainingLiquidity),
        BigNumber.from(newSwaps)
      );

      if (!permissionData || !increaseData) {
        throw new Error('Permission or increase data cannot be undefined');
      }

      return hubCompanionInstance.multicall([permissionData, increaseData], {
        value: newAmount.sub(position.remainingLiquidity),
      });
    }

    const companionHasReduce = await this.companionHasPermission(position, PERMISSIONS.REDUCE);

    if (companionHasReduce) {
      return hubCompanionInstance.reducePositionUsingProtocolToken(
        position.id,
        position.remainingLiquidity.sub(newAmount),
        BigNumber.from(newSwaps),
        this.account
      );
    }

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position.id,
      companionAddress,
      PERMISSIONS.REDUCE
    );

    const { data: permissionData } = await hubCompanionInstance.populateTransaction.permissionPermitProxy(
      permissions,
      position.id,
      deadline,
      v,
      r,
      s
    );

    const { data: reduceData } = await hubCompanionInstance.populateTransaction.reducePositionUsingProtocolToken(
      position.id,
      position.remainingLiquidity.sub(newAmount),
      BigNumber.from(newSwaps),
      this.account
    );

    if (!permissionData || !reduceData) {
      throw new Error('Permission or reduce data cannot be undefined');
    }

    return hubCompanionInstance.multicall([permissionData, reduceData]);
  }

  async removeFunds(position: Position, ammountToRemove: string): Promise<TransactionResponse> {
    const hubAddress = await this.getHUBAddress();
    const companionAddress = await this.getHUBCompanionAddress();
    const hubInstance = new ethers.Contract(hubAddress, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;
    const hubCompanionInstance = new ethers.Contract(
      companionAddress,
      HUB_COMPANION_ABI.abi,
      this.getSigner()
    ) as unknown as HubCompanionContract;

    const newSwaps = parseUnits(ammountToRemove, position.from.decimals).eq(position.remainingLiquidity)
      ? BigNumber.from(0)
      : position.remainingSwaps;

    const newRate = parseUnits(ammountToRemove, position.from.decimals).eq(position.remainingLiquidity)
      ? BigNumber.from(0)
      : position.remainingLiquidity
          .sub(parseUnits(ammountToRemove, position.from.decimals))
          .div(BigNumber.from(position.remainingSwaps));

    if (newSwaps.gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    const newAmount = newRate.mul(BigNumber.from(position.remainingSwaps));
    if (newAmount.gte(position.remainingLiquidity)) {
      if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
        return hubCompanionInstance.increasePositionUsingProtocolToken(
          position.id,
          newAmount.sub(position.remainingLiquidity),
          newSwaps,
          position.from.address === PROTOCOL_TOKEN_ADDRESS ? { value: newAmount.sub(position.remainingLiquidity) } : {}
        );
      }

      return hubInstance.increasePosition(position.id, newAmount.sub(position.remainingLiquidity), newSwaps);
    }

    if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
      return hubCompanionInstance.reducePositionUsingProtocolToken(
        position.id,
        position.remainingLiquidity.sub(newAmount),
        BigNumber.from(newSwaps),
        this.account
      );
    }

    return hubInstance.reducePosition(
      position.id,
      position.remainingLiquidity.sub(newAmount),
      BigNumber.from(newSwaps),
      this.account
    );
  }

  // TRANSACTION HANDLING
  getTransactionReceipt(txHash: string) {
    return this.client.getTransactionReceipt(txHash);
  }

  getTransaction(txHash: string) {
    return this.client.getTransaction(txHash);
  }

  waitForTransaction(txHash: string) {
    return this.client.waitForTransaction(txHash);
  }

  getBlockNumber() {
    return this.client.getBlockNumber();
  }

  onBlock(callback: (blockNumber: number) => void) {
    return this.client.on('block', callback);
  }

  removeOnBlock() {
    return this.client.off('block');
  }

  parseLog(logs: Log[], chainId: number, eventToSearch: string) {
    const hubInstance = new ethers.Contract(HUB_ADDRESS[chainId], HUB_ABI.abi, this.getSigner());

    const hubCompanionInstance = new ethers.Contract(
      COMPANION_ADDRESS[chainId],
      HUB_COMPANION_ABI.abi,
      this.getSigner()
    );

    const parsedLogs: LogDescription[] = [];
    logs.forEach((log) => {
      try {
        let parsedLog;

        if (log.address === COMPANION_ADDRESS[chainId]) {
          parsedLog = hubCompanionInstance.interface.parseLog(log);
        } else {
          parsedLog = hubInstance.interface.parseLog(log);
        }

        if (parsedLog.name === eventToSearch) {
          parsedLogs.push(parsedLog);
        }
      } catch (e) {
        console.error(e);
      }
    });

    return parsedLogs[0];
  }

  async setPendingTransaction(transaction: TransactionDetails) {
    if (
      transaction.type === TRANSACTION_TYPES.NEW_PAIR ||
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN ||
      transaction.type === TRANSACTION_TYPES.WRAP_ETHER
    )
      return;

    const typeData = transaction.typeData as TransactionPositionTypeDataOptions;
    let { id } = typeData;
    const network = await this.getNetwork();
    const protocolToken = getProtocolToken(network.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(network.chainId);
    if (transaction.type === TRANSACTION_TYPES.NEW_POSITION) {
      const newPositionTypeData = typeData as NewPositionTypeData;
      id = `pending-transaction-${transaction.hash}`;
      this.currentPositions[id] = {
        from:
          newPositionTypeData.from.address === wrappedProtocolToken.address ? protocolToken : newPositionTypeData.from,
        to: newPositionTypeData.to.address === wrappedProtocolToken.address ? protocolToken : newPositionTypeData.to,
        user: this.getAccount(),
        toWithdraw: BigNumber.from(0),
        swapInterval: BigNumber.from(newPositionTypeData.frequencyType),
        swapped: BigNumber.from(0),
        rate: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals).div(
          BigNumber.from(newPositionTypeData.frequencyValue)
        ),
        remainingLiquidity: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals),
        remainingSwaps: BigNumber.from(newPositionTypeData.frequencyValue),
        totalSwaps: BigNumber.from(newPositionTypeData.frequencyValue),
        withdrawn: BigNumber.from(0),
        executedSwaps: BigNumber.from(0),
        id,
        startedAt: newPositionTypeData.startedAt,
        totalDeposits: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals),
        pendingTransaction: '',
        status: 'ACTIVE',
        version: POSITION_VERSION_3,
      };
    }

    this.currentPositions[id].pendingTransaction = transaction.hash;
  }

  handleTransactionRejection(transaction: TransactionDetails) {
    if (
      transaction.type === TRANSACTION_TYPES.NEW_PAIR ||
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN ||
      transaction.type === TRANSACTION_TYPES.WRAP_ETHER
    )
      return;
    const typeData = transaction.typeData as TransactionPositionTypeDataOptions;
    const { id } = typeData;
    if (transaction.type === TRANSACTION_TYPES.NEW_POSITION) {
      delete this.currentPositions[`pending-transaction-${transaction.hash}`];
    } else {
      this.currentPositions[id].pendingTransaction = '';
    }
  }

  handleTransaction(transaction: TransactionDetails) {
    switch (transaction.type) {
      case TRANSACTION_TYPES.NEW_POSITION: {
        const newPositionTypeData = transaction.typeData as NewPositionTypeData;
        const newId = newPositionTypeData.id;
        if (!this.currentPositions[newId]) {
          this.currentPositions[newId] = {
            ...this.currentPositions[`pending-transaction-${transaction.hash}`],
            pendingTransaction: '',
            id: newId,
          };
        }
        delete this.currentPositions[`pending-transaction-${transaction.hash}`];
        const [token0, token1] = sortTokens(newPositionTypeData.from, newPositionTypeData.to);
        if (!find(this.availablePairs, { id: `${token0.address}-${token1.address}` })) {
          this.availablePairs.push({
            token0,
            token1,
            id: `${token0.address}-${token1.address}`,
            lastExecutedAt: 0,
            lastCreatedAt: Math.floor(Date.now() / 1000),
            swapInfo: '1',
            oracle: newPositionTypeData.oracle,
          });
        }
        break;
      }
      case TRANSACTION_TYPES.TERMINATE_POSITION: {
        const terminatePositionTypeData = transaction.typeData as TerminatePositionTypeData;
        this.pastPositions[terminatePositionTypeData.id] = {
          ...this.currentPositions[terminatePositionTypeData.id],
          toWithdraw: BigNumber.from(0),
          remainingLiquidity: BigNumber.from(0),
          remainingSwaps: BigNumber.from(0),
          pendingTransaction: '',
        };
        delete this.currentPositions[terminatePositionTypeData.id];
        break;
      }
      case TRANSACTION_TYPES.MIGRATE_POSITION: {
        const migratePositionTypeData = transaction.typeData as MigratePositionTypeData;
        this.pastPositions[migratePositionTypeData.id] = {
          ...this.currentPositions[migratePositionTypeData.id],
          pendingTransaction: '',
        };
        if (migratePositionTypeData.newId) {
          this.currentPositions[migratePositionTypeData.newId] = {
            ...this.currentPositions[migratePositionTypeData.id],
            pendingTransaction: '',
            toWithdraw: BigNumber.from(0),
            swapped: BigNumber.from(0),
            withdrawn: BigNumber.from(0),
            executedSwaps: BigNumber.from(0),
            status: 'ACTIVE',
            version: POSITION_VERSION_3,
            id: migratePositionTypeData.newId,
          };
        }
        delete this.currentPositions[migratePositionTypeData.id];
        break;
      }
      case TRANSACTION_TYPES.WITHDRAW_POSITION: {
        const withdrawPositionTypeData = transaction.typeData as WithdrawTypeData;
        this.currentPositions[withdrawPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[withdrawPositionTypeData.id].withdrawn =
          this.currentPositions[withdrawPositionTypeData.id].swapped;
        this.currentPositions[withdrawPositionTypeData.id].toWithdraw = BigNumber.from(0);
        break;
      }
      case TRANSACTION_TYPES.ADD_FUNDS_POSITION: {
        const addFundsTypeData = transaction.typeData as AddFundsTypeData;
        this.currentPositions[addFundsTypeData.id].pendingTransaction = '';
        this.currentPositions[addFundsTypeData.id].remainingLiquidity = this.currentPositions[
          addFundsTypeData.id
        ].remainingLiquidity.add(parseUnits(addFundsTypeData.newFunds, addFundsTypeData.decimals));
        this.currentPositions[addFundsTypeData.id].rate = this.currentPositions[
          addFundsTypeData.id
        ].remainingLiquidity.div(this.currentPositions[addFundsTypeData.id].remainingSwaps);
        break;
      }
      case TRANSACTION_TYPES.RESET_POSITION: {
        const resetPositionTypeData = transaction.typeData as ResetPositionTypeData;
        const resetPositionSwapDifference = BigNumber.from(resetPositionTypeData.newSwaps).lt(
          this.currentPositions[resetPositionTypeData.id].remainingSwaps
        )
          ? this.currentPositions[resetPositionTypeData.id].remainingSwaps.sub(
              BigNumber.from(resetPositionTypeData.newSwaps)
            )
          : BigNumber.from(resetPositionTypeData.newSwaps).sub(
              this.currentPositions[resetPositionTypeData.id].remainingSwaps
            );
        this.currentPositions[resetPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[resetPositionTypeData.id].remainingLiquidity = this.currentPositions[
          resetPositionTypeData.id
        ].remainingLiquidity.add(parseUnits(resetPositionTypeData.newFunds, resetPositionTypeData.decimals));
        this.currentPositions[resetPositionTypeData.id].totalSwaps = BigNumber.from(resetPositionTypeData.newSwaps).lt(
          this.currentPositions[resetPositionTypeData.id].remainingSwaps
        )
          ? this.currentPositions[resetPositionTypeData.id].totalSwaps.sub(resetPositionSwapDifference)
          : this.currentPositions[resetPositionTypeData.id].totalSwaps.add(resetPositionSwapDifference);
        this.currentPositions[resetPositionTypeData.id].remainingSwaps = this.currentPositions[
          resetPositionTypeData.id
        ].remainingSwaps.add(BigNumber.from(resetPositionTypeData.newSwaps));
        this.currentPositions[resetPositionTypeData.id].rate = this.currentPositions[
          resetPositionTypeData.id
        ].remainingLiquidity.div(this.currentPositions[resetPositionTypeData.id].remainingSwaps);
        break;
      }
      case TRANSACTION_TYPES.REMOVE_FUNDS: {
        const removeFundsTypeData = transaction.typeData as RemoveFundsTypeData;
        const removeFundsDifference = parseUnits(removeFundsTypeData.ammountToRemove, removeFundsTypeData.decimals).eq(
          this.currentPositions[removeFundsTypeData.id].remainingLiquidity
        )
          ? this.currentPositions[removeFundsTypeData.id].remainingSwaps
          : BigNumber.from(0);
        const originalRemainingLiquidity = this.currentPositions[removeFundsTypeData.id].remainingLiquidity.toString();
        this.currentPositions[removeFundsTypeData.id].pendingTransaction = '';
        this.currentPositions[removeFundsTypeData.id].totalSwaps = parseUnits(
          removeFundsTypeData.ammountToRemove,
          removeFundsTypeData.decimals
        ).eq(this.currentPositions[removeFundsTypeData.id].remainingLiquidity)
          ? this.currentPositions[removeFundsTypeData.id].totalSwaps.sub(removeFundsDifference)
          : this.currentPositions[removeFundsTypeData.id].totalSwaps;
        this.currentPositions[removeFundsTypeData.id].remainingLiquidity = this.currentPositions[
          removeFundsTypeData.id
        ].remainingLiquidity.sub(parseUnits(removeFundsTypeData.ammountToRemove, removeFundsTypeData.decimals));
        this.currentPositions[removeFundsTypeData.id].rate = this.currentPositions[
          removeFundsTypeData.id
        ].remainingLiquidity.div(this.currentPositions[removeFundsTypeData.id].remainingSwaps);
        this.currentPositions[removeFundsTypeData.id].remainingSwaps = parseUnits(
          removeFundsTypeData.ammountToRemove,
          removeFundsTypeData.decimals
        ).eq(BigNumber.from(originalRemainingLiquidity))
          ? BigNumber.from(0)
          : this.currentPositions[removeFundsTypeData.id].remainingSwaps;
        break;
      }
      case TRANSACTION_TYPES.MODIFY_SWAPS_POSITION: {
        const modifySwapsPositionTypeData = transaction.typeData as ModifySwapsPositionTypeData;
        this.currentPositions[modifySwapsPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[modifySwapsPositionTypeData.id].remainingSwaps = BigNumber.from(
          modifySwapsPositionTypeData.newSwaps
        );
        this.currentPositions[modifySwapsPositionTypeData.id].rate = this.currentPositions[
          modifySwapsPositionTypeData.id
        ].remainingLiquidity.div(this.currentPositions[modifySwapsPositionTypeData.id].remainingSwaps);
        break;
      }
      case TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION: {
        const modifyRateAndSwapsPositionTypeData = transaction.typeData as ModifyRateAndSwapsPositionTypeData;
        const modifiedRateAndSwapsSwapDifference = BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps).lt(
          this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps
        )
          ? this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps.sub(
              BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps)
            )
          : BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps).sub(
              this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps
            );
        this.currentPositions[modifyRateAndSwapsPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[modifyRateAndSwapsPositionTypeData.id].rate = parseUnits(
          modifyRateAndSwapsPositionTypeData.newRate,
          modifyRateAndSwapsPositionTypeData.decimals
        );
        this.currentPositions[modifyRateAndSwapsPositionTypeData.id].totalSwaps = BigNumber.from(
          modifyRateAndSwapsPositionTypeData.newSwaps
        ).lt(this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps)
          ? this.currentPositions[modifyRateAndSwapsPositionTypeData.id].totalSwaps.sub(
              modifiedRateAndSwapsSwapDifference
            )
          : this.currentPositions[modifyRateAndSwapsPositionTypeData.id].totalSwaps.add(
              modifiedRateAndSwapsSwapDifference
            );
        this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps = BigNumber.from(
          modifyRateAndSwapsPositionTypeData.newSwaps
        );
        this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingLiquidity = this.currentPositions[
          modifyRateAndSwapsPositionTypeData.id
        ].rate.mul(this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps);
        break;
      }
      case TRANSACTION_TYPES.TRANSFER_POSITION: {
        const transferPositionTypeData = transaction.typeData as TransferTypeData;
        delete this.currentPositions[transferPositionTypeData.id];
        break;
      }
      case TRANSACTION_TYPES.MODIFY_PERMISSIONS: {
        const modifyPermissionsTypeData = transaction.typeData as ModifyPermissionsTypeData;
        this.currentPositions[modifyPermissionsTypeData.id].pendingTransaction = '';
        break;
      }
      default:
        break;
    }
  }
}
