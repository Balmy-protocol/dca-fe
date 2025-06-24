import React from 'react';
import useAnalyticsService from './useAnalyticsService';
import AnalyticsService from '../services/analyticsService';

function useAnalytics() {
  const analyticsService = useAnalyticsService();

  const trackEvent = React.useCallback(
    (action: string, extraData?: Record<string | number, unknown>) => {
      try {
        void analyticsService.trackEvent(action, extraData);
      } catch {}
    },
    [analyticsService]
  );

  const trackPositionModified = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackPositionModified']>[0]) => {},
    [analyticsService]
  );

  const trackPositionTerminated = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackPositionTerminated']>[0]) => {},
    [analyticsService]
  );

  const trackSlippageChanged = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackSlippageChanged']>[0]) => {
      // analyticsService.trackSlippageChanged(props);
    },
    [analyticsService]
  );

  const trackGasSpeedChanged = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackGasSpeedChanged']>[0]) => {
      // analyticsService.trackGasSpeedChanged(props);
    },
    [analyticsService]
  );

  const trackSourceTimeoutChanged = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackSourceTimeoutChanged']>[0]) => {
      // analyticsService.trackSourceTimeoutChanged(props);
    },
    [analyticsService]
  );

  const trackQuoteSortingChanged = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackQuoteSortingChanged']>[0]) => {
      // analyticsService.trackQuoteSortingChanged(props);
    },
    [analyticsService]
  );

  const trackPermit2Enabled = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackPermit2Enabled']>[0]) => {
      // analyticsService.trackPermit2Enabled(props);
    },
    [analyticsService]
  );

  const trackDefaultSettingsChanged = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackDefaultSettingsChanged']>[0]) => {
      // analyticsService.trackDefaultSettingsChanged(props);
    },
    [analyticsService]
  );

  const trackSwap = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackSwap']>[0]) => {
      // analyticsService.trackSwap(props);
    },
    [analyticsService]
  );

  const trackDcaCreatePosition = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackDcaCreatePosition']>[0]) => {
      // analyticsService.trackDcaCreatePosition(props);
    },
    [analyticsService]
  );

  const trackEarnDeposit = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackEarnDeposit']>[0]) => {
      // analyticsService.trackEarnDeposit(props);
    },
    [analyticsService]
  );

  const trackEarnWithdraw = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackEarnWithdraw']>[0]) => {
      // analyticsService.trackEarnWithdraw(props);
    },
    [analyticsService]
  );

  const trackTransfer = React.useCallback(
    // @ts-expect-error - this is a mock
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (props: Parameters<AnalyticsService['trackTransfer']>[0]) => {
      // analyticsService.trackTransfer(props);
    },
    [analyticsService]
  );

  return React.useMemo(
    () => ({
      trackEvent,
      trackPositionModified,
      trackPositionTerminated,
      trackSlippageChanged,
      trackGasSpeedChanged,
      trackSourceTimeoutChanged,
      trackQuoteSortingChanged,
      trackPermit2Enabled,
      trackDefaultSettingsChanged,
      trackSwap,
      trackDcaCreatePosition,
      trackEarnDeposit,
      trackEarnWithdraw,
      trackTransfer,
    }),
    [
      trackEvent,
      trackPositionModified,
      trackPositionTerminated,
      trackSlippageChanged,
      trackGasSpeedChanged,
      trackSourceTimeoutChanged,
      trackQuoteSortingChanged,
      trackPermit2Enabled,
      trackDefaultSettingsChanged,
      trackSwap,
      trackDcaCreatePosition,
      trackEarnDeposit,
      trackEarnWithdraw,
      trackTransfer,
    ]
  );
}

export default useAnalytics;
