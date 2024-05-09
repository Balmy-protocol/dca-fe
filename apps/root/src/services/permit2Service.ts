import { NULL_ADDRESS, ONE_DAY, PERMIT_2_WORDS } from '@constants';
import { Token } from '@types';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import WalletService from './walletService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import ContractService from './contractService';
import { Address, TransactionRequest, TypedDataDomain, hexToSignature, signatureToHex } from 'viem';

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

  async getPermit2SignedData(address: Address, token: Token, amount: bigint, wordIndex?: number) {
    const signer = await this.providerService.getSigner(address);
    if (!signer) {
      throw new Error('No signer found');
    }
    const network = await this.providerService.getNetwork(address);

    const preparedSignature = await this.sdkService.sdk.permit2Service.arbitrary.preparePermitData({
      appId: PERMIT_2_WORDS[wordIndex || 0] || PERMIT_2_WORDS[0],
      chainId: network.chainId,
      signerAddress: address,
      token: token.address,
      amount: amount,
      signatureValidFor: '1d',
    });

    const rawSignature = await signer.signTypedData({
      domain: preparedSignature.dataToSign.domain as TypedDataDomain,
      types: preparedSignature.dataToSign.types,
      message: preparedSignature.dataToSign.message,
      account: address,
      primaryType: 'PermitTransferFrom',
    });

    // NOTE: Invalid Ledger + Metamask signatures need to be reconstructed until issue is solved and released
    // https://github.com/MetaMask/eth-ledger-bridge-keyring/pull/152
    // https://github.com/MetaMask/metamask-extension/issues/10240
    // found in https://github.com/yearn/yearn-finance-v3/pull/750/files
    const isInvalidLedgerSignature = rawSignature.endsWith('00') || rawSignature.endsWith('01');

    if (!isInvalidLedgerSignature)
      return {
        deadline: Number(preparedSignature.permitData.deadline),
        nonce: BigInt(preparedSignature.permitData.nonce),
        rawSignature,
      };

    const { r, v, s } = hexToSignature(rawSignature);
    return {
      deadline: Number(preparedSignature.permitData.deadline),
      nonce: BigInt(preparedSignature.permitData.nonce),
      rawSignature: signatureToHex({ r, v, s }),
    };
  }

  async getPermit2DcaSignedData(address: Address, chainId: number, token: Token, amount: bigint, wordIndex?: number) {
    const signer = await this.providerService.getSigner(address);

    if (!signer) {
      throw new Error('No signer found');
    }

    const preparedSignature = await this.sdkService.sdk.dcaService.preparePermitData({
      appId: PERMIT_2_WORDS[wordIndex || 0] || PERMIT_2_WORDS[0],
      chainId,
      signerAddress: address,
      token: token.address,
      amount: amount,
      signatureValidFor: '1d',
    });

    // eslint-disable-next-line no-underscore-dangle
    const rawSignature = await signer?.signTypedData({
      domain: preparedSignature.dataToSign.domain as TypedDataDomain,
      types: preparedSignature.dataToSign.types,
      message: preparedSignature.dataToSign.message,
      account: address,
      primaryType: 'PermitTransferFrom',
    });

    // NOTE: Invalid Ledger + Metamask signatures need to be reconstructed until issue is solved and released
    // https://github.com/MetaMask/eth-ledger-bridge-keyring/pull/152
    // https://github.com/MetaMask/metamask-extension/issues/10240
    // found in https://github.com/yearn/yearn-finance-v3/pull/750/files
    const isInvalidLedgerSignature = rawSignature.endsWith('00') || rawSignature.endsWith('01');

    if (!isInvalidLedgerSignature)
      return {
        deadline: Number(preparedSignature.permitData.deadline),
        nonce: BigInt(preparedSignature.permitData.nonce),
        rawSignature,
      };

    const { r, v, s } = hexToSignature(rawSignature);
    return {
      deadline: Number(preparedSignature.permitData.deadline),
      nonce: BigInt(preparedSignature.permitData.nonce),
      rawSignature: signatureToHex({ r, v, s }),
    };
  }

  getPermit2ArbitraryData(
    tx: TransactionRequest,
    amount: bigint,
    token: Token,
    signature?: { deadline: number; nonce: bigint; rawSignature: string }
  ) {
    return this.sdkService.sdk.permit2Service.arbitrary.buildArbitraryCallWithPermit({
      // Set permit data
      permitData: {
        token: token.address === PROTOCOL_TOKEN_ADDRESS ? NULL_ADDRESS : token.address,
        amount: amount.toString(),
        nonce: (token.address === PROTOCOL_TOKEN_ADDRESS ? 0 : signature?.nonce.toString()) || 0,
        signature: (token.address === PROTOCOL_TOKEN_ADDRESS ? '0x' : signature?.rawSignature) || '0x',
        deadline: signature?.deadline || (Math.floor(Date.now() / 1000) + Number(ONE_DAY)).toString(),
      },

      allowanceTargets: [
        ...(token.address === PROTOCOL_TOKEN_ADDRESS ? [] : [{ token: token.address, target: tx.to as string }]),
      ],
      chainId: token.chainId,
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

  async getPermit2SignatureInfo(address: Address, token: Token, amount: bigint, wordIndex?: number) {
    const network = await this.providerService.getNetwork();

    const preparedSignature = await this.sdkService.sdk.permit2Service.arbitrary.preparePermitData({
      appId: PERMIT_2_WORDS[wordIndex || 0] || PERMIT_2_WORDS[0],
      chainId: network.chainId,
      signerAddress: address,
      token: token.address,
      amount: amount,
      signatureValidFor: '1d',
    });

    return preparedSignature;
  }

  async getPermit2DcaSignatureInfo(address: Address, token: Token, amount: bigint, wordIndex?: number) {
    const network = await this.providerService.getNetwork();

    const preparedSignature = await this.sdkService.sdk.dcaService.preparePermitData({
      appId: PERMIT_2_WORDS[wordIndex || 0] || PERMIT_2_WORDS[0],
      chainId: network.chainId,
      signerAddress: address,
      token: token.address,
      amount: amount,
      signatureValidFor: '1d',
    });

    return preparedSignature;
  }
}
