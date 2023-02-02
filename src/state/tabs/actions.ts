import { createAction } from '@reduxjs/toolkit';

export const changeMainTab = createAction<number>('tabs/changeMainTab');
export const changeSubTab = createAction<number>('tabs/changeSubTab');
export const changeOpenClosePositionTab = createAction<number>('tabs/changeOpenClosePosition');
export const changePositionDetailsTab = createAction<number>('tabs/changePositionDetailsTab');
