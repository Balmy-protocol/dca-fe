import { createAction } from '@reduxjs/toolkit';

export const updateBadgeNumber = createAction<{ viewedTransactions: number }>('application/updateBadgeNumber');
