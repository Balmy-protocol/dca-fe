import { BigNumber, VoidSigner } from 'ethers';

import { NULL_ADDRESS, ONE_DAY, PERMIT_2_WORDS } from '@constants';
import { Token } from '@types';
import { TransactionRequest } from '@ethersproject/providers';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
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

    return {
      deadline: Number(preparedSignature.permitData.deadline),
      nonce: BigNumber.from(preparedSignature.permitData.nonce),
      rawSignature,
    };
  }

  async getPermit2DcaSignedData(token: Token, amount: BigNumber, wordIndex?: number) {
    const signer = this.providerService.getSigner();
    const network = await this.providerService.getNetwork();

    const preparedSignature = await this.sdkService.sdk.dcaService.management.preparePermitData({
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

    return {
      deadline: Number(preparedSignature.permitData.deadline),
      nonce: BigNumber.from(preparedSignature.permitData.nonce),
      rawSignature,
    };
  }

  getPermit2ArbitraryData(
    tx: TransactionRequest,
    amount: BigNumber,
    token: Token,
    signature?: { deadline: number; nonce: BigNumber; rawSignature: string }
  ) {
    return this.sdkService.sdk.permit2Service.arbitrary.buildArbitraryCallWithPermit({
      // Set permit data
      permitData: {
        token: token.address === PROTOCOL_TOKEN_ADDRESS ? NULL_ADDRESS : token.address,
        amount: amount.toString(),
        nonce: (token.address === PROTOCOL_TOKEN_ADDRESS ? 0 : signature?.nonce.toString()) || 0,
        signature: (token.address === PROTOCOL_TOKEN_ADDRESS ? '0x' : signature?.rawSignature) || '0x',
        deadline: signature?.deadline || (Math.floor(Date.now() / 1000) + ONE_DAY.toNumber()).toString(),
      },

      allowanceTargets: [
        ...(token.address === PROTOCOL_TOKEN_ADDRESS ? [] : [{ token: token.address, target: tx.to as string }]),
      ],

      calls: [
        {
          ...tx,
          to: tx.to as string,
          data: tx.data as string,
          value: tx.value?.toString(),
        },
      ],
    });
  }
}
