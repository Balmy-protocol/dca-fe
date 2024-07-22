import React from 'react';
import useTrackEvent from '@hooks/useTrackEvent';
import { BackControl, ContainerBox, Grid, StyledNonFormContainer } from 'ui-library';
import { DASHBOARD_ROUTE } from '@constants/routes';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { useParams } from 'react-router-dom';
import { defineMessage, useIntl } from 'react-intl';
import useToken from '@hooks/useToken';
import { getProtocolToken } from '@common/mocks/tokens';
import { identifyNetwork } from '@common/utils/parsing';
import { getAllChains } from '@balmy/sdk';

const TokenProfileFrame = () => {
  const replaceHistory = useReplaceHistory();
  const trackEvent = useTrackEvent();
  const intl = useIntl();
  const { tokenListId } = useParams<{ tokenListId: string }>();
  const [tokenChain, tokenAddress] = (tokenListId || '').split('-');
  const network = React.useMemo(() => {
    const networks = getAllChains();
    return identifyNetwork(networks, tokenChain);
  }, [tokenChain]);

  // tokenChain can be a chainId, a networkName, a tokenAddres or a tokenSymbol
  const tokenParam = useToken({
    chainId: network?.chainId,
    tokenAddress: tokenAddress || tokenChain,
    checkForSymbol: true,
    filterForDca: false,
  });

  React.useEffect(() => {
    trackEvent('Home - Visit Token Profile', { tokenListId });
  }, []);

  const handleGoBack = () => {
    replaceHistory(`/${DASHBOARD_ROUTE.key}`);
  };

  const token = tokenParam || getProtocolToken(Number(tokenChain) || 1);

  return (
    <StyledNonFormContainer>
      <Grid container direction="column" alignItems="stretch" spacing={8}>
        <Grid item xs={12}>
          <ContainerBox flexDirection="column" gap={6}>
            <BackControl
              onClick={handleGoBack}
              label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
            />
            {token.symbol}
            {/* // Header: BLY-2746 */}
          </ContainerBox>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={8}>
              {/* // Graph with market stats: BLY-2747 */}
            </Grid>
            <Grid item xs={12} md={4}>
              {/* // Token Overview and explorers: (BLY-2748 & BLY-2750) */}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={8}>
              {/* // Balances table: BLY-2752 */}
            </Grid>
            <Grid item xs={12} md={4}>
              {/* // Token Distribution: (BLY-2751) */}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {/* // History table (BLY-2753) */}
        </Grid>
      </Grid>
    </StyledNonFormContainer>
  );
};

export default TokenProfileFrame;
