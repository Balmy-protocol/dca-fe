import { ethers, BigNumber } from 'ethers';
import { AxiosInstance, AxiosResponse } from 'axios';
import React from 'react';
import { Interface } from '@ethersproject/abi';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import { TransactionResponse, Network } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { GetUsedTokensData, Token } from 'types';
import { MaxUint256 } from '@ethersproject/constants';
import isUndefined from 'lodash/isUndefined';
import { toToken } from 'utils/currency';

// ABIS
import ERC20ABI from 'abis/erc20.json';
import MULTICALLABI from 'abis/Multicall.json';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import {
  LATEST_VERSION,
  MULTICALL_ADDRESS,
  MULTICALL_DEFAULT_ADDRESS,
  NETWORKS,
  NULL_ADDRESS,
  PositionVersions,
} from 'config/constants';
import { ERC20Contract, MulticallContract } from 'types/contracts';
import ContractService from './contractService';
import ProviderService from './providerService';

export default class WalletService {
  network: Network;

  account: string | null;

  contractService: ContractService;

  providerService: ProviderService;

  axiosClient: AxiosInstance;

  constructor(contractService: ContractService, axiosClient: AxiosInstance, providerService: ProviderService) {
    this.contractService = contractService;
    this.providerService = providerService;
    this.axiosClient = axiosClient;
  }

  async setAccount(account?: string | null, setAccountCallback?: React.Dispatch<React.SetStateAction<string>>) {
    this.account = isUndefined(account) ? await this.providerService.getAddress() : account;

    if (setAccountCallback) {
      setAccountCallback(this.account || '');
    }
  }

  getAccount() {
    return this.account || '';
  }

  getUsedTokens(): Promise<AxiosResponse<GetUsedTokensData> | null> {
    if (!this.getAccount()) {
      return Promise.resolve(null);
    }

    return this.axiosClient.get<GetUsedTokensData>(
      `https://api.ethplorer.io/getAddressInfo/${this.getAccount() || ''}?apiKey=${process.env.ETHPLORER_KEY || ''}`
    );
  }

  async getEns(address: string) {
    let ens = null;

    if (!address) {
      return ens;
    }

    const currentNetwork = await this.providerService.getNetwork();

    if (currentNetwork.chainId === NETWORKS.arbitrum.chainId) {
      try {
        const smolDomainInstance = await this.contractService.getSmolDomainInstance();

        ens = await smolDomainInstance.getFirstDefaultDomain(address);
        // eslint-disable-next-line no-empty
      } catch {}
    }

    if (ens) {
      return ens;
    }

    try {
      const provider = ethers.getDefaultProvider('homestead', {
        alchemy: 'iQPOH9BzDH8DDB7yUsVDR5QuotbFA-ZH',
        infura: 'd729b4ddc49d4ce88d4e23865cb74217',
        etherscan: '4UTUC6B8A4X6Z3S1PVVUUXFX6IVTFNQEUF',
      });
      ens = await provider.lookupAddress(address);
      // eslint-disable-next-line no-empty
    } catch {}

    return ens;
  }

  async changeNetwork(newChainId: number, callbackBeforeReload?: () => void): Promise<void> {
    try {
      const currentNetwork = await this.providerService.getNetwork();
      if (currentNetwork.chainId !== newChainId) {
        await this.providerService.changeNetwork(newChainId, callbackBeforeReload);
      }
    } catch (switchError) {
      console.error('Error switching chains', switchError);
    }
  }

  async getMulticallBalances(addresses?: string[]): Promise<Record<string, BigNumber>> {
    const account = this.getAccount();
    const currentNetwork = await this.providerService.getNetwork();

    if (!addresses?.length || !account) return Promise.resolve({});

    const ERC20Interface = new Interface(ERC20ABI);

    const filteredAddresses = addresses.filter((address) => address !== PROTOCOL_TOKEN_ADDRESS);

    const provider = await this.providerService.getProvider();

    const balancesCall = await Promise.all(
      filteredAddresses.map((address) => {
        const erc20 = new ethers.Contract(address, ERC20Interface, provider) as unknown as ERC20Contract;

        return erc20.populateTransaction.balanceOf(account).then((populatedTransaction) => ({
          target: populatedTransaction.to as string,
          allowFailure: true,
          callData: populatedTransaction.data as string,
        }));
      })
    );

    const multicallInstance = new ethers.Contract(
      MULTICALL_ADDRESS[currentNetwork.chainId] || MULTICALL_DEFAULT_ADDRESS,
      MULTICALLABI,
      provider
    ) as unknown as MulticallContract;

    const results = await multicallInstance.callStatic.aggregate3(balancesCall);

    let protocolBalance: BigNumber | null = null;

    const hasProtocolToken = addresses.indexOf(PROTOCOL_TOKEN_ADDRESS) !== -1;

    if (addresses.indexOf(PROTOCOL_TOKEN_ADDRESS) !== -1) {
      protocolBalance = await this.providerService.getBalance();
    }

    return results
      .filter(({ success }) => !!success)
      .reduce<Record<string, BigNumber>>(
        (acc, balanceResult, index) => ({
          ...acc,
          [filteredAddresses[index]]: BigNumber.from(
            ethers.utils.defaultAbiCoder.decode(['uint256'], balanceResult.returnData)[0] as string
          ),
        }),
        {
          ...(hasProtocolToken && protocolBalance ? { [PROTOCOL_TOKEN_ADDRESS]: protocolBalance } : {}),
        }
      );
  }

