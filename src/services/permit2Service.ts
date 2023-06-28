import { BigNumber, VoidSigner } from 'ethers';

import { PERMIT_2_ADDRESS, PERMIT_2_WORDS } from '@constants';
import PERMIT2ABI from '@abis/Permit2.json';
import { MaxUint256 } from '@ethersproject/constants';
import { Token } from '@types';
import { fromRpcSig } from 'ethereumjs-util';
import WalletService from './walletService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import ContractService from './contractService';

export default class Permit2Service {
  contractService: ContractService;

  walletService: WalletService;

  sdkService: SdkService;

  providerService: ProviderService;

  constructor(
    walletService: WalletService,
    contractService: ContractService,
    sdkService: SdkService,
    providerService: ProviderService
  ) {
    this.contractService = contractService;
    this.walletService = walletService;
    this.sdkService = sdkService;
    this.providerService = providerService;
  }

  async generateNonce({ user }: { user: string }): Promise<BigNumber> {
    const currentNetwork = await this.providerService.getNetwork();
    const calls = PERMIT_2_WORDS.map((word) => ({
      address: PERMIT_2_ADDRESS[currentNetwork.chainId],
      abi: { json: PERMIT2ABI },
      functionName: 'nonceBitmap',
      args: [user, word],
    }));

    const results: BigNumber[] = (await this.sdkService.sdk.multicallService.readOnlyMulticall({
      chainId: currentNetwork.chainId,
      calls,
    })) as unknown as BigNumber[];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.lt(MaxUint256)) {
        // eslint-disable-next-line no-bitwise
        return BigNumber.from((PERMIT_2_WORDS[i] << 8) + Math.log2(result.add(1).toNumber()));
      }
    }

    throw new Error('No nonce found');
  }

  async getPermit2SignedData(token: Token, amount: BigNumber, addressFor: string) {
    const signer = this.providerService.getSigner();

    const nonce = await this.generateNonce({ user: this.walletService.getAccount() });
    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'Permit',
      domain: {
        name: token.name,
        version: '1',
        chainId: token.chainId, // Use the actual chainId
        verifyingContract: token.address,
      },
      message: {
        owner: this.walletService.getAccount(),
        spender: addressFor,
        value: amount, // Specify the token amount to permit
        nonce, // Nonce for this permit
        deadline: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Deadline for the permit, for example, 24 hours from now
      },
    };

    // eslint-disable-next-line no-underscore-dangle
    const rawSignature = await (signer as VoidSigner)._signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message
    );

    const { v, r, s } = fromRpcSig(rawSignature);

    return {
      deadline: MaxUint256,
      v,
      r,
      s,
    };
  }
}
