import { ethers, Signer, BigNumber } from 'ethers';
import { Interface } from '@ethersproject/abi';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';
import Web3Modal, { getProviderInfo, getInjectedProvider } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Authereum from 'authereum';
import Torus from '@toruslabs/torus-embed';
import values from 'lodash/values';
import orderBy from 'lodash/orderBy';
import find from 'lodash/find';
import { DateTime } from 'luxon';
import keyBy from 'lodash/keyBy';
import axios, { AxiosResponse } from 'axios';
import {
  CoinGeckoPriceResponse,
  Token,
  AvailablePairResponse,
  AvailablePairs,
  AvailablePair,
  PositionResponse,
  TransactionPositionTypeDataOptions,
  PoolResponse,
  Position,
  PositionKeyBy,
  TransactionDetails,
  NewPositionTypeData,
  TerminatePositionTypeData,
  WithdrawTypeData,
  AddFundsTypeData,
  ModifySwapsPositionTypeData,
  NewPairTypeData,
  RemoveFundsTypeData,
  TokenList,
  ResetPositionTypeData,
  ModifyRateAndSwapsPositionTypeData,
  PoolLiquidityData,
  TokenListResponse,
  GetPoolResponse,
  TxPriceResponse,
  FullPosition,
} from 'types';
import { MaxUint256 } from '@ethersproject/constants';
import { getURLFromQuery, sortTokens } from 'utils/parsing';

// GQL queries
import GET_AVAILABLE_PAIRS from 'graphql/getAvailablePairs.graphql';
import GET_TOKEN_LIST from 'graphql/getTokenList.graphql';
import GET_POOLS from 'graphql/getPool.graphql';
import GET_POSITIONS from 'graphql/getPositions.graphql';
import GET_PAIR_LIQUIDITY from 'graphql/getPairLiquidity.graphql';
import gqlFetchAll from 'utils/gqlFetchAll';
import gqlFetchAllById from 'utils/gqlFetchAllById';

// ABIS
import ERC20ABI from 'abis/erc20.json';
import WETHABI from 'abis/weth.json';
import Factory from 'abis/factory.json';
import DCAPair from 'abis/DCAPair.json';
import TokenDescriptor from 'abis/TokenDescriptor.json';

// MOCKS
import usedTokensMocks from 'mocks/usedTokens';
import { ETH, WETH } from 'mocks/tokens';
import {
  FACTORY_ADDRESS,
  FULL_DEPOSIT_TYPE,
  MEAN_GRAPHQL_URL,
  NETWORKS,
  RATE_TYPE,
  SUPPORTED_NETWORKS,
  TOKEN_LISTS,
  TRANSACTION_TYPES,
  UNI_GRAPHQL_URL,
} from 'config/constants';
import GraphqlService from './graphql';

export const TOKEN_DESCRIPTOR_ADDRESS = process.env.TOKEN_DESCRIPTOR_ADDRESS as string;

export default class Web3Service {
  client: ethers.providers.Web3Provider;
  modal: Web3Modal;
  signer: Signer;
  availablePairs: AvailablePairs;
  apolloClient: GraphqlService;
  uniClient: GraphqlService;
  account: string;
  setAccountCallback: React.Dispatch<React.SetStateAction<string>>;
  currentPositions: PositionKeyBy;
  pastPositions: PositionKeyBy;
  tokenList: TokenList;
  providerInfo: { id: string; logo: string; name: string };

  constructor(
    setAccountCallback?: React.Dispatch<React.SetStateAction<string>>,
    client?: ethers.providers.Web3Provider,
    modal?: Web3Modal
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
  }

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

  getProviderInfo() {
    return this.providerInfo;
  }

  setModal(modal: Web3Modal) {
    this.modal = modal;
  }

  getModal() {
    return this.modal;
  }

  setAccount(account: string) {
    this.account = account;
    this.setAccountCallback(account);
  }

