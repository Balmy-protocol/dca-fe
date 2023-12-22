import { ethers, BigNumber } from 'ethers';
import { Interface } from '@ethersproject/abi';
import { TransactionResponse, Network, TransactionRequest } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { Token, ERC20Contract, MulticallContract, PositionVersions, TokenType, AccountEns } from '@types';
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

  contractService: ContractService;

  providerService: ProviderService;

  constructor(contractService: ContractService, providerService: ProviderService) {
    this.contractService = contractService;
    this.providerService = providerService;
  }

  async getEns(address: string) {
    let ens = null;

    if (!address) {
      return ens;
    }

    const currentNetwork = await this.providerService.getNetwork(address);

    if (currentNetwork.chainId === NETWORKS.arbitrum.chainId) {
      try {
        const activeWallet = await this.providerService.getSigner();

        const activeWalletAddress = await activeWallet.getAddress();
        const smolDomainInstance = await this.contractService.getSmolDomainInstance(
          currentNetwork.chainId,
          activeWalletAddress
        );

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

  async getManyEns(addresses: string[]): Promise<AccountEns> {
    const ensPromises = addresses.map((address) => this.getEns(address).then((ens) => ({ [address]: ens })));
    const ensObjects = await Promise.all(ensPromises);
    return ensObjects.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }

  async changeNetwork(newChainId: number, address?: string, callbackBeforeReload?: () => void): Promise<void> {
    try {
      const currentNetwork = await this.providerService.getNetwork(address);
      if (currentNetwork.chainId !== newChainId) {
        await this.providerService.attempToAutomaticallyChangeNetwork(newChainId, address, callbackBeforeReload, true);
      }
    } catch (switchError) {
      console.error('Error switching chains', switchError);
    }
  }

  async changeNetworkAutomatically(
    newChainId: number,
    address?: string,
    callbackBeforeReload?: () => void
  ): Promise<void> {
    try {
      const currentNetwork = await this.providerService.getNetwork(address);
      if (currentNetwork.chainId !== newChainId) {
        await this.providerService.attempToAutomaticallyChangeNetwork(newChainId, address, callbackBeforeReload, false);
      }
    } catch (switchError) {
      console.error('Error switching chains', switchError);
    }
  }

  async getCustomToken(
    address: string,
    ownerAddress: string
  ): Promise<{ token: Token; balance: BigNumber } | undefined> {
    const currentNetwork = await this.providerService.getNetwork(ownerAddress);

    if (!address) return Promise.resolve(undefined);

    const ERC20Interface = new Interface(ERC20ABI);

    const provider = await this.providerService.getProvider();

    const erc20 = new ethers.Contract(address, ERC20Interface, provider) as unknown as ERC20Contract;

    const balanceCall = erc20.populateTransaction.balanceOf(ownerAddress).then((populatedTransaction) => ({
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

  async getBalance(account?: string, address?: string): Promise<BigNumber> {
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

  async getAllowance(
    token: Token,
    ownerAddress: string,
    shouldCheckCompanion?: boolean,
    positionVersion: PositionVersions = LATEST_VERSION
  ) {
    const addressToCheck = shouldCheckCompanion
      ? this.contractService.getHUBCompanionAddress(token.chainId, positionVersion)
      : this.contractService.getHUBAddress(token.chainId, positionVersion);

    return this.getSpecificAllowance(token, addressToCheck, ownerAddress);
  }

  async getSpecificAllowance(token: Token, addressToCheck: string, ownerAddress: string) {
    if (token.address === PROTOCOL_TOKEN_ADDRESS || !ownerAddress) {
      return Promise.resolve({ token, allowance: formatUnits(MaxUint256, token.decimals) });
    }

    if (addressToCheck === NULL_ADDRESS) {
      return Promise.resolve({ token, allowance: formatUnits(MaxUint256, token.decimals) });
    }

    const erc20 = await this.contractService.getERC20TokenInstance(token.chainId, token.address, ownerAddress);

    const allowance = await erc20.allowance(ownerAddress, addressToCheck);

    return {
      token,
      allowance: formatUnits(allowance, token.decimals),
    };
  }

  async buildApproveSpecificTokenTx(
    ownerAddress: string,
    token: Token,
    addressToApprove: string,
    amount?: BigNumber
  ): Promise<TransactionRequest> {
    const erc20 = await this.contractService.getERC20TokenInstance(token.chainId, token.address, ownerAddress);

    return erc20.populateTransaction.approve(addressToApprove, amount || MaxUint256);
  }

  async buildApproveTx(
    ownerAddress: string,
    token: Token,
    shouldUseCompanion = false,
    positionVersion: PositionVersions = LATEST_VERSION,
    amount?: BigNumber
  ): Promise<TransactionRequest> {
    const addressToApprove = shouldUseCompanion
      ? this.contractService.getHUBCompanionAddress(token.chainId, positionVersion)
      : this.contractService.getHUBAddress(token.chainId, positionVersion);

    return this.buildApproveSpecificTokenTx(ownerAddress, token, addressToApprove, amount);
  }

  async approveToken(
    ownerAddress: string,
    token: Token,
    shouldUseCompanion = false,
    positionVersion: PositionVersions = LATEST_VERSION,
    amount?: BigNumber
  ): Promise<TransactionResponse> {
    const addressToApprove = shouldUseCompanion
      ? this.contractService.getHUBCompanionAddress(token.chainId, positionVersion)
      : this.contractService.getHUBAddress(token.chainId, positionVersion);

    return this.approveSpecificToken(token, addressToApprove, ownerAddress, amount);
  }

  async approveSpecificToken(
    token: Token,
    addressToApprove: string,
    ownerAddress: string,
    amount?: BigNumber
  ): Promise<TransactionResponse> {
    const erc20 = await this.contractService.getERC20TokenInstance(token.chainId, token.address, ownerAddress);

    return erc20.approve(addressToApprove, amount || MaxUint256);
  }

  async transferToken({
    from,
    to,
    token,
    amount,
  }: {
    from: string;
    to: string;
    token: Token;
    amount: BigNumber;
  }): Promise<TransactionResponse> {
    if (amount.lte(0)) {
      throw new Error('Amount must be greater than zero');
    }
    const signer = await this.providerService.getSigner(from, token.chainId);

    if (token.type === TokenType.ERC20_TOKEN || token.type === TokenType.WRAPPED_PROTOCOL_TOKEN) {
      const erc20Contract = await this.contractService.getERC20TokenInstance(token.chainId, token.address, from);
      return erc20Contract.transfer(to, amount);
    } else if (token.type === TokenType.NATIVE) {
      return signer.sendTransaction({
        from,
        to,
        value: amount,
      });
    }

    throw new Error('Token must be of type Native or ERC20');
  }

  async transferNFT({
    from,
    to,
    token,
    tokenId,
  }: {
    from: string;
    to: string;
    token: Token;
    tokenId: BigNumber;
  }): Promise<TransactionResponse> {
    if (token.type !== TokenType.ERC721_TOKEN) {
      throw new Error('Token must be of type ERC721');
    }

    const erc721Contract = await this.contractService.getERC721TokenInstance(token.chainId, token.address, from);
    return erc721Contract.transferFrom(from, to, tokenId);
  }
}
