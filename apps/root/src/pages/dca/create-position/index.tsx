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
import DcaLanding from './components/landing';

interface SwapContainerProps {
  handleChangeNetwork: (chainId: number) => void;
}

const SwapContainer = ({ handleChangeNetwork }: SwapContainerProps) => {
  const { from } = useCreatePositionState();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();
  const { from: fromParam, to: toParam, chainId } = useParams<{ from: string; to: string; chainId: string }>();
  const fromParamToken = useToken({
    chainId: currentNetwork.chainId,
    tokenAddress: fromParam,
    checkForSymbol: true,
    filterForDca: false,
  });
  const toParamToken = useToken({
    chainId: currentNetwork.chainId,
    tokenAddress: toParam,
    checkForSymbol: true,
    filterForDca: false,
  });
  const [yieldOptions, isLoadingYieldOptions] = useYieldOptions(currentNetwork.chainId);

  React.useEffect(() => {
    if (fromParamToken) {
      dispatch(setFrom(fromParamToken));
    } else if (!from) {
      dispatch(setFrom(getProtocolToken(Number(chainId) || currentNetwork.chainId)));
    }

    if (toParamToken) {
      dispatch(setTo(toParamToken));
    }
  }, [currentNetwork.chainId]);

  return (
    <>
      <Swap
        currentNetwork={currentNetwork || DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION]}
        yieldOptions={yieldOptions || []}
        isLoadingYieldOptions={isLoadingYieldOptions}
        handleChangeNetwork={handleChangeNetwork}
      />
      <DcaLanding />
    </>
  );
};
export default SwapContainer;
