import React from 'react';
import { ContainerBox, StyledNonFormContainer, StyledPageTitleDescription, Typography } from 'ui-library';
import EarnFAQ from '../../components/faq';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { EARN_PORTFOLIO } from '@constants/routes';
import EarnPortfolioFinancialData from '../components/financial-data';
import EarnPositionsTable from '../components/earn-positions-table';
import { FormattedMessage } from 'react-intl';
import useEarnPositions from '@hooks/earn/useEarnPositions';

const EarnPortfolioFrame = () => {
  const dispatch = useAppDispatch();
  const { userStrategies, hasFetchedUserStrategies } = useEarnPositions();

  React.useEffect(() => {
    dispatch(changeRoute(EARN_PORTFOLIO.key));
  }, []);

  const activeUserStrategies = React.useMemo(
    () => userStrategies.filter((strategy) => strategy.balances.some((balance) => balance.amount.amount > 0n)),
    [userStrategies]
  );

  return (
    <StyledNonFormContainer flexDirection="column" flexWrap="nowrap">
      <ContainerBox flexDirection="column" gap={32}>
        <ContainerBox flexDirection="column" gap={5}>
          <ContainerBox flexDirection="column" gap={2}>
            <Typography variant="h1Bold">
              <FormattedMessage defaultMessage="Portfolio" description="earn.portfolio.title" />
            </Typography>
            <StyledPageTitleDescription>
              <FormattedMessage
                defaultMessage="Track your investments and see how your crypto has worked for you over time at a glance."
                description="earn.portfolio.title-description"
              />
            </StyledPageTitleDescription>
          </ContainerBox>
          <ContainerBox flexDirection="column" gap={16}>
            <EarnPortfolioFinancialData />
            <EarnPositionsTable isLoading={!hasFetchedUserStrategies} userStrategies={activeUserStrategies} />
          </ContainerBox>
        </ContainerBox>
        <EarnFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};
export default EarnPortfolioFrame;
