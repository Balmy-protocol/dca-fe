import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';
import { shallowEqual } from 'react-redux';

export function useRoute() {
  const { currentRoute, prevRoute } = useAppSelector(
    (state: RootState) => ({
      currentRoute: state.tabs.currentRoute,
      prevRoute: state.tabs.prevRoute,
    }),
    shallowEqual
  );
  return { currentRoute, prevRoute };
}

export function useOpenClosePositionTab() {
  return useAppSelector((state: RootState) => state.tabs.openClosedPositions);
}
