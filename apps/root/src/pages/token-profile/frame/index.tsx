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
import BalanceTable from '../balance-table';
import TokenDistribution from '../token-distribution';
import TokenProfileHeader from '../header';
import Explorers from '../explorers';
import TokenHistory from '../components/token-history';
import MarketStats from '../market-stats';

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

  const token = React.useMemo(() => tokenParam || getProtocolToken(Number(tokenChain) || 1), [tokenParam, tokenChain]);

  return (
    <StyledNonFormContainer>
      <Grid container alignItems="stretch" spacing={8}>
        <Grid item xs={12}>
          <ContainerBox flexDirection="column" gap={6}>
            <BackControl
              onClick={handleGoBack}
              label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
            />
            <TokenProfileHeader token={token} />
          </ContainerBox>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={8}>
              <MarketStats token={token} />
            </Grid>
            <Grid item xs={12} md={4}>
              {/* <Grid container rowSpacing={6}>
                <Grid item xs={12}>
                  // Token Overview: BLY-2748
                </Grid>
                <Grid item xs={12}> */}
              <Explorers token={token} />
              {/* </Grid>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
              <BalanceTable token={token} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TokenDistribution token={token} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TokenHistory token={token} />
        </Grid>
      </Grid>
    </StyledNonFormContainer>
  );
};

export default TokenProfileFrame;
