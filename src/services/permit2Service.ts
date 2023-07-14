import { BigNumber, VoidSigner } from 'ethers';

import { PERMIT_2_WORDS } from '@constants';
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

  async getPermit2SignedData(token: Token, amount: BigNumber, wordIndex?: number) {
    const signer = this.providerService.getSigner();
    const network = await this.providerService.getNetwork();

    const preparedSignature = await this.sdkService.sdk.permit2Service.arbitrary.preparePermitData({
      appId: PERMIT_2_WORDS[wordIndex || 0] || PERMIT_2_WORDS[0],
      chainId: network.chainId,
      signerAddress: this.walletService.getAccount(),
      token: token.address,
      amount: amount.toBigInt(),
      signatureValidFor: '1d',
    });

    // eslint-disable-next-line no-underscore-dangle
    const rawSignature = await (signer as VoidSigner)._signTypedData(
      preparedSignature.dataToSign.domain,
      preparedSignature.dataToSign.types,
      preparedSignature.dataToSign.message
    );

    const { v, r, s } = fromRpcSig(rawSignature);

    return {
      deadline: Number(preparedSignature.permitData.deadline),
      v,
      r,
      s,
      nonce: BigNumber.from(preparedSignature.permitData.nonce),
      rawSignature,
    };
  }
}
