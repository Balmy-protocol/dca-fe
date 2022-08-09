import { createAction } from '@reduxjs/toolkit';
import { BigNumber } from 'ethers';
import { Token, YieldOption } from 'types';

export const setFromValue = createAction<string>('createPosition/setFromValue');

export const setFrom = createAction<Token | null>('createPosition/setFrom');

export const setTo = createAction<Token | null>('createPosition/setTo');

export const setFrequencyType = createAction<BigNumber>('createPosition/setFrequencyType');

export const setFrequencyValue = createAction<string>('createPosition/setFrequencyValue');

export const setYieldEnabled = createAction<boolean>('createPosition/setYieldEnabled');

export const setFromYield = createAction<YieldOption | null | undefined>('createPosition/setFromYield');

export const setToYield = createAction<YieldOption | null | undefined>('createPosition/setToYield');
