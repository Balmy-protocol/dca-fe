import React from 'react';
import { Grid, StyledFormContainer } from 'ui-library';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { HACKS_LIST_ROUTE } from '@constants/routes';
import NetWorth from '@common/components/net-worth';

const HacksHomeFrame = () => {
  const [selectedWalletOption, setSelectedWalletOption] = React.useState<WalletOptionValues>(ALL_WALLETS);
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    dispatch(changeRoute(HACKS_LIST_ROUTE.key));
    trackEvent('Hacks - Visit list Page');
  }, []);

  return (
    <StyledFormContainer container rowSpacing={6}>
      <Grid item xs={12}>
        <NetWorth
          walletSelector={{
            options: {
              allowAllWalletsOption: true,
              onSelectWalletOption: setSelectedWalletOption,
              selectedWalletOption,
            },
          }}
        />
      </Grid>
    </StyledFormContainer>
  );
};

export default HacksHomeFrame;