  async connect() {
    const provider = await this.modal?.connect();

    this.providerInfo = getProviderInfo(provider);
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    const ethersProvider = new ethers.providers.Web3Provider(provider);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = ethersProvider.getSigner();

    const chain = await ethersProvider.getNetwork();

    this.apolloClient = new GraphqlService(MEAN_GRAPHQL_URL[chain.chainId] || MEAN_GRAPHQL_URL[1]);
    this.uniClient = new GraphqlService(UNI_GRAPHQL_URL[chain.chainId] || UNI_GRAPHQL_URL[1]);
    this.setClient(ethersProvider);
    this.setSigner(signer);

    const account = await this.signer.getAddress();

    provider.on('network', (newNetwork: any, oldNetwork: any) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network

      if (oldNetwork) {
        window.location.reload();
      }
    });

    const currentPositionsResponse = await gqlFetchAll(
      this.apolloClient.getClient(),
      GET_POSITIONS,
      {
        address: account.toLowerCase(),
        status: 'ACTIVE',
      },
      'positions',
      'network-only'
    );

    this.currentPositions = keyBy(
      currentPositionsResponse.data.positions.map((position: PositionResponse) => ({
        from: position.from,
        to: position.to,
        swapInterval: BigNumber.from(position.swapInterval.interval),
        swapped: BigNumber.from(position.totalSwapped),
        rate: BigNumber.from(position.current.rate),
        remainingLiquidity: BigNumber.from(position.current.remainingLiquidity),
        remainingSwaps: BigNumber.from(position.current.remainingSwaps),
        withdrawn: BigNumber.from(position.totalWithdrawn),
        totalSwaps: BigNumber.from(position.totalSwaps),
        dcaId: position.dcaId,
        id: position.id,
        status: position.status,
        startedAt: position.createdAtTimestamp,
        totalDeposits: BigNumber.from(position.totalDeposits),
        pendingTransaction: '',
        pairId: position.pair.id,
      })),
      'id'
    );

    const pastPositionsResponse = await gqlFetchAll(
      this.apolloClient.getClient(),
      GET_POSITIONS,
      {
        address: account.toLowerCase(),
        status: 'TERMINATED',
      },
      'positions',
      'network-only'
    );

    this.pastPositions = keyBy(
      pastPositionsResponse.data.positions.map((position: PositionResponse) => ({
        from: position.from,
        to: position.to,
        totalDeposits: BigNumber.from(position.totalDeposits),
        swapInterval: BigNumber.from(position.swapInterval.interval),
        swapped: BigNumber.from(position.totalSwapped),
        rate: BigNumber.from(position.current.rate),
        remainingLiquidity: BigNumber.from(position.current.remainingLiquidity),
        remainingSwaps: BigNumber.from(position.current.remainingSwaps),
        totalSwaps: BigNumber.from(position.totalSwaps),
        withdrawn: BigNumber.from(position.totalWithdrawn),
        dcaId: position.dcaId,
        id: position.id,
        status: position.status,
        startedAt: position.createdAtTimestamp,
        pedingTransaction: '',
        pairId: position.pair.id,
      })),
      'id'
    );

