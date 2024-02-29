import * as React from 'react';
import { getProtocolToken } from '@common/mocks/tokens';
import useCurrentNetwork from '@hooks/useSelectedNetwork';
import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION } from '@constants';

import { useCreatePositionState } from '@state/create-position/hooks';
import { useAppDispatch } from '@state/hooks';
import { setFrom, setTo } from '@state/create-position/actions';
import { useParams } from 'react-router-dom';
import useYieldOptions from '@hooks/useYieldOptions';
import useToken from '@hooks/useToken';
import Swap from './components/swap';

interface SwapContainerProps {
  handleChangeNetwork: (chainId: number) => void;
}

const SwapContainer = ({ handleChangeNetwork }: SwapContainerProps) => {
  const { from } = useCreatePositionState();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();
  const { from: fromParam, to: toParam } = useParams<{ from: string; to: string; chainId: string }>();
  const fromParamToken = useToken(fromParam, true);
  const toParamToken = useToken(toParam, true);
  const [yieldOptions, isLoadingYieldOptions] = useYieldOptions(currentNetwork.chainId, true);

  React.useEffect(() => {
    if (fromParamToken) {
      dispatch(setFrom(fromParamToken));
    } else if (!from) {
      dispatch(setFrom(getProtocolToken(currentNetwork.chainId)));
    }

    if (toParamToken) {
      dispatch(setTo(toParamToken));
    }
  }, [currentNetwork.chainId]);

  return (
    <Swap
      currentNetwork={currentNetwork || DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION]}
      yieldOptions={yieldOptions || []}
      isLoadingYieldOptions={isLoadingYieldOptions}
      handleChangeNetwork={handleChangeNetwork}
    />
  );
};
export default SwapContainer;
