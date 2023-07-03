import { BigNumber, VoidSigner } from 'ethers';

import { ONE_DAY, PERMIT_2_WORDS } from '@constants';
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
    const permit2Address = await this.contractService.getPermit2Address();
    const calls = PERMIT_2_WORDS.map((word) => ({
      address: permit2Address,
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
      // debugger;
      const result = BigNumber.from(results[i]);
      if (result.lt(MaxUint256)) {
        // eslint-disable-next-line no-bitwise
        return BigNumber.from(PERMIT_2_WORDS[i])
          .shl(8)
          .add(Math.log2(result.add(1).toNumber()));
      }
    }

    throw new Error('No nonce found');
  }

  async getPermit2SignedData(token: Token, amount: BigNumber, addressFor?: string) {
    const signer = this.providerService.getSigner();
    const permit2Address = await this.contractService.getPermit2Address();
    const meanPermit2Address = await this.contractService.getMeanPermit2Address();

    const nonce = await this.generateNonce({ user: this.walletService.getAccount() });

    const typedData = {
      types: {
        PermitTransferFrom: [
          { type: 'TokenPermissions', name: 'permitted' },
          { type: 'address', name: 'spender' },
          { type: 'uint256', name: 'nonce' },
          { type: 'uint256', name: 'deadline' },
        ],
        TokenPermissions: [
          { type: 'address', name: 'token' },
          { type: 'uint256', name: 'amount' },
        ],
      },
      domain: {
        name: 'Permit2',
        chainId: token.chainId,
        verifyingContract: permit2Address,
      },
      message: {
        permitted: {
          token: token.address,
          amount,
        },
        spender: addressFor || meanPermit2Address,
        nonce,
        deadline: Math.floor(Date.now() / 1000) + ONE_DAY.toNumber(), // Deadline for the permit, for example, 24 hours from now
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
      deadline: typedData.message.deadline,
      v,
      r,
      s,
      nonce,
      rawSignature,
    };
  }
}
