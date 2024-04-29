import { TransactionRequest } from 'viem';
import SafeAppsSDK from '@safe-global/safe-apps-sdk';

export default class SafeService {
  safeAppSdk: SafeAppsSDK;

  constructor() {
    this.safeAppSdk = new SafeAppsSDK();
  }

  submitMultipleTxs(txs: TransactionRequest[]) {
    const mappedTxs = txs.map((tx) => ({
      ...tx,
      to: tx.to as string,
      value: tx.value ? BigInt(tx.value).toString() : '0',
      data: tx.data as string,
    }));

    return this.safeAppSdk.txs.send({ txs: mappedTxs });
  }

  async getHashFromSafeTxHash(safeTxHash: string) {
    const tx = await this.safeAppSdk.txs.getBySafeTxHash(safeTxHash);

    return tx.txHash;
  }

  async isSafeApp() {
    // eslint-disable-next-line no-void
    if ((window === null || window === void 0 ? void 0 : window.parent) === window) {
      return false;
    }

    const safeInfo = await Promise.race([
      this.safeAppSdk.safe.getInfo(),
      new Promise((resolve) => setTimeout(resolve, 200)),
    ]);

    return !!safeInfo;
  }
}