  async get1InchBalances(): Promise<Record<string, BigNumber>> {
    const account = this.getAccount();
    const currentNetwork = await this.providerService.getNetwork();

    if (!account) return Promise.resolve({});

    const inchResponse = await this.axiosClient.get<Record<string, string>>(
      `https://balances.1inch.io/v1.1/${currentNetwork.chainId}/balances/${account}`
    );

    const balances = inchResponse.data;

    return mapValues(
      mapKeys(balances, (value, key) => key.toLowerCase()),
      (balance) => BigNumber.from(balance)
    );
  }

  async getCustomToken(address: string): Promise<{ token: Token; balance: BigNumber } | undefined> {
    const account = this.getAccount();
    const currentNetwork = await this.providerService.getNetwork();

    if (!address || !account) return Promise.resolve(undefined);

    const ERC20Interface = new Interface(ERC20ABI);

    const provider = await this.providerService.getProvider();

    const erc20 = new ethers.Contract(address, ERC20Interface, provider) as unknown as ERC20Contract;

    const balanceCall = erc20.populateTransaction.balanceOf(account).then((populatedTransaction) => ({
      target: populatedTransaction.to as string,
      allowFailure: true,
      callData: populatedTransaction.data as string,
    }));

    const decimalsCall = erc20.populateTransaction.decimals().then((populatedTransaction) => ({
      target: populatedTransaction.to as string,
      allowFailure: true,
      callData: populatedTransaction.data as string,
    }));

    const nameCall = erc20.populateTransaction.name().then((populatedTransaction) => ({
      target: populatedTransaction.to as string,
      allowFailure: true,
      callData: populatedTransaction.data as string,
    }));

    const symbolCall = erc20.populateTransaction.symbol().then((populatedTransaction) => ({
      target: populatedTransaction.to as string,
      allowFailure: true,
      callData: populatedTransaction.data as string,
    }));

    const multicallInstance = new ethers.Contract(
      MULTICALL_ADDRESS[currentNetwork.chainId] || MULTICALL_DEFAULT_ADDRESS,
      MULTICALLABI,
      provider
    ) as unknown as MulticallContract;

    const populatedTransactions = await Promise.all([balanceCall, decimalsCall, nameCall, symbolCall]);

    const [balanceResult, decimalResult, nameResult, symbolResult] = await multicallInstance.callStatic.aggregate3(
      populatedTransactions
    );

    const balance = BigNumber.from(
      ethers.utils.defaultAbiCoder.decode(['uint256'], balanceResult.returnData)[0] as string
    );
    const decimals = ethers.utils.defaultAbiCoder.decode(['uint8'], decimalResult.returnData)[0] as number;
    const name = ethers.utils.defaultAbiCoder.decode(['string'], nameResult.returnData)[0] as string;
    const symbol = ethers.utils.defaultAbiCoder.decode(['string'], symbolResult.returnData)[0] as string;

    return {
      token: toToken({ address: address.toLowerCase(), decimals, name, symbol, chainId: currentNetwork.chainId }),
      balance,
    };
  }

  async getBalance(address?: string): Promise<BigNumber> {
    const account = this.getAccount();

    if (!address || !account) return Promise.resolve(BigNumber.from(0));

    if (address === PROTOCOL_TOKEN_ADDRESS) return this.providerService.getBalance();

    const ERC20Interface = new Interface(ERC20ABI);

    const provider = await this.providerService.getProvider();

    const erc20 = new ethers.Contract(address, ERC20Interface, provider) as unknown as ERC20Contract;

    return erc20.balanceOf(account);
  }

  async getAllowance(token: Token, shouldCheckCompanion?: boolean, positionVersion: PositionVersions = LATEST_VERSION) {
    const addressToCheck = shouldCheckCompanion
      ? await this.contractService.getHUBCompanionAddress(positionVersion)
      : await this.contractService.getHUBAddress(positionVersion);

    return this.getSpecificAllowance(token, addressToCheck);
  }

  async getSpecificAllowance(token: Token, addressToCheck: string) {
    const account = this.getAccount();

    if (token.address === PROTOCOL_TOKEN_ADDRESS || !account) {
      return Promise.resolve({ token, allowance: formatUnits(MaxUint256, token.decimals) });
    }

    if (addressToCheck === NULL_ADDRESS) {
      return Promise.resolve({ token, allowance: formatUnits(MaxUint256, token.decimals) });
    }

    const erc20 = await this.contractService.getTokenInstance(token.address);

    const allowance = await erc20.allowance(account, addressToCheck);

    return {
      token,
      allowance: formatUnits(allowance, token.decimals),
    };
  }

  async approveToken(
    token: Token,
    shouldUseCompanion = false,
    positionVersion: PositionVersions = LATEST_VERSION,
    amount?: BigNumber
  ): Promise<TransactionResponse> {
    const addressToApprove = shouldUseCompanion
      ? await this.contractService.getHUBCompanionAddress(positionVersion)
      : await this.contractService.getHUBAddress(positionVersion);

    return this.approveSpecificToken(token, addressToApprove, amount);
  }

  async approveSpecificToken(token: Token, addressToApprove: string, amount?: BigNumber): Promise<TransactionResponse> {
    const erc20 = await this.contractService.getTokenInstance(token.address);

    return erc20.approve(addressToApprove, amount || MaxUint256);
  }
}