    this.setAccount(account);
  }

  async getNetwork() {
    if (this.client) {
      return this.client.getNetwork();
    }

    if (window.ethereum) {
      return new ethers.providers.Web3Provider(window.ethereum).getNetwork();
    }

    return Promise.resolve(NETWORKS.mainnet);
  }

  getAccount() {
    return this.account;
  }

  getSigner() {
    return this.signer;
  }

  async disconnect() {
    if (this.client && (this.client as any).disconnect) {
      await (this.client as any).disconnect();
    }

    if (this.client && (this.client as any).close) {
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
        package: Authereum, // required
      },
      torus: {
        package: Torus, // required
      },
    };

    const web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      providerOptions, // required
    });

    this.setModal(web3Modal);

    if (web3Modal.cachedProvider) {
      await this.connect();
    }

    if (window.ethereum) {
      // handle metamask account change
      window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
        window.location.reload();
      });

      // extremely recommended by metamask
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    let chain = await this.getNetwork();

    if (!this.apolloClient.getClient() || !this.uniClient.getClient()) {
      this.apolloClient = new GraphqlService(MEAN_GRAPHQL_URL[chain.chainId] || MEAN_GRAPHQL_URL[1]);
      this.uniClient = new GraphqlService(UNI_GRAPHQL_URL[chain.chainId] || UNI_GRAPHQL_URL[1]);
    }

    const availablePairsResponse = await gqlFetchAll(
      this.apolloClient.getClient(),
      GET_AVAILABLE_PAIRS,
      {},
      'pairs',
      'network-only'
    );

    this.availablePairs = availablePairsResponse.data.pairs.map((pair: AvailablePairResponse) => ({
      token0: pair.tokenA,
      token1: pair.tokenB,
      lastExecutedAt: (pair.swaps && pair.swaps[0] && pair.swaps[0].executedAtTimestamp) || 0,
      id: pair.id,
      createdAt: pair.createdAtTimestamp,
    }));

    this.tokenList = {};

    if (chain.chainId !== NETWORKS.mainnet.chainId) {
      const tokenListResponse = await gqlFetchAllById(this.uniClient.getClient(), GET_TOKEN_LIST, {}, 'pools');

      const mockedTokens: Record<string, Record<string, number>> = {
        USDC: {},
        WETH: {},
        UNI: {},
        DAI: {},
        YFI: {},
      };
      this.tokenList = tokenListResponse.data.pools.reduce(
        (acc: TokenList, pool: PoolResponse) => {
          if (pool.token0.symbol === 'USDC') {
            if (!mockedTokens.USDC[pool.token0.id]) {
              mockedTokens.USDC[pool.token0.id] = 1;
            } else {
              mockedTokens.USDC[pool.token0.id] = mockedTokens.USDC[pool.token0.id] + 1;
            }
          }
          if (pool.token0.symbol === 'WETH') {
            if (!mockedTokens.WETH[pool.token0.id]) {
              mockedTokens.WETH[pool.token0.id] = 1;
            } else {
              mockedTokens.WETH[pool.token0.id] = mockedTokens.WETH[pool.token0.id] + 1;
            }
          }
          if (pool.token0.symbol === 'UNI') {
            if (!mockedTokens.UNI[pool.token0.id]) {
              mockedTokens.UNI[pool.token0.id] = 1;
            } else {
              mockedTokens.UNI[pool.token0.id] = mockedTokens.UNI[pool.token0.id] + 1;
            }
          }
          if (pool.token0.symbol === 'DAI') {
            if (!mockedTokens.DAI[pool.token0.id]) {
              mockedTokens.DAI[pool.token0.id] = 1;
            } else {
              mockedTokens.DAI[pool.token0.id] = mockedTokens.DAI[pool.token0.id] + 1;
            }
          }
          if (pool.token0.symbol === 'YFI') {
            if (!mockedTokens.YFI[pool.token0.id]) {
              mockedTokens.YFI[pool.token0.id] = 1;
            } else {
              mockedTokens.YFI[pool.token0.id] = mockedTokens.YFI[pool.token0.id] + 1;
            }
          }
          if (pool.token1.symbol === 'USDC') {
            if (!mockedTokens.USDC[pool.token1.id]) {
              mockedTokens.USDC[pool.token1.id] = 1;
            } else {
              mockedTokens.USDC[pool.token1.id] = mockedTokens.USDC[pool.token1.id] + 1;
            }
          }
          if (pool.token1.symbol === 'WETH') {
            if (!mockedTokens.WETH[pool.token1.id]) {
              mockedTokens.WETH[pool.token1.id] = 1;
            } else {
              mockedTokens.WETH[pool.token1.id] = mockedTokens.WETH[pool.token1.id] + 1;
            }
          }
          if (pool.token1.symbol === 'UNI') {
            if (!mockedTokens.UNI[pool.token1.id]) {
              mockedTokens.UNI[pool.token1.id] = 1;
            } else {
              mockedTokens.UNI[pool.token1.id] = mockedTokens.UNI[pool.token1.id] + 1;
            }
          }
          if (pool.token1.symbol === 'DAI') {
            if (!mockedTokens.DAI[pool.token1.id]) {
              mockedTokens.DAI[pool.token1.id] = 1;
            } else {
              mockedTokens.DAI[pool.token1.id] = mockedTokens.DAI[pool.token1.id] + 1;
            }
          }
          if (pool.token1.symbol === 'YFI') {
            if (!mockedTokens.YFI[pool.token1.id]) {
              mockedTokens.YFI[pool.token1.id] = 1;
            } else {
              mockedTokens.YFI[pool.token1.id] = mockedTokens.YFI[pool.token1.id] + 1;
            }
          }

          if (!acc[pool.token0.id]) {
            acc[pool.token0.id] = {
              decimals: BigNumber.from(pool.token0.decimals).toNumber(),
              address: pool.token0.id,
              name: pool.token0.name,
              symbol: pool.token0.symbol,
              chainId: (SUPPORTED_NETWORKS[chain.chainId] && chain.chainId) || NETWORKS.mainnet.chainId,
            };
          }
          if (!acc[pool.token1.id]) {
            acc[pool.token1.id] = {
              decimals: BigNumber.from(pool.token1.decimals).toNumber(),
              address: pool.token1.id,
              name: pool.token1.name,
              symbol: pool.token1.symbol,
              chainId: (SUPPORTED_NETWORKS[chain.chainId] && chain.chainId) || NETWORKS.mainnet.chainId,
            };
          }

          if (pool.token0.id === WETH(chain.chainId).address) {
            acc = {
              ...acc,
              [ETH.address]: {
                ...acc[ETH.address],
              },
            };
          } else if (pool.token1.id === WETH(chain.chainId).address) {
            acc = {
              ...acc,
              [ETH.address]: {
                ...acc[ETH.address],
              },
            };
          }

          return {
            ...acc,
            [pool.token0.id]: {
              ...acc[pool.token0.id],
            },
            [pool.token1.id]: {
              ...acc[pool.token1.id],
            },
          };
        },
        { [ETH.address]: ETH, [WETH(chain.chainId).address]: WETH(chain.chainId) }
      );
    }
  }

  changeNetwork(newChainId: number) {
    if (!window.ethereum) {
      return;
    }

    return window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${newChainId.toString(16)}` }],
    });
  }

  getBalance(address?: string, decimals?: number) {
    if (!address) return Promise.resolve();

    if (address === ETH.address) return this.signer.getBalance();

    const ERC20Interface = new Interface(ERC20ABI) as any;

    const erc20 = new ethers.Contract(address, ERC20Interface, this.client);

    return erc20.balanceOf(this.getAccount());
  }

  async getEstimatedPairCreation(token0?: string, token1?: string) {
    if (!token0 || !token1) return Promise.resolve();

    const chain = await this.getNetwork();

    let tokenA = token0;
    let tokenB = token1;

    if (token0 > token1) {
      tokenA = token1;
      tokenB = token0;
    }

    // check for ETH
    tokenA = tokenA === ETH.address ? WETH(chain.chainId).address : tokenA;
    tokenB = tokenB === ETH.address ? WETH(chain.chainId).address : tokenB;

    const factory = new ethers.Contract(FACTORY_ADDRESS, Factory.abi, this.getSigner());

    return Promise.all([
      factory.estimateGas.createPair(tokenA, tokenB),
      axios.get<TxPriceResponse>('https://api.txprice.com/'),
      axios.get<CoinGeckoPriceResponse>(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum&order=market_cap_desc&per_page=1&page=1&sparkline=false'
      ),
    ]).then((values: [BigNumber, AxiosResponse<TxPriceResponse>, AxiosResponse<CoinGeckoPriceResponse>]) => {
      const [gasLimitRaw, gasPriceResponse, ethPriceResponse] = values;

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

  async createPair(token0: string, token1: string) {
    if (!token0 || !token1) return Promise.resolve();

    const chain = await this.getNetwork();

    let tokenA = token0;
    let tokenB = token1;

    if (token0 > token1) {
      tokenA = token1;
      tokenB = token0;
    }

    // check for ETH
    tokenA = tokenA === ETH.address ? WETH(chain.chainId).address : tokenA;
    tokenB = tokenB === ETH.address ? WETH(chain.chainId).address : tokenB;

    const factory = new ethers.Contract(FACTORY_ADDRESS, Factory.abi, this.getSigner());

    return factory.createPair(tokenA, tokenB);
  }

  async getTokenNFT(dcaId: string, pairAddress: string) {
    const pairAddressContract = new ethers.Contract(pairAddress, DCAPair.abi, this.client);

    const tokenData = await pairAddressContract.tokenURI(dcaId);
    return JSON.parse(atob(tokenData.substring(29)));
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
    return axios.get(
      `https://api.ethplorer.io/getAddressInfo/${this.getAccount()}?apiKey=${[process.env.ETHPLORER_KEY]}`
    );
  }

  async wrapETH(amount: string) {
    const ERC20Interface = new Interface(WETHABI) as any;

    const chain = await this.getNetwork();

    const erc20 = new ethers.Contract(WETH(chain.chainId).address, ERC20Interface, this.getSigner());

    return erc20.deposit({ value: parseUnits(amount, ETH.decimals).toHexString() });
  }

  async getAllowance(token: Token, pairContract: AvailablePair) {
    const ERC20Interface = new Interface(ERC20ABI) as any;

    const chain = await this.getNetwork();

    const erc20 = new ethers.Contract(
      token.address === ETH.address ? WETH(chain.chainId).address : token.address,
      ERC20Interface,
      this.client
    );

    return erc20
      .allowance(this.getAccount(), pairContract.id)
      .then((allowance: string) => ({ token, allowance: formatUnits(allowance, token.decimals) }));
  }

  async approveToken(token: Token, pairContract: AvailablePair) {
    const ERC20Interface = new Interface(ERC20ABI) as any;

    const chain = await this.getNetwork();

    const erc20 = new ethers.Contract(
      token.address === ETH.address ? WETH(chain.chainId).address : token.address,
      ERC20Interface,
      this.getSigner()
    );

    return erc20.approve(pairContract.id, MaxUint256);
  }

  async deposit(
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: BigNumber,
    frequencyValue: string,
    existingPair: AvailablePair
  ) {
    let token = from;

    const chain = await this.getNetwork();

    const weiValue = parseUnits(fromValue, token.decimals);

    const rate = weiValue.div(BigNumber.from(frequencyValue));
    const amountOfSwaps = BigNumber.from(frequencyValue);
    const swapInterval = frequencyType;

    const factory = new ethers.Contract(existingPair.id, DCAPair.abi, this.getSigner());

    return factory.deposit(
      token.address === ETH.address ? WETH(chain.chainId).address : token.address,
      rate,
      amountOfSwaps,
      swapInterval
    );
  }

  withdraw(position: Position, pair: AvailablePair) {
    const factory = new ethers.Contract(pair.id, DCAPair.abi, this.getSigner());

    return factory.withdrawSwapped(position.dcaId);
  }

  terminate(position: Position, pair: AvailablePair) {
    const factory = new ethers.Contract(pair.id, DCAPair.abi, this.getSigner());

    return factory.terminate(position.dcaId);
  }

  addFunds(position: Position, pair: AvailablePair, newDeposit: string) {
    const factory = new ethers.Contract(pair.id, DCAPair.abi, this.getSigner());

    const newRate = parseUnits(newDeposit, position.from.decimals)
      .add(position.remainingLiquidity)
      .div(BigNumber.from(position.remainingSwaps));

    return factory.modifyRateAndSwaps(position.dcaId, newRate, position.remainingSwaps);
  }

  resetPosition(position: Position, pair: AvailablePair, newDeposit: string, newSwaps: string) {
    const factory = new ethers.Contract(pair.id, DCAPair.abi, this.getSigner());

    const newRate = parseUnits(newDeposit, position.from.decimals)
      .add(position.remainingLiquidity)
      .div(BigNumber.from(newSwaps));

    return factory.modifyRateAndSwaps(position.dcaId, newRate, newSwaps);
  }

  modifySwaps(position: Position, pair: AvailablePair, newSwaps: string) {
    const factory = new ethers.Contract(pair.id, DCAPair.abi, this.getSigner());

    const newRate = position.remainingLiquidity.div(BigNumber.from(newSwaps));

    return factory.modifyRateAndSwaps(position.dcaId, newRate, newSwaps);
  }

  modifyRate(position: Position, pair: AvailablePair, newRate: string) {
    const factory = new ethers.Contract(pair.id, DCAPair.abi, this.getSigner());

    return factory.modifyRateAndSwaps(
      position.dcaId,
      parseUnits(newRate, position.from.decimals),
      position.remainingSwaps
    );
  }

  modifyRateAndSwaps(position: Position, pair: Pick<AvailablePair, 'id'>, newRate: string, newSwaps: string) {
    const factory = new ethers.Contract(pair.id, DCAPair.abi, this.getSigner());

    return factory.modifyRateAndSwaps(position.dcaId, parseUnits(newRate, position.from.decimals), newSwaps);
  }

  removeFunds(position: Position, pair: AvailablePair, ammountToRemove: string) {
    const factory = new ethers.Contract(pair.id, DCAPair.abi, this.getSigner());

    const newRate = parseUnits(ammountToRemove, position.from.decimals).eq(position.remainingLiquidity)
      ? position.rate
      : position.remainingLiquidity
          .sub(parseUnits(ammountToRemove, position.from.decimals))
          .div(BigNumber.from(position.remainingSwaps));

    return factory.modifyRateAndSwaps(
      position.dcaId,
      newRate,
      parseUnits(ammountToRemove, position.from.decimals).eq(position.remainingLiquidity) ? 0 : position.remainingSwaps
    );
  }

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

  setPendingTransaction(transaction: TransactionDetails) {
    if (
      transaction.type === TRANSACTION_TYPES.NEW_PAIR ||
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN ||
      transaction.type === TRANSACTION_TYPES.WRAP_ETHER
    )
      return;

    const typeData = transaction.typeData as TransactionPositionTypeDataOptions;
    let id = typeData.id;
    if (transaction.type === TRANSACTION_TYPES.NEW_POSITION) {
      const newPositionTypeData = typeData as NewPositionTypeData;
      id = `pending-transaction-${transaction.hash}`;
      this.currentPositions[id] = {
        from: newPositionTypeData.from,
        to: newPositionTypeData.to,
        pairId: newPositionTypeData.existingPair.id,
        swapInterval: BigNumber.from(newPositionTypeData.frequencyType),
        swapped: BigNumber.from(0),
        rate: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals).div(
          BigNumber.from(newPositionTypeData.frequencyValue)
        ),
        remainingLiquidity: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals),
        remainingSwaps: BigNumber.from(newPositionTypeData.frequencyValue),
        totalSwaps: BigNumber.from(newPositionTypeData.frequencyValue),
        withdrawn: BigNumber.from(0),
        dcaId: newPositionTypeData.id,
        id: id,
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
    const id = typeData.id;
    if (transaction.type === TRANSACTION_TYPES.NEW_POSITION) {
      delete this.currentPositions[`pending-transaction-${transaction.hash}`];
    } else {
      this.currentPositions[id].pendingTransaction = '';
    }
  }

  handleTransaction(transaction: TransactionDetails) {
    switch (transaction.type) {
      case TRANSACTION_TYPES.NEW_POSITION:
        const newPositionTypeData = transaction.typeData as NewPositionTypeData;
        const newId = `${newPositionTypeData.existingPair.id}-${newPositionTypeData.id}`;
        if (!this.currentPositions[newId]) {
          this.currentPositions[newId] = {
            ...this.currentPositions[`pending-transaction-${transaction.hash}`],
            pendingTransaction: '',
            dcaId: newPositionTypeData.id,
            id: newId,
          };
        }
        delete this.currentPositions[`pending-transaction-${transaction.hash}`];
        break;
      case TRANSACTION_TYPES.TERMINATE_POSITION:
        const terminatePositionTypeData = transaction.typeData as TerminatePositionTypeData;
        this.pastPositions[terminatePositionTypeData.id] = {
          ...this.currentPositions[terminatePositionTypeData.id],
          pendingTransaction: '',
        };
        delete this.currentPositions[terminatePositionTypeData.id];
        break;
      case TRANSACTION_TYPES.WITHDRAW_POSITION:
        const withdrawPositionTypeData = transaction.typeData as WithdrawTypeData;
        this.currentPositions[withdrawPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[withdrawPositionTypeData.id].withdrawn =
          this.currentPositions[withdrawPositionTypeData.id].swapped;
        break;
      case TRANSACTION_TYPES.ADD_FUNDS_POSITION:
        const addFundsTypeData = transaction.typeData as AddFundsTypeData;
        this.currentPositions[addFundsTypeData.id].pendingTransaction = '';
        this.currentPositions[addFundsTypeData.id].remainingLiquidity = this.currentPositions[
          addFundsTypeData.id
        ].remainingLiquidity.add(parseUnits(addFundsTypeData.newFunds, addFundsTypeData.decimals));
        this.currentPositions[addFundsTypeData.id].rate = this.currentPositions[
          addFundsTypeData.id
        ].remainingLiquidity.div(this.currentPositions[addFundsTypeData.id].remainingSwaps);
        break;
      case TRANSACTION_TYPES.RESET_POSITION:
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
      case TRANSACTION_TYPES.REMOVE_FUNDS:
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
      case TRANSACTION_TYPES.MODIFY_SWAPS_POSITION:
        const modifySwapsPositionTypeData = transaction.typeData as ModifySwapsPositionTypeData;
        this.currentPositions[modifySwapsPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[modifySwapsPositionTypeData.id].remainingSwaps = BigNumber.from(
          modifySwapsPositionTypeData.newSwaps
        );
        this.currentPositions[modifySwapsPositionTypeData.id].rate = this.currentPositions[
          modifySwapsPositionTypeData.id
        ].remainingLiquidity.div(this.currentPositions[modifySwapsPositionTypeData.id].remainingSwaps);
        break;
      case TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION:
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
      case TRANSACTION_TYPES.NEW_PAIR:
        const newPairTypeData = transaction.typeData as NewPairTypeData;
        const [token0, token1] = sortTokens(newPairTypeData.token0, newPairTypeData.token1);
        this.availablePairs.push({
          token0,
          token1,
          id: newPairTypeData.id as string,
          lastExecutedAt: 0,
          createdAt: Math.floor(Date.now() / 1000),
        });
        break;
    }
  }

  parseLog(log: any, pairContract: AvailablePair) {
    const factory = new ethers.Contract(pairContract.id, DCAPair.abi, this.getSigner());

    return factory.interface.parseLog(log);
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
    const poolsWithLiquidityResponse = await gqlFetchAll(
      this.uniClient.getClient(),
      GET_PAIR_LIQUIDITY,
      {
        tokenA,
        tokenB,
      },
      'pools'
    );

    const liquidity: number = poolsWithLiquidityResponse.data.pools.reduce((acc: number, pool: PoolLiquidityData) => {
      pool.poolDayData.forEach((dayData) => (acc += parseFloat(dayData.volumeUSD)));

      return acc;
    }, 0);

    return liquidity;
  }

  async hasPool(token0: Token, token1: Token) {
    const [tokenA, tokenB] = sortTokens(token0, token1);

    // if they are not connected we show everything as available
    if (!this.client) return true;

    const chain = await this.client.getNetwork();

    const poolsData = await this.uniClient.getClient().query<GetPoolResponse>({
      query: GET_POOLS,
      variables: {
        tokenA: tokenA.address === ETH.address ? WETH(chain.chainId).address : tokenA.address,
        tokenB: tokenB.address === ETH.address ? WETH(chain.chainId).address : tokenB.address,
      },
    });

    const {
      data: { pools },
    } = poolsData;

    return !!pools.length;
  }
}
