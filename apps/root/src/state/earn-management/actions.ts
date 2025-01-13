import { createAction } from '@reduxjs/toolkit';

import { Token } from '@types';

export const setAsset = createAction<Token>('earnPositionManagement/setAsset');

export const setDepositAmount = createAction<string>('earnPositionManagement/setDepositAmount');

export const setWithdrawAmount = createAction<string>('earnPositionManagement/setWithdrawAmount');

export const setWithdrawRewards = createAction<boolean>('earnPositionManagement/setWithdrawRewards');

export const resetEarnForm = createAction('earnPositionManagement/resetEarnForm');

export const fullyResetEarnForm = createAction('earnPositionManagement/fullyResetEarnForm');

export const setDepositAssetAmount = createAction<string>('earnPositionManagement/setDepositAssetAmount');

export const setDepositAsset = createAction<Token>('earnPositionManagement/setDepositAsset');

export const setOneClickMigrationSettings = createAction<{
  paramAssetToDeposit: Token;
  paramUnderlyingAsset: Token;
  paramUnderlyingAmount: string;
  depositAmount: string;
}>('earnPositionManagement/setOneClickMigrationSettings');

export const setTriggerSteps = createAction<boolean>('earnPositionManagement/setTriggerSteps');
