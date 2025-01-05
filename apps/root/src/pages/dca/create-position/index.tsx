import * as React from 'react';
import { getProtocolToken } from '@common/mocks/tokens';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION, POSITION_VERSION_4, SUPPORTED_NETWORKS_DCA } from '@constants';

import { useCreatePositionState } from '@state/create-position/hooks';
import { useAppDispatch } from '@state/hooks';
import { setDCAChainId, setFrom, setTo } from '@state/create-position/actions';
import { useParams } from 'react-router-dom';
import useYieldOptions from '@hooks/useYieldOptions';
import useToken from '@hooks/useToken';
import Swap from './components/swap';
import DcaLanding from './components/landing';
import { getAllChains } from '@balmy/sdk';
import { identifyNetwork } from '@common/utils/parsing';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useAnalytics from '@hooks/useAnalytics';
import useCurrentNetwork from '@hooks/useCurrentNetwork';

const SwapContainer = () => {
  const { from, to } = useCreatePositionState();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();
  const selectedNetwork = useSelectedNetwork();
  const replaceHistory = useReplaceHistory();
  const { trackEvent } = useAnalytics();
  const { from: fromParam, to: toParam, chainId } = useParams<{ from: string; to: string; chainId: string }>();
  const defaultNetworkParam = React.useMemo(() => {
    const networks = getAllChains();
    const networkToSet = identifyNetwork(networks, chainId);

    if (networkToSet && SUPPORTED_NETWORKS_DCA.includes(networkToSet.chainId)) {
      return networkToSet.chainId;
    } else if (SUPPORTED_NETWORKS_DCA.includes(currentNetwork.chainId)) {
      return DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId;
    }
  }, []);
  const fromParamToken = useToken({
    chainId: defaultNetworkParam,
    tokenAddress: fromParam,
    checkForSymbol: true,
    filterForDca: false,
  });
  const toParamToken = useToken({
    chainId: defaultNetworkParam,
    tokenAddress: toParam,
    checkForSymbol: true,
    filterForDca: false,
  });
  const [yieldOptions, isLoadingYieldOptions] = useYieldOptions(selectedNetwork.chainId);

  React.useEffect(() => {
    if (!from && fromParamToken) {
      dispatch(setFrom(fromParamToken));
    } else if (!from) {
      dispatch(setFrom(getProtocolToken(defaultNetworkParam || selectedNetwork.chainId)));
    }

    if (!to && toParamToken) {
      dispatch(setTo(toParamToken));
    }
  }, [defaultNetworkParam, fromParamToken, toParamToken]);

  React.useEffect(() => {
    if (defaultNetworkParam) {
      dispatch(setDCAChainId(defaultNetworkParam));
    }
  }, []);

  React.useEffect(() => {
    if (selectedNetwork.chainId !== currentNetwork.chainId && !chainId) {
      dispatch(setDCAChainId(currentNetwork.chainId));
    }
  }, [currentNetwork.chainId]);

  const handleChangeNetwork = React.useCallback(
    (newChainId: number) => {
      if (SUPPORTED_NETWORKS_DCA.includes(newChainId)) {
        replaceHistory(`/invest/create/${newChainId}`);
        dispatch(setDCAChainId(newChainId));
        dispatch(setFrom(getProtocolToken(newChainId)));
        dispatch(setTo(null));
        trackEvent('Create position - Change network', { newChainId });
      }
    },
    [replaceHistory, dispatch]
  );

  return (
    <>
      <Swap
        currentNetwork={selectedNetwork || DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION]}
        yieldOptions={yieldOptions || []}
        isLoadingYieldOptions={isLoadingYieldOptions}
        handleChangeNetwork={handleChangeNetwork}
      />
      <DcaLanding />
    </>
  );
};
export default SwapContainer;
