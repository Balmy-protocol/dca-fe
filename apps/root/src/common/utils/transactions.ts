import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { Positions, Token, TransactionDetails, TransactionTypes } from '@types';
import { BigNumber } from 'ethers';

export const getImpactedTokensByTxType = (tx: TransactionDetails, positions: Positions): Token[] => {
  switch (tx.type) {
    case TransactionTypes.transferToken:
      return [tx.typeData.token];

    case TransactionTypes.newPosition:
      return [tx.typeData.from];

    case TransactionTypes.wrapEther:
      return [getProtocolToken(tx.chainId), getWrappedProtocolToken(tx.chainId)];

    case TransactionTypes.terminatePosition:
      const terminatedPosition = positions.find((pos) => pos.id === tx.typeData.id);
      const tokensToUpdate: Token[] = [];
      if (terminatedPosition) {
        if (!BigNumber.from(tx.typeData.remainingLiquidity).isZero()) {
          tokensToUpdate.push(terminatedPosition.from);
        }
        if (!BigNumber.from(tx.typeData.toWithdraw).isZero()) {
          tokensToUpdate.push(terminatedPosition.to);
        }
      }
      return tokensToUpdate;

    case TransactionTypes.withdrawPosition:
    case TransactionTypes.modifyRateAndSwapsPosition:
    case TransactionTypes.withdrawFunds:
      const withdrawnPosition = positions.find((pos) => pos.id === tx.typeData.id);
      return withdrawnPosition ? [withdrawnPosition.from] : [];

    case TransactionTypes.swap:
    case TransactionTypes.wrap:
    case TransactionTypes.unwrap:
      const { from, to } = tx.typeData;
      return [from, to];

    default:
      return [];
  }
};

export const getImpactedTokenForOwnWallet = (
  tx: TransactionDetails,
  wallets: string[]
): { token?: Token; recipient?: string } => {
  let recipient: string | undefined;
  let impactedToken: Token | undefined;
  switch (tx.type) {
    case TransactionTypes.transferToken:
      if (wallets.includes(tx.typeData.to.toLowerCase())) {
        recipient = tx.typeData.to;
      }
      impactedToken = tx.typeData.token;
      break;
    case TransactionTypes.swap:
      if (tx.typeData.transferTo && wallets.includes(tx.typeData.transferTo.toLowerCase())) {
        recipient = tx.typeData.transferTo;
      }
      impactedToken = tx.typeData.to;
      break;
    default:
      return {};
  }

  return { token: impactedToken, recipient: recipient?.toLowerCase() };
};
