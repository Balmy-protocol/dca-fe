import * as React from 'react';
import Grid from '@mui/material/Grid';
import orderBy from 'lodash/orderBy';
import { getProtocolToken } from '@common/mocks/tokens';
import Hidden from '@mui/material/Hidden';
import useCurrentNetwork from '@hooks/useSelectedNetwork';
import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION, shouldEnableFrequency, STRING_SWAP_INTERVALS } from '@constants';
import { GetSwapIntervalsGraphqlResponse } from '@types';
import { BigNumber } from 'ethers';
import { useCreatePositionState } from '@state/create-position/hooks';
import { useAppDispatch } from '@state/hooks';
import { setFrom, setTo } from '@state/create-position/actions';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import useYieldOptions from '@hooks/useYieldOptions';
import useToken from '@hooks/useToken';
import Swap from './components/swap';
import GraphWidget from './components/graph-widget';

interface SwapContainerProps {
  swapIntervalsData?: GetSwapIntervalsGraphqlResponse;
  handleChangeNetwork: (chainId: number) => void;
}

const SwapContainer = ({ swapIntervalsData, handleChangeNetwork }: SwapContainerProps) => {
  const { from, to } = useCreatePositionState();
  const dispatch = useAppDispatch();
  const intl = useIntl();
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

  const availableFrequencies =
    (swapIntervalsData &&
      orderBy(swapIntervalsData.swapIntervals, [(swapInterval) => parseInt(swapInterval.interval, 10)], ['asc'])
        .filter((swapInterval) =>
          shouldEnableFrequency(swapInterval.interval, from?.address, to?.address, currentNetwork.chainId)
        )
        .map((swapInterval) => ({
          label: {
            singular: intl.formatMessage(
              STRING_SWAP_INTERVALS[swapInterval.interval.toString() as keyof typeof STRING_SWAP_INTERVALS].singular
            ),
            adverb: intl.formatMessage(
              STRING_SWAP_INTERVALS[swapInterval.interval.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb
            ),
          },
          value: BigNumber.from(swapInterval.interval),
        }))) ||
    [];

  return (
    <Grid container spacing={2} alignItems="flex-start" justifyContent="space-around" alignSelf="flex-start">
      <Grid item xs={12} md={5}>
        <Swap
          currentNetwork={currentNetwork || DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION]}
          yieldOptions={yieldOptions || []}
          isLoadingYieldOptions={isLoadingYieldOptions}
          availableFrequencies={availableFrequencies}
          handleChangeNetwork={handleChangeNetwork}
        />
      </Grid>
      <Hidden mdDown>
        <Grid item xs={7} style={{ flexGrow: 1, alignSelf: 'stretch', display: 'flex' }}>
          <GraphWidget withFooter />
        </Grid>
      </Hidden>
    </Grid>
  );
};
export default SwapContainer;
