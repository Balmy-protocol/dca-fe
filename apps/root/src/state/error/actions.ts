import { createAction } from '@reduxjs/toolkit';

export const setError = createAction<{ error: Error } | null>('error/setError');
