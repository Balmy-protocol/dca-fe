import { ethers, Signer, BigNumber } from 'ethers';
import { Interface } from '@ethersproject/abi';
import {
  ExternalProvider,
  Log,
  Provider,
  TransactionResponse,
  getNetwork as getStringNetwork,
} from '@ethersproject/providers';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';
import Web3Modal, { getProviderInfo, getInjectedProvider } from 'web3modal';
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
  NewPairTypeData,
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
import WETHABI from 'abis/weth.json';
import ORACLE_AGGREGATOR_ABI from 'abis/OracleAggregator.json';
import HUB_ABI from 'abis/Hub.json';

// MOCKS
import { ETH, WETH } from 'mocks/tokens';
import {
  HUB_ADDRESS,
  MEAN_GRAPHQL_URL,
  NETWORKS,
  ORACLE_ADDRESS,
  SWAP_INTERVALS_MAP,
  TRANSACTION_TYPES,
  UNI_GRAPHQL_URL,
} from 'config/constants';
import { ERC20Contract, HubContract, OracleContract } from 'types/contracts';
import GraphqlService from './graphql';

export const TOKEN_DESCRIPTOR_ADDRESS = process.env.TOKEN_DESCRIPTOR_ADDRESS as string;

export default class Web3Service {
  client: ethers.providers.Web3Provider;

  modal: SafeAppWeb3Modal;

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

    return Promise.resolve(NETWORKS.mainnet);
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

    this.apolloClient = new GraphqlService(MEAN_GRAPHQL_URL[chain.chainId] || MEAN_GRAPHQL_URL[1]);
    this.uniClient = new GraphqlService(UNI_GRAPHQL_URL[chain.chainId] || UNI_GRAPHQL_URL[1]);
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

