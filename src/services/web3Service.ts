import { ethers, Signer, BigNumber } from 'ethers';
import { Interface } from '@ethersproject/abi';
import { formatEther, formatUnits, parseUnits } from '@ethersproject/units';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Authereum from 'authereum';
import Torus from '@toruslabs/torus-embed';
import axios, { AxiosResponse } from 'axios';
import { GasNowResponse, CoinGeckoPriceResponse, Token, AvailablePair, CurrentPosition } from 'types';
import { MaxUint256 } from '@ethersproject/constants';
import { calculateSeconds } from 'utils/parsing';
// ABIS
import ERC20ABI from 'abis/erc20.json';
import Factory from 'abis/factory.json';
import DCAPair from 'abis/DCAPair.json';

// MOCKS
import currentPositionMocks from 'mocks/currentPositions';
import availablePairsMocks from 'mocks/availablePairs';
import { ETH } from 'mocks/tokens';

export const FACTORY_ADDRESS =
  process.env.ETH_NETWORK === 'mainnet'
    ? '0xa55E3d0E2Ad549D4De687B57b8598e108D65EbA9'
    : '0x19B7F4424106a5A15d50043Ad92D8f4066FF2687';

export default class Web3Service {
  client: ethers.providers.Web3Provider;
  modal: Web3Modal;
  signer: Signer;
  account: string;
  setAccountCallback: React.Dispatch<React.SetStateAction<string>>;

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

    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    const ethersProvider = new ethers.providers.Web3Provider(provider);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = ethersProvider.getSigner();

    this.setClient(ethersProvider);
    this.setSigner(signer);

    const account = await this.signer.getAddress();

    this.setAccount(account);

    if (window.ethereum) {
      // handle metamask account change
      window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
        this.setAccount(newAccounts[0]);
      });

      // extremely recommended by metamask
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    provider.on('network', (newNetwork: any, oldNetwork: any) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network

      if (oldNetwork) {
        window.location.reload();
      }
    });
  }

  getNetwork() {
    return this.client.getNetwork();
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
      network: process.env.ETH_NETWORK, // optional
      cacheProvider: true, // optional
      providerOptions, // required
    });

    this.setModal(web3Modal);

    if (web3Modal.cachedProvider) {
      await this.connect();
    }
  }

  getBalance(address?: string, decimals?: number) {
    if (!address) return Promise.resolve();

    if (address === ETH.address) return this.signer.getBalance().then((balance: BigNumber) => formatEther(balance));

    const ERC20Interface = new Interface(ERC20ABI) as any;

    const erc20 = new ethers.Contract(address, ERC20Interface, this.client);

    return erc20.balanceOf(this.getAccount()).then((balance: string) => formatUnits(BigNumber.from(balance), decimals));
  }

  getEstimatedPairCreation(token0?: string, token1?: string) {
    if (!token0 || !token1) return Promise.resolve();

    let tokenA = token0;
    let tokenB = token1;

    if (token0 > token1) {
      tokenA = token1;
      tokenB = token0;
    }

    const factory = new ethers.Contract(FACTORY_ADDRESS, Factory.abi, this.getSigner());

    return Promise.all([
      factory.estimateGas.createPair(token0, token1),
      axios.get<GasNowResponse>('https://www.gasnow.org/api/v3/gas/price'),
      axios.get<CoinGeckoPriceResponse>(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum&order=market_cap_desc&per_page=1&page=1&sparkline=false'
      ),
    ]).then((values: [BigNumber, AxiosResponse<GasNowResponse>, AxiosResponse<CoinGeckoPriceResponse>]) => {
      const [gasLimitRaw, gasPriceResponse, ethPriceResponse] = values;

      const gasLimit = BigNumber.from(gasLimitRaw);
      const gasPrice = BigNumber.from(gasPriceResponse.data.data.standard);
      const ethPrice = ethPriceResponse.data[0].current_price;

      const gas = gasLimit.mul(gasPrice);

      return {
        gas: formatUnits(gas, 'gwei'),
        gasUsd: parseFloat(formatEther(gas)) * ethPrice,
        gasEth: formatEther(gas),
      };
    });
  }

  createPair(token0: string, token1: string) {
    if (!token0 || !token1) return Promise.resolve();

    let tokenA = token0;
    let tokenB = token1;

    if (token0 > token1) {
      tokenA = token1;
      tokenB = token0;
    }

    const factory = new ethers.Contract(FACTORY_ADDRESS, Factory.abi, this.getSigner());

    return factory.createPair(token0, token1);
  }

  // TODO: CHANGE FOR GRAPHQL HOOK WHEN INTEGRATED
  getCurrentPositions() {
    return Promise.resolve(currentPositionMocks);
  }

  // TODO: CHANGE FOR GRAPHQL HOOK WHEN INTEGRATED
  getAvailablePairs() {
    return Promise.resolve(availablePairsMocks);
  }

  getGasPrice() {
    return axios.get<GasNowResponse>('https://www.gasnow.org/api/v3/gas/price');
  }

  // TODO: ENABLE FOR PROD
  getUsedTokens() {
    // return axios.get(
    //   `https://api.ethplorer.io/getAddressInfo/${this.getAccount()}?apiKey=${[process.env.ETHPLORER_KEY]}`
    // );

    return Promise.resolve({ data: {} });
  }

  getAllowance(token: Token, pairContract: AvailablePair) {
    if (token.address === ETH.address) return formatEther(MaxUint256);

    const ERC20Interface = new Interface(ERC20ABI) as any;

    const erc20 = new ethers.Contract(token.address, ERC20Interface, this.client);

    return erc20
      .allowance(this.getAccount(), pairContract.id)
      .then((allowance: string) => formatUnits(allowance, token.decimals));
  }

  approveToken(token: Token, pairContract: AvailablePair) {
    if (token.address === ETH.address) return Promise.resolve();

    const ERC20Interface = new Interface(ERC20ABI) as any;

    const erc20 = new ethers.Contract(token.address, ERC20Interface, this.getSigner());

    return erc20.approve(pairContract.id, MaxUint256);
  }

  deposit(
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: string,
    frequencyValue: string,
    existingPair: AvailablePair
  ) {
    let token = from;

    if (from > to) {
      token = to;
    }

    const weiValue = parseUnits(fromValue, token.decimals);

    const rate = weiValue.div(BigNumber.from(frequencyValue));
    const amountOfSwaps = BigNumber.from(frequencyValue);
    const swapInterval = calculateSeconds(frequencyType);

    const factory = new ethers.Contract(existingPair.id, DCAPair.abi, this.getSigner());

    return factory.deposit(token.address, rate, amountOfSwaps, swapInterval);
  }

  withdraw(position: CurrentPosition, pair: AvailablePair) {
    const factory = new ethers.Contract(pair.id, DCAPair.abi, this.getSigner());

    return factory.withdrawSwapped(position.id);
  }
}
