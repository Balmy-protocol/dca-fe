import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { FullPosition, Permission, Position } from '@types';

export const doesCompanionNeedWithdrawPermission = (position?: Nullable<FullPosition | Position>) => {
  if (!position) {
    return false;
  }

  const toHasYield = position.to.underlyingTokens.length;
  const toIsProtocol = position.to.address === PROTOCOL_TOKEN_ADDRESS;

  return toHasYield || toIsProtocol;
};

export const doesCompanionNeedIncreaseOrReducePermission = (position?: Nullable<FullPosition | Position>) => {
  if (!position) {
    return false;
  }

  const fromHasYield = position.from.underlyingTokens.length;
  const fromIsProtocol = position.from.address === PROTOCOL_TOKEN_ADDRESS;

  return fromHasYield || fromIsProtocol;
};

export const doesCompanionNeedTerminatePermission = (position?: Nullable<FullPosition | Position>) => {
  if (!position) {
    return false;
  }

  const needsIncreaseOrReduce = doesCompanionNeedIncreaseOrReducePermission(position);
  const needsWithdraw = doesCompanionNeedWithdrawPermission(position);

  return needsIncreaseOrReduce || needsWithdraw;
};

export const getCompanionNeededPermisssions = (position?: Nullable<FullPosition | Position>) => {
  if (!position) {
    return [];
  }
  const permissionsNeeded: Permission[] = [];

  const needsIncreaseOrReduce = doesCompanionNeedIncreaseOrReducePermission(position);
  const needsWithdraw = doesCompanionNeedWithdrawPermission(position);
  const needsTerminate = doesCompanionNeedTerminatePermission(position);

  if (needsIncreaseOrReduce) {
    permissionsNeeded.push(Permission.INCREASE);
    permissionsNeeded.push(Permission.REDUCE);
  }

  if (needsWithdraw) {
    permissionsNeeded.push(Permission.WITHDRAW);
  }

  if (needsTerminate) {
    permissionsNeeded.push(Permission.TERMINATE);
  }

  return permissionsNeeded;
};
