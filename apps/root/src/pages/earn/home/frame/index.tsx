import React from 'react';
import { colors, ContainerBox, StyledNonFormContainer, Typography } from 'ui-library';
import EarnFAQ from '../../components/faq';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { EARN_ROUTE } from '@constants/routes';
import EarnWizard from '../components/wizard';
import useEarnService from '@hooks/earn/useEarnService';
import AllStrategiesTable from '../components/all-strategies-table';
import useHasFetchedAllStrategies from '@hooks/earn/useHasFetchedAllStrategies';
import { FormattedMessage } from 'react-intl';

const EarnFrame = () => {
  const dispatch = useAppDispatch();
  const earnService = useEarnService();
  const hasFetchedAllStrategies = useHasFetchedAllStrategies();

  React.useEffect(() => {
    dispatch(changeRoute(EARN_ROUTE.key));
  }, []);

  React.useEffect(() => {
    const fetchStrategies = async () => {
      await earnService.fetchAllStrategies();
    };
    if (!hasFetchedAllStrategies) {
      void fetchStrategies();
    }
  }, []);

  return (
    <StyledNonFormContainer flexDirection="column" flexWrap="nowrap">
      <ContainerBox flexDirection="column" gap={32}>
        <ContainerBox flexDirection="column" gap={20}>
          <ContainerBox flexDirection="column" gap={5}>
            <ContainerBox flexDirection="column" gap={2}>
              <Typography variant="h1Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
                <FormattedMessage defaultMessage="Earn" description="earn.all-strategies.title" />
              </Typography>
              <Typography variant="bodyLargeRegular" color={({ palette }) => colors[palette.mode].typography.typo3}>
                <FormattedMessage
                  defaultMessage="Invest in the best vaults!"
                  description="earn.all-strategies.title-description"
                />
              </Typography>
            </ContainerBox>
            <EarnWizard />
          </ContainerBox>
          <ContainerBox flex="1">
            <AllStrategiesTable />
          </ContainerBox>
        </ContainerBox>
        <EarnFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};
export default EarnFrame;
