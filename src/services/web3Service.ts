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
import axios, { AxiosResponse } from 'axios';
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
import BETA_MIGRATOR_ABI from 'abis/BetaMigrator.json';
import OE_GAS_ORACLE_ABI from 'abis/OEGasOracle.json';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, ETH_COMPANION_ADDRESS, getWrappedProtocolToken, getProtocolToken } from 'mocks/tokens';
import {
  BETA_MIGRATOR_ADDRESS,
  CHAINLINK_GRAPHQL_URL,
  CHAINLINK_ORACLE_ADDRESS,
  COINGECKO_IDS,
  COMPANION_ADDRESS,
  HUB_ADDRESS,
  MAX_UINT_32,
  MEAN_GRAPHQL_URL,
  NETWORKS,
  OE_GAS_ORACLE_ADDRESS,
  ORACLES,
  ORACLE_ADDRESS,
  PERMISSIONS,
  PERMISSION_MANAGER_ADDRESS,
  SWAP_INTERVALS,
  SWAP_INTERVALS_MAP,
  TOKEN_DESCRIPTOR_ADDRESS,
  TRANSACTION_TYPES,
  UNISWAP_ORACLE_ADDRESS,
  UNI_GRAPHQL_URL,
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
import { axiosClient } from 'state';
import { fromRpcSig } from 'ethereumjs-util';
import GraphqlService from './graphql';

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
    return axios.get<GetUsedTokensData>(
      `https://api.ethplorer.io/getAddressInfo/${this.getAccount()}?apiKey=${process.env.ETHPLORER_KEY || ''}`
    );
  }

  // ADDRESSES
  async getHUBAddress() {
    const network = await this.getNetwork();

    return HUB_ADDRESS[network.chainId] || HUB_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getPermissionManagerAddress() {
    const network = await this.getNetwork();

    return PERMISSION_MANAGER_ADDRESS[network.chainId] || PERMISSION_MANAGER_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getBetaMigratorAddress() {
    const network = await this.getNetwork();

    return BETA_MIGRATOR_ADDRESS[network.chainId] || BETA_MIGRATOR_ADDRESS[NETWORKS.optimism.chainId];
  }

  async getHUBCompanionAddress() {
    const network = await this.getNetwork();

    return COMPANION_ADDRESS[network.chainId] || COMPANION_ADDRESS[NETWORKS.optimism.chainId];
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
  async connect() {
    const provider: Provider = (await this.modal?.requestProvider()) as Provider;

    this.providerInfo = getProviderInfo(provider);
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    const ethersProvider = new ethers.providers.Web3Provider(provider as ExternalProvider);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = ethersProvider.getSigner();

    const chain = await ethersProvider.getNetwork();

    this.apolloClient = new GraphqlService(MEAN_GRAPHQL_URL[chain.chainId] || MEAN_GRAPHQL_URL[10]);
    this.uniClient = new GraphqlService(UNI_GRAPHQL_URL[chain.chainId] || UNI_GRAPHQL_URL[10]);
    this.chainlinkClient = new GraphqlService(CHAINLINK_GRAPHQL_URL[chain.chainId] || CHAINLINK_GRAPHQL_URL[1]);
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

    const network = await this.getNetwork();
    const protocolToken = getProtocolToken(network.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(network.chainId);

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
        })),
        'id'
      );
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
        })),
        'id'
      );
    }

    this.setAccount(account);
  }

  async disconnect() {
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

    this.modal?.clearCachedProvider();

    this.setAccount('');

    this.setClient(new ethers.providers.Web3Provider({}));
  }

  async setUpModal() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: '5744aff1d49f4eee923c5f3e5af4cc1c', // required
        },
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
      await this.connect();
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

    const chain = await this.getNetwork();

    if (!this.apolloClient.getClient() || !this.uniClient.getClient()) {
      this.apolloClient = new GraphqlService(MEAN_GRAPHQL_URL[chain.chainId] || MEAN_GRAPHQL_URL[10]);
      this.uniClient = new GraphqlService(UNI_GRAPHQL_URL[chain.chainId] || UNI_GRAPHQL_URL[10]);
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
    const price = await axiosClient.get<Record<string, { usd: number }>>(
      `https://api.coingecko.com/api/v3/simple/token_price/${
        COINGECKO_IDS[network.chainId] || COINGECKO_IDS[NETWORKS.optimism.chainId]
      }?contract_addresses=${token.address}&vs_currencies=usd`
    );

    return price.data[token.address].usd;
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

  // PAIR METHODS
  async getPairOracle(pair: { tokenA: string; tokenB: string }, isExistingPair: boolean): Promise<Oracles> {
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
        const polyGasResponse = await axios.get<{ estimatedBaseFee: number; standard: { maxPriorityFee: number } }>(
          'https://gasstation-mainnet.matic.network/v2'
        );

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
      axios.get<TxPriceResponse>('https://api.txprice.com/'),
      axios.get<CoinGeckoPriceResponse>(
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
  async getSignatureForPermission(positionId: string, contractAddress: string, permission: number) {
    const signer = this.getSigner();
    const permissionManagerAddress = await this.getPermissionManagerAddress();
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
        name: 'Mean Finance DCA',
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
    const betaMigratorAddress = await this.getBetaMigratorAddress();

    const betaMigratorInstance = new ethers.Contract(
      betaMigratorAddress,
      BETA_MIGRATOR_ABI.abi,
      signer
    ) as unknown as BetaMigratorContract;

    const generatedSignature = await this.getSignatureForPermission(
      positionId,
      betaMigratorAddress,
      PERMISSIONS.TERMINATE
    );

    return betaMigratorInstance.migrate(positionId, generatedSignature);
  }

  async companionHasPermission(positionId: string, permission: number) {
    const permissionManagerAddress = await this.getPermissionManagerAddress();
    const companionAddress = await this.getHUBCompanionAddress();

    const permissionManagerInstance = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      this.getSigner()
    ) as unknown as PermissionManagerContract;

    return permissionManagerInstance.hasPermission(positionId, companionAddress, permission);
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

    const companionHasPermission = await this.companionHasPermission(position.id, PERMISSIONS.WITHDRAW);

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
    const companionAddress = await this.getHUBCompanionAddress();

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
      const hubAddress = await this.getHUBAddress();

      const hubInstance = new ethers.Contract(hubAddress, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;

      return hubInstance.terminate(position.id, this.account, this.account);
    }

    const hubCompanionInstance = new ethers.Contract(
      companionAddress,
      HUB_COMPANION_ABI.abi,
      this.getSigner()
    ) as unknown as HubCompanionContract;

    const companionHasPermission = await this.companionHasPermission(position.id, PERMISSIONS.TERMINATE);

    if (companionHasPermission) {
      if (position.to.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === wrappedProtocolToken.address) {
        return hubCompanionInstance.terminateUsingProtocolTokenAsTo(position.id, this.account, this.account);
      }
      return hubCompanionInstance.terminateUsingProtocolTokenAsFrom(position.id, this.account, this.account);
    }

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position.id,
      companionAddress,
      PERMISSIONS.TERMINATE
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
      const companionHasIncrease = await this.companionHasPermission(position.id, PERMISSIONS.INCREASE);

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

    const companionHasReduce = await this.companionHasPermission(position.id, PERMISSIONS.REDUCE);

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
          pendingTransaction: '',
        };
        delete this.currentPositions[terminatePositionTypeData.id];
        break;
      }
      case TRANSACTION_TYPES.MIGRATE_POSITION: {
        const terminatePositionTypeData = transaction.typeData as MigratePositionTypeData;
        this.pastPositions[terminatePositionTypeData.id] = {
          ...this.currentPositions[terminatePositionTypeData.id],
          pendingTransaction: '',
        };
        delete this.currentPositions[terminatePositionTypeData.id];
        break;
      }
      case TRANSACTION_TYPES.WITHDRAW_POSITION: {
        const withdrawPositionTypeData = transaction.typeData as WithdrawTypeData;
        this.currentPositions[withdrawPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[withdrawPositionTypeData.id].withdrawn =
          this.currentPositions[withdrawPositionTypeData.id].swapped;
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