    const currentPositionsResponse = await gqlFetchAll<PositionsGraphqlResponse>(
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
        toWithdraw: BigNumber.from(position.current.idleSwapped),
        totalSwaps: BigNumber.from(position.totalSwaps),
        id: position.id,
        status: position.status,
        startedAt: position.createdAtTimestamp,
        totalDeposits: BigNumber.from(position.totalDeposits),
        pendingTransaction: '',
        pairId: position.pair.id,
      })),
      'id'
    );

    const pastPositionsResponse = await gqlFetchAll<PositionsGraphqlResponse>(
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
        toWithdraw: BigNumber.from(position.current.idleSwapped),
        id: position.id,
        status: position.status,
        startedAt: position.createdAtTimestamp,
        pendingTransaction: '',
        pairId: position.pair.id,
      })),
      'id'
    );

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
      this.apolloClient = new GraphqlService(MEAN_GRAPHQL_URL[chain.chainId] || MEAN_GRAPHQL_URL[1]);
      this.uniClient = new GraphqlService(UNI_GRAPHQL_URL[chain.chainId] || UNI_GRAPHQL_URL[1]);
    }

    const availablePairsResponse = await gqlFetchAll<AvailablePairsGraphqlResponse>(
      this.apolloClient.getClient(),
      GET_AVAILABLE_PAIRS,
      {},
      'pairs',
      'network-only'
    );

    this.availablePairs = await Promise.all(
      availablePairsResponse.data.pairs.map(async (pair: AvailablePairResponse) => ({
        token0: pair.tokenA,
        token1: pair.tokenB,
        lastExecutedAt: (pair.swaps && pair.swaps[0] && pair.swaps[0].executedAtTimestamp) || 0,
        id: pair.id,
        createdAt: pair.createdAtTimestamp,
        swapInfo: await this.getNextSwapInfo({ tokenA: pair.tokenA.address, tokenB: pair.tokenB.address }),
      }))
    );
  }

  // ADDRESS METHODS
  changeNetwork(newChainId: number): void {
    if (!window.ethereum) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${newChainId.toString(16)}` }],
    });
  }

  getBalance(address?: string): Promise<BigNumber> {
    if (!address) return Promise.resolve(BigNumber.from(0));

    if (address === ETH.address) return this.signer.getBalance();

    const ERC20Interface = new Interface(ERC20ABI);

    const erc20 = new ethers.Contract(address, ERC20Interface, this.client) as unknown as ERC20Contract;

    return erc20.balanceOf(this.getAccount());
  }

  async wrapETH(amount: string): Promise<TransactionResponse> {
    const ERC20Interface = new Interface(WETHABI);

    const chain = await this.getNetwork();

    const erc20 = new ethers.Contract(
      WETH(chain.chainId).address,
      ERC20Interface,
      this.getSigner()
    ) as unknown as ERC20Contract;

    return erc20.deposit({ value: parseUnits(amount, ETH.decimals).toHexString() });
  }

  async getAllowance(token: Token) {
    const ERC20Interface = new Interface(ERC20ABI);

    const chain = await this.getNetwork();

    const erc20 = new ethers.Contract(
      token.address === ETH.address ? WETH(chain.chainId).address : token.address,
      ERC20Interface,
      this.client
    ) as unknown as ERC20Contract;

    return erc20
      .allowance(this.getAccount(), HUB_ADDRESS)
      .then((allowance: string) => ({ token, allowance: formatUnits(allowance, token.decimals) }));
  }

  async approveToken(token: Token): Promise<TransactionResponse> {
    const ERC20Interface = new Interface(ERC20ABI);

    const chain = await this.getNetwork();

    const erc20 = new ethers.Contract(
      token.address === ETH.address ? WETH(chain.chainId).address : token.address,
      ERC20Interface,
      this.getSigner()
    ) as unknown as ERC20Contract;

    return erc20.approve(HUB_ADDRESS, MaxUint256);
  }

  // PAIR METHODS
  async getNextSwapInfo(pair: { tokenA: string; tokenB: string }): Promise<GetNextSwapInfo> {
    const [tokenA, tokenB] = sortTokensByAddress(pair.tokenA, pair.tokenB);
    const currentNetwork = await this.getNetwork();
    let provider: any = this.client;
    if (!this.client) {
      try {
        provider = ethers.getDefaultProvider(getStringNetwork(currentNetwork.name));
      } catch {
        provider = await detectEthereumProvider();
      }
    }

    const hubContract = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, provider) as unknown as HubContract;

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

    const liquidity: number = poolsWithLiquidityResponse.data.pools.reduce((acc: number, pool: PoolLiquidityData) => {
      pool.poolDayData.forEach((dayData) => {
        // eslint-disable-next-line no-param-reassign
        acc += parseFloat(dayData.volumeUSD);
      });

      return acc;
    }, 0);

    return liquidity;
  }

  async canSupportPair(token0: Token, token1: Token) {
    const [tokenA, tokenB] = sortTokens(token0, token1);

    // if they are not connected we show everything as available
    if (!this.client) return true;

    const oracleInstance = new ethers.Contract(
      ORACLE_ADDRESS,
      ORACLE_AGGREGATOR_ABI.abi,
      this.client
    ) as unknown as OracleContract;

    return oracleInstance.canSupportPair(tokenA.address, tokenB.address);
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
    tokenA = tokenA.address === ETH.address ? WETH(chain.chainId) : tokenA;
    tokenB = tokenB.address === ETH.address ? WETH(chain.chainId) : tokenB;

    const hubInstance = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, this.getSigner());

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

  // POSITION EMTHODS
  async getTokenNFT(id: string): Promise<NFTData> {
    const pairAddressContract = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, this.client) as unknown as HubContract;

    const tokenData = await pairAddressContract.tokenURI(id);
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

    const chain = await this.getNetwork();

    const weiValue = parseUnits(fromValue, token.decimals);

    const amountOfSwaps = BigNumber.from(frequencyValue);
    const swapInterval = frequencyType;

    const hubInstance = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;

    return hubInstance.deposit(
      from.address === ETH.address ? WETH(chain.chainId).address : from.address,
      from.address === ETH.address ? WETH(chain.chainId).address : to.address,
      weiValue,
      amountOfSwaps,
      swapInterval,
      this.account,
      []
    );
  }

  withdraw(position: Position): Promise<TransactionResponse> {
    const hubInstance = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;

    return hubInstance.withdrawSwapped(position.id, this.account);
  }

  terminate(position: Position): Promise<TransactionResponse> {
    const hubInstance = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;

    return hubInstance.terminate(position.id, this.account, this.account);
  }

  addFunds(position: Position, newDeposit: string): Promise<TransactionResponse> {
    const hubInstance = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;

    const newRate = parseUnits(newDeposit, position.from.decimals)
      .add(position.remainingLiquidity)
      .div(BigNumber.from(position.remainingSwaps));

    const newAmount = newRate.mul(BigNumber.from(position.remainingSwaps));
    if (newAmount.gte(position.remainingLiquidity)) {
      return hubInstance.increasePosition(
        position.id,
        newAmount.sub(position.remainingLiquidity),
        position.remainingSwaps
      );
    }
    return hubInstance.reducePosition(
      position.id,
      position.remainingLiquidity.sub(newAmount),
      position.remainingSwaps,
      this.account
    );
  }

  resetPosition(position: Position, newDeposit: string, newSwaps: string): Promise<TransactionResponse> {
    const hubInstance = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;

    const newRate = parseUnits(newDeposit, position.from.decimals)
      .add(position.remainingLiquidity)
      .div(BigNumber.from(newSwaps));

    const newAmount = newRate.mul(BigNumber.from(newSwaps));
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

  modifyRateAndSwaps(position: Position, newRate: string, newSwaps: string): Promise<TransactionResponse> {
    const hubInstance = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;

    const newAmount = BigNumber.from(parseUnits(newRate, position.from.decimals)).mul(BigNumber.from(newSwaps));
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

  removeFunds(position: Position, ammountToRemove: string): Promise<TransactionResponse> {
    const hubInstance = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, this.getSigner()) as unknown as HubContract;

    const newSwaps = parseUnits(ammountToRemove, position.from.decimals).eq(position.remainingLiquidity)
      ? BigNumber.from(0)
      : position.remainingSwaps;

    const newRate = parseUnits(ammountToRemove, position.from.decimals).eq(position.remainingLiquidity)
      ? BigNumber.from(0)
      : position.remainingLiquidity
          .sub(parseUnits(ammountToRemove, position.from.decimals))
          .div(BigNumber.from(position.remainingSwaps));

    const newAmount = newRate.mul(BigNumber.from(position.remainingSwaps));
    if (newAmount.gte(position.remainingLiquidity)) {
      return hubInstance.increasePosition(position.id, newAmount.sub(position.remainingLiquidity), newSwaps);
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

  parseLog(log: Log) {
    const hubInstance = new ethers.Contract(HUB_ADDRESS, HUB_ABI.abi, this.getSigner());

    return hubInstance.interface.parseLog(log);
  }

  setPendingTransaction(transaction: TransactionDetails) {
    if (
      transaction.type === TRANSACTION_TYPES.NEW_PAIR ||
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN ||
      transaction.type === TRANSACTION_TYPES.WRAP_ETHER
    )
      return;

    const typeData = transaction.typeData as TransactionPositionTypeDataOptions;
    let { id } = typeData;
    if (transaction.type === TRANSACTION_TYPES.NEW_POSITION) {
      const newPositionTypeData = typeData as NewPositionTypeData;
      id = `pending-transaction-${transaction.hash}`;
      this.currentPositions[id] = {
        from: newPositionTypeData.from,
        to: newPositionTypeData.to,
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
            createdAt: Math.floor(Date.now() / 1000),
            swapInfo: {
              swapsToPerform: [],
            },
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
      case TRANSACTION_TYPES.NEW_PAIR: {
        const newPairTypeData = transaction.typeData as NewPairTypeData;
        const [token0, token1] = sortTokens(newPairTypeData.token0, newPairTypeData.token1);
        this.availablePairs.push({
          token0,
          token1,
          id: newPairTypeData.id as string,
          lastExecutedAt: 0,
          createdAt: Math.floor(Date.now() / 1000),
          swapInfo: {
            swapsToPerform: [],
          },
        });
        break;
      }
      default:
        break;
    }
  }
}
