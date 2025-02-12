import { TransactionDetails, TransactionTypes } from '@types';
import { toToken } from './currency';
import { getProtocolTokenTransactionAmount } from './transactions';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';

describe('transactions', () => {
  describe('getProtocolTokenTransactionAmount', () => {
    it('should return 0 for a transaction that is not a protocol token transaction', () => {
      const result = getProtocolTokenTransactionAmount({
        type: TransactionTypes.approveToken,
        typeData: {
          token: toToken({ address: '0x123' }),
          addressFor: '0x0',
        },
      } as TransactionDetails);

      expect(result).toEqual(0n);
    });
    it('should return the amount of the protocol token for a transaction that is a protocol token transaction', () => {
      const result = getProtocolTokenTransactionAmount({
        type: TransactionTypes.earnCreate,
        typeData: {
          asset: toToken({ address: PROTOCOL_TOKEN_ADDRESS }),
          assetAmount: '100',
        },
      } as TransactionDetails);

      expect(result).toEqual(100n);
    });
  });
});
