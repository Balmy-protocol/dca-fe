import { createAction } from '@reduxjs/toolkit';

import { Token, YieldOption } from '@types';
import { ModeTypesIds } from '@constants';

export const setFromValue = createAction<string>('createPosition/setFromValue');

export const setFrom = createAction<Token | null>('createPosition/setFrom');

export const setTo = createAction<Token | null>('createPosition/setTo');

export const setFrequencyType = createAction<bigint>('createPosition/setFrequencyType');

export const setFrequencyValue = createAction<string>('createPosition/setFrequencyValue');

export const setYieldEnabled = createAction<boolean>('createPosition/setYieldEnabled');

export const setFromYield = createAction<YieldOption | null | undefined>('createPosition/setFromYield');

export const setToYield = createAction<YieldOption | null | undefined>('createPosition/setToYield');

export const setRate = createAction<string>('createPosition/setRate');

export const setModeType = createAction<ModeTypesIds>('createPosition/setModeType');

export const setDCAChainId = createAction<number>('createPosition/setDCAChainId');
