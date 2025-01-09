import { EARN_ROUTE } from '@constants/routes';
import usePushToHistory from '@hooks/usePushToHistory';
import useAnalytics from '@hooks/useAnalytics';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Button, ChartEmoji, ContainerBox, SPACING, Typography } from 'ui-library';

const StyledEmptyPortfolioContent = styled(ContainerBox).attrs({
  flexDirection: 'column',
  gap: 6,
  alignItems: 'center',
  justifyContent: 'center',
})<{ $contained?: boolean }>`
  ${({ $contained }) => $contained && `position: absolute; height: 100%;`}
  padding: ${({ theme: { spacing } }) => spacing(10)} 0;
`;

const EmptyPortfolio = ({ contained = false }: { contained?: boolean }) => {
  const pushToHistory = usePushToHistory();
  const { trackEvent } = useAnalytics();

  const onExploreVaults = () => {
    pushToHistory(`/${EARN_ROUTE.key}`);
    trackEvent('Earn Portfolio Empty - Go to Explore Vaults');
  };

  return (
    <StyledEmptyPortfolioContent $contained={contained}>
      <ContainerBox flexDirection="column" gap={2} alignItems="center" style={{ maxWidth: SPACING(90) }}>
        <Typography variant="h5Bold">
          <ChartEmoji />
        </Typography>
        <Typography variant="h5Bold">
          <FormattedMessage
            defaultMessage="Don't miss out on earning potential!"
            description="earn.portfolio.table.empty.title"
          />
        </Typography>
        <Typography variant="bodyRegular">
          <FormattedMessage
            defaultMessage="Start investing today and see your assets grow with powerful yield strategies tailored to you."
            description="earn.portfolio.table.empty.subtitle"
          />
        </Typography>
      </ContainerBox>
      <Button variant="contained" size="large" onClick={onExploreVaults}>
        <FormattedMessage defaultMessage="Explore Vaults" description="earn.portfolio.table.empty.explore" />
      </Button>
    </StyledEmptyPortfolioContent>
  );
};

export default EmptyPortfolio;
