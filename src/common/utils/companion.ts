import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { FullPosition, Permission, Position } from '@types';

export const getCompanionNeedsWithdraw = (position?: Nullable<FullPosition | Position>) => {
  if (!position) {
    return false;
  }

  const toHasYield = position.to.underlyingTokens.length;
  const toIsProtocol = position.to.address === PROTOCOL_TOKEN_ADDRESS;

  if (toHasYield || toIsProtocol) {
    return true;
  }

  return false;
};

export const getCompanionNeedsIncreaseOrReduce = (position?: Nullable<FullPosition | Position>) => {
  if (!position) {
    return false;
  }

  const fromHasYield = position.from.underlyingTokens.length;
  const fromIsProtocol = position.from.address === PROTOCOL_TOKEN_ADDRESS;

  if (fromHasYield || fromIsProtocol) {
    return true;
  }

  return false;
};

export const getCompanionNeedsTerminate = (position?: Nullable<FullPosition | Position>) => {
  if (!position) {
    return false;
  }

  const needsIncreaseOrReduce = getCompanionNeedsIncreaseOrReduce(position);
  const needsWithdraw = getCompanionNeedsWithdraw(position);

  if (needsIncreaseOrReduce || needsWithdraw) {
    return true;
  }

  return false;
};

export const getCompanionNeededPermisssions = (position?: Nullable<FullPosition | Position>) => {
  if (!position) {
    return [];
  }
  const permissionsNeeded: Permission[] = [];

  const needsIncreaseOrReduce = getCompanionNeedsIncreaseOrReduce(position);
  const needsWithdraw = getCompanionNeedsWithdraw(position);
  const needsTerminate = getCompanionNeedsTerminate(position);

  if (needsIncreaseOrReduce) {
    permissionsNeeded.push(Permission.increase);
    permissionsNeeded.push(Permission.reduce);
  }

  if (needsWithdraw) {
    permissionsNeeded.push(Permission.withdraw);
  }

  if (needsTerminate) {
    permissionsNeeded.push(Permission.terminate);
  }

  return permissionsNeeded;
};
