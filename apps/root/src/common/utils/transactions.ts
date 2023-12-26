import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import {
  Positions,
  Token,
  TransactionDetails,
  TransactionEvent,
  TransactionEventTypes,
  TransactionTypes,
} from '@types';
import { Address, maxUint256 } from 'viem';

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
        if (BigInt(tx.typeData.remainingLiquidity) !== 0n) {
          tokensToUpdate.push(terminatedPosition.from);
        }
        if (BigInt(tx.typeData.toWithdraw) !== 0n) {
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

export const parseTxToTxEventHistory = (tx: TransactionDetails): TransactionEvent | undefined => {
  if (tx.type === TransactionTypes.approveTokenExact) {
    return {
      type: TransactionEventTypes.ERC20_APPROVAL,
      amount: tx.typeData.amount,
      chainId: tx.chainId,
      nativePrice: 0,
      owner: tx.from as Address,
      spender: tx.typeData.addressFor as Address,
      spentInGas: '0',
      timestamp: tx.confirmedTime || Date.now(),
      token: tx.typeData.token.address,
      txHash: tx.hash as Address,
    };
  } else if (tx.type === TransactionTypes.approveToken) {
    return {
      type: TransactionEventTypes.ERC20_APPROVAL,
      amount: (maxUint256 - 1n).toString(),
      chainId: tx.chainId,
      nativePrice: 0,
      owner: tx.from as Address,
      spender: tx.typeData.addressFor as Address,
      spentInGas: '0',
      timestamp: tx.confirmedTime || Date.now(),
      token: tx.typeData.token.address,
      txHash: tx.hash as Address,
    };
  } else if (tx.type === TransactionTypes.transferToken && tx.typeData.token === getProtocolToken(tx.chainId)) {
    return {
      type: TransactionEventTypes.ERC20_TRANSFER,
      amount: tx.typeData.amount,
      chainId: tx.chainId,
      nativePrice: 0,
      spentInGas: '0',
      timestamp: tx.confirmedTime || Date.now(),
      token: tx.typeData.token.address,
      txHash: tx.hash as Address,
      from: tx.from as Address,
      to: tx.typeData.to as Address,
      tokenPrice: 0,
    };
  } else if (tx.type === TransactionTypes.transferToken) {
    return {
      type: TransactionEventTypes.ERC20_TRANSFER,
      amount: tx.typeData.amount,
      chainId: tx.chainId,
      nativePrice: 0,
      spentInGas: '0',
      timestamp: tx.confirmedTime || Date.now(),
      token: tx.typeData.token.address,
      txHash: tx.hash as Address,
      from: tx.from as Address,
      to: tx.typeData.to as Address,
      tokenPrice: 0,
    };
  }
  return;
};
