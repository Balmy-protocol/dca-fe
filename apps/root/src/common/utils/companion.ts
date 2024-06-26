import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { DCAPermission } from '@balmy/sdk';
import { Position } from '@types';

export const doesCompanionNeedWithdrawPermission = (position?: Nullable<Position>) => {
  if (!position) {
    return false;
  }

  const toHasYield = position.to.underlyingTokens.length;
  const toIsProtocol = position.to.address === PROTOCOL_TOKEN_ADDRESS;

  return toHasYield || toIsProtocol;
};

export const doesCompanionNeedIncreaseOrReducePermission = (position?: Nullable<Position>) => {
  if (!position) {
    return false;
  }

  const fromHasYield = position.from.underlyingTokens.length;
  const fromIsProtocol = position.from.address === PROTOCOL_TOKEN_ADDRESS;

  return fromHasYield || fromIsProtocol;
};

export const doesCompanionNeedTerminatePermission = (position?: Nullable<Position>) => {
  if (!position) {
    return false;
  }

  const needsIncreaseOrReduce = doesCompanionNeedIncreaseOrReducePermission(position);
  const needsWithdraw = doesCompanionNeedWithdrawPermission(position);

  return needsIncreaseOrReduce || needsWithdraw;
};

export const getCompanionNeededPermisssions = (position?: Nullable<Position>) => {
  if (!position) {
    return [];
  }
  const permissionsNeeded: DCAPermission[] = [];

  const needsIncreaseOrReduce = doesCompanionNeedIncreaseOrReducePermission(position);
  const needsWithdraw = doesCompanionNeedWithdrawPermission(position);
  const needsTerminate = doesCompanionNeedTerminatePermission(position);

  if (needsIncreaseOrReduce) {
    permissionsNeeded.push(DCAPermission.INCREASE);
    permissionsNeeded.push(DCAPermission.REDUCE);
  }

  if (needsWithdraw) {
    permissionsNeeded.push(DCAPermission.WITHDRAW);
  }

  if (needsTerminate) {
    permissionsNeeded.push(DCAPermission.TERMINATE);
  }

  return permissionsNeeded;
};
