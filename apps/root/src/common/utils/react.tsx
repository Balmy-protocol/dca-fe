import { ComponentType, memo } from 'react';
import isEqual from 'lodash/isEqual';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoWithDeepComparison = <T extends ComponentType<any>>(Component: T): ReturnType<typeof memo<T>> =>
  memo(Component, isEqual);
