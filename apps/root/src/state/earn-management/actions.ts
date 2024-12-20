import { createAction } from '@reduxjs/toolkit';

import { Token } from '@types';

export const setAsset = createAction<Token>('earnPositionManagement/setAsset');

export const setDepositAmount = createAction<string>('earnPositionManagement/setDepositAmount');

export const setWithdrawAmount = createAction<string>('earnPositionManagement/setWithdrawAmount');

export const setWithdrawRewards = createAction<boolean>('earnPositionManagement/setWithdrawRewards');

export const resetEarnForm = createAction('earnPositionManagement/resetEarnForm');
