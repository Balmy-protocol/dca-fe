import { Address, encodeFunctionData, formatUnits, maxUint256 } from 'viem';
import { Token, PositionVersions, TokenType, SubmittedTransaction, TransactionRequestWithChain } from '@types';
import { toToken } from '@common/utils/currency';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { LATEST_VERSION, NULL_ADDRESS } from '@constants';
import ContractService from './contractService';
import ProviderService from './providerService';

export default class WalletService {
  contractService: ContractService;

  providerService: ProviderService;

  constructor(contractService: ContractService, providerService: ProviderService) {
    this.contractService = contractService;
    this.providerService = providerService;
  }

  async changeNetwork(newChainId: number, address?: string, callbackBeforeReload?: () => void): Promise<void> {
    try {
      const currentNetwork = await this.providerService.getNetwork(address);
      if (currentNetwork.chainId !== newChainId) {
        await this.providerService.attempToAutomaticallyChangeNetwork(newChainId, address, callbackBeforeReload, true);
      } else if (callbackBeforeReload) {
        callbackBeforeReload();
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
      } else if (callbackBeforeReload) {
        callbackBeforeReload();
      }
    } catch (switchError) {
      console.error('Error switching chains', switchError);
    }
  }

  async getCustomToken(
    address: Address,
    ownerAddress: Address
  ): Promise<{ token: Token; balance: bigint } | undefined> {
    const currentNetwork = await this.providerService.getNetwork(ownerAddress);

    if (!address) return Promise.resolve(undefined);

    const erc20 = await this.contractService.getERC20TokenInstance({
      tokenAddress: address,
      readOnly: true,
      chainId: currentNetwork.chainId,
    });

    const provider = this.providerService.getProvider(currentNetwork.chainId);

    const [balanceResult, decimalResult, nameResult, symbolResult] = await provider.multicall({
      contracts: [
        {
          ...erc20,
          functionName: 'balanceOf',
          args: [ownerAddress],
        },
        {
          ...erc20,
          functionName: 'decimals',
        },
        {
          ...erc20,
          functionName: 'name',
        },
        {
          ...erc20,
          functionName: 'symbol',
        },
      ],
    });

    const balance = balanceResult.result;
    const decimals = decimalResult.result;
    const name = nameResult.result;
    const symbol = symbolResult.result;

    return {
      token: toToken({ address: address.toLowerCase(), decimals, name, symbol, chainId: currentNetwork.chainId }),
      balance: balance || 0n,
    };
  }

  async getBalance({ account, token }: { account?: Address; token: Token }): Promise<bigint> {
    if (!account) return Promise.resolve(0n);

    if (token.address === PROTOCOL_TOKEN_ADDRESS) {
      const balance = await this.providerService.getBalance(account, token.chainId);

      return balance || 0n;
    }

    const erc20 = await this.contractService.getERC20TokenInstance({
      readOnly: true,
      chainId: token.chainId,
      tokenAddress: token.address,
    });

    return erc20.read.balanceOf([account]);
  }

  async getAllowance(
    token: Token,
    ownerAddress: Address,
    shouldCheckCompanion?: boolean,
    positionVersion: PositionVersions = LATEST_VERSION
  ) {
    const addressToCheck = shouldCheckCompanion
      ? this.contractService.getHUBCompanionAddress(token.chainId, positionVersion)
      : this.contractService.getHUBAddress(token.chainId, positionVersion);

    if (!addressToCheck) return;

    return this.getSpecificAllowance(token, addressToCheck, ownerAddress);
  }

  async getSpecificAllowance(token: Token, addressToCheck: Address, ownerAddress: Address) {
    if (token.address === PROTOCOL_TOKEN_ADDRESS || !ownerAddress) {
      return Promise.resolve({ token, allowance: formatUnits(maxUint256, token.decimals) });
    }

    if (addressToCheck === NULL_ADDRESS) {
      return Promise.resolve({ token, allowance: formatUnits(maxUint256, token.decimals) });
    }

    const erc20 = await this.contractService.getERC20TokenInstance({
      chainId: token.chainId,
      tokenAddress: token.address,
      readOnly: true,
    });

    const allowance = await erc20.read.allowance([ownerAddress, addressToCheck]);

    return {
      token,
      allowance: formatUnits(allowance, token.decimals),
    };
  }

