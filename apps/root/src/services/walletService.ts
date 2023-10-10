import { ethers, BigNumber } from 'ethers';
import React from 'react';
import { Interface } from '@ethersproject/abi';
import { TransactionResponse, Network, TransactionRequest } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { Token, ERC20Contract, MulticallContract, PositionVersions } from '@types';
import { MaxUint256 } from '@ethersproject/constants';
import { toToken } from '@common/utils/currency';

// ABIS
import ERC20ABI from '@abis/erc20.json';
import MULTICALLABI from '@abis/Multicall.json';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { LATEST_VERSION, MULTICALL_ADDRESS, MULTICALL_DEFAULT_ADDRESS, NETWORKS, NULL_ADDRESS } from '@constants';
import ContractService from './contractService';
import ProviderService from './providerService';

export default class WalletService {
  network: Network;

  account: string | null;

  contractService: ContractService;

  providerService: ProviderService;

  constructor(contractService: ContractService, providerService: ProviderService) {
    this.contractService = contractService;
    this.providerService = providerService;
  }

  setAccount(account?: string | null, setAccountCallback?: React.Dispatch<React.SetStateAction<string>>) {
    this.account = account || null;

    if (setAccountCallback) {
      setAccountCallback(this.account || '');
    }
  }

  getAccount() {
    return this.account || '';
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
        await this.providerService.attempToAutomaticallyChangeNetwork(newChainId, callbackBeforeReload, true);
      }
    } catch (switchError) {
      console.error('Error switching chains', switchError);
    }
  }

  async changeNetworkAutomatically(newChainId: number, callbackBeforeReload?: () => void): Promise<void> {
    try {
      const currentNetwork = await this.providerService.getNetwork();
      if (currentNetwork.chainId !== newChainId) {
        await this.providerService.attempToAutomaticallyChangeNetwork(newChainId, callbackBeforeReload, false);
      }
    } catch (switchError) {
      console.error('Error switching chains', switchError);
    }
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

    const [balanceResult, decimalResult, nameResult, symbolResult] =
      await multicallInstance.callStatic.aggregate3(populatedTransactions);

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

  async getBalance(address?: string, passedAccount?: string): Promise<BigNumber> {
    const connectedAccount = this.getAccount();

    const account = passedAccount || connectedAccount;

    if (!address || !account) return Promise.resolve(BigNumber.from(0));

    if (address === PROTOCOL_TOKEN_ADDRESS) {
      const balance = await this.providerService.getBalance(account);

      return balance || BigNumber.from(0);
    }

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

  async buildApproveSpecificTokenTx(
    token: Token,
    addressToApprove: string,
    amount?: BigNumber
  ): Promise<TransactionRequest> {
    const erc20 = await this.contractService.getTokenInstance(token.address);

    return erc20.populateTransaction.approve(addressToApprove, amount || MaxUint256);
  }

  async buildApproveTx(
    token: Token,
    shouldUseCompanion = false,
    positionVersion: PositionVersions = LATEST_VERSION,
    amount?: BigNumber
  ): Promise<TransactionRequest> {
    const addressToApprove = shouldUseCompanion
      ? await this.contractService.getHUBCompanionAddress(positionVersion)
      : await this.contractService.getHUBAddress(positionVersion);

    return this.buildApproveSpecificTokenTx(token, addressToApprove, amount);
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
