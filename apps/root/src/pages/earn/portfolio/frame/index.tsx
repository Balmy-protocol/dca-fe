import React from 'react';
import { colors, ContainerBox, StyledNonFormContainer, Typography } from 'ui-library';
import EarnFAQ from '../../components/faq';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { EARN_PORTFOLIO } from '@constants/routes';
import EarnPortfolioFinancialData from '../components/financial-data';
import EarnPositionsTable from '../components/earn-positions-table';
import { FormattedMessage } from 'react-intl';

const EarnPortfolioFrame = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(changeRoute(EARN_PORTFOLIO.key));
  }, []);

  return (
    <StyledNonFormContainer flexDirection="column" flexWrap="nowrap">
      <ContainerBox flexDirection="column" gap={32}>
        <ContainerBox flexDirection="column" gap={5}>
          <ContainerBox flexDirection="column" gap={2}>
            <Typography variant="h1Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
              <FormattedMessage defaultMessage="Portfolio" description="earn.portfolio.title" />
            </Typography>
            <Typography variant="bodyLargeRegular" color={({ palette }) => colors[palette.mode].typography.typo3}>
              <FormattedMessage
                defaultMessage="This is your portfolio!"
                description="earn.portfolio.title-description"
              />
            </Typography>
          </ContainerBox>
          <ContainerBox flexDirection="column" gap={16}>
            <EarnPortfolioFinancialData />
            <EarnPositionsTable />
          </ContainerBox>
        </ContainerBox>
        <EarnFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};
export default EarnPortfolioFrame;