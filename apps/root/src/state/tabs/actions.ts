import { createAction } from '@reduxjs/toolkit';

export const changeRoute = createAction<string>('tabs/changeRoute');
export const changeOpenClosePositionTab = createAction<number>('tabs/changeOpenClosePosition');
export const changePositionDetailsTab = createAction<number>('tabs/changePositionDetailsTab');