  async buildApproveSpecificTokenTx(ownerAddress: Address, token: Token, addressToApprove: Address, amount?: bigint) {
    const signer = await this.providerService.getSigner(ownerAddress, token.chainId);

    if (!signer) {
      throw new Error('signer not found');
    }

    const erc20 = await this.contractService.getERC20TokenInstance({
      chainId: token.chainId,
      tokenAddress: token.address,
      readOnly: false,
      wallet: ownerAddress,
    });

    const data = encodeFunctionData({
      ...erc20,
      functionName: 'approve',
      args: [addressToApprove, amount || maxUint256],
    });

    return signer.prepareTransactionRequest({
      to: erc20.address,
      data,
      account: ownerAddress,
      chain: null,
    }) as unknown as Promise<TransactionRequestWithChain>;
  }

  async approveSpecificToken(
    token: Token,
    addressToApprove: Address,
    ownerAddress: Address,
    amount?: bigint
  ): Promise<SubmittedTransaction> {
    const erc20 = await this.contractService.getERC20TokenInstance({
      chainId: token.chainId,
      tokenAddress: token.address,
      wallet: ownerAddress,
      readOnly: false,
    });

    const data = encodeFunctionData({
      ...erc20,
      functionName: 'approve',
      args: [addressToApprove, amount || maxUint256],
    });

    const res = await this.providerService.sendTransaction({
      to: erc20.address,
      data,
      chainId: token.chainId,
      from: ownerAddress,
    });

    return {
      hash: res.hash,
      from: ownerAddress,
      chainId: token.chainId,
    };
  }

  async getTransferTokenTx({
    from,
    to,
    token,
    amount,
  }: {
    from: Address;
    to: Address;
    token: Token;
    amount: bigint;
  }): Promise<TransactionRequestWithChain> {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const signer = await this.providerService.getSigner(from, token.chainId);

    if (!signer) {
      throw new Error('No signer connected');
    }

    let txData;
    if (token.type === TokenType.ERC20_TOKEN || token.type === TokenType.WRAPPED_PROTOCOL_TOKEN) {
      const erc20Contract = await this.contractService.getERC20TokenInstance({
        readOnly: false,
        chainId: token.chainId,
        tokenAddress: token.address,
        wallet: from,
      });

      const data = encodeFunctionData({
        ...erc20Contract,
        functionName: 'transfer',
        args: [to, amount],
      });

      txData = {
        to: erc20Contract.address,
        data,
        account: from,
        chain: null,
      };
    } else if (token.type === TokenType.NATIVE && signer) {
      txData = {
        account: from,
        to,
        value: amount,
        chain: null,
      };
    } else {
      throw new Error('Token must be of type Native or ERC20');
    }

    const preparedTx = await signer.prepareTransactionRequest(txData);

    return {
      ...preparedTx,
      chainId: token.chainId,
    } as unknown as TransactionRequestWithChain;
  }

  async transferToken({
    from,
    to,
    token,
    amount,
  }: {
    from: Address;
    to: Address;
    token: Token;
    amount: bigint;
  }): Promise<SubmittedTransaction> {
    const txToSend = await this.getTransferTokenTx({
      from,
      to,
      token,
      amount,
    });

    const signer = await this.providerService.getSigner(from, token.chainId);

    if (!signer) {
      throw new Error('No signer connected');
    }

    const hash = await signer.sendTransaction({
      ...txToSend,
      account: from,
      chain: null,
    });

    return {
      hash,
      from,
      chainId: token.chainId,
    };
  }

  async transferNFT({ from, to, token, tokenId }: { from: Address; to: Address; token: Token; tokenId: bigint }) {
    if (token.type !== TokenType.ERC721_TOKEN) {
      throw new Error('Token must be of type ERC721');
    }

    const erc721Contract = await this.contractService.getERC721TokenInstance({
      chainId: token.chainId,
      tokenAddress: token.address,
      wallet: from,
      readOnly: false,
    });

    const data = encodeFunctionData({
      ...erc721Contract,
      functionName: 'transferFrom',
      args: [from, to, tokenId],
    });

    const res = await this.providerService.sendTransaction({
      to: erc721Contract.address,
      data,
      from,
      chainId: token.chainId,
    });

    return {
      hash: res.hash,
      from,
      chainId: token.chainId,
    };
  }
}
