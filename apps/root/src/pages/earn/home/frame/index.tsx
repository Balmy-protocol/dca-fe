import React from 'react';
import { ContainerBox, StyledNonFormContainer, StyledPageTitleDescription, Typography } from 'ui-library';
import EarnFAQ from '../../components/faq';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { EARN_ROUTE } from '@constants/routes';
import EarnWizard from '../components/wizard';
import useEarnService from '@hooks/earn/useEarnService';
import AllStrategiesTable from '../components/all-strategies-table';
import useHasFetchedAllStrategies from '@hooks/earn/useHasFetchedAllStrategies';
import { FormattedMessage } from 'react-intl';
import OneClickMigrationCard from '../components/one-click-migration-card';
import { useIsEarnMobile } from '@hooks/earn/useIsEarnMobile';
import useAvailableDepositTokens from '@hooks/earn/useAvailableDepositTokens';

const EarnFrame = () => {
  const dispatch = useAppDispatch();
  const earnService = useEarnService();
  const hasFetchedAllStrategies = useHasFetchedAllStrategies();
  const { farmsWithDepositableTokens, updateFarmTokensBalances } = useAvailableDepositTokens();
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

  const isEarnMobile = useIsEarnMobile();

  return (
    <StyledNonFormContainer flexDirection="column" flexWrap="nowrap">
      <ContainerBox flexDirection="column" gap={32}>
        <ContainerBox flexDirection="column" gap={20}>
          <ContainerBox flexDirection="column" gap={5}>
            <ContainerBox gap={2} justifyContent="space-between" flexDirection={isEarnMobile ? 'column' : 'row'}>
              <ContainerBox flexDirection="column" gap={2}>
                <Typography variant="h1Bold">
                  <FormattedMessage defaultMessage="Earn" description="earn.all-strategies.title" />
                </Typography>
                <StyledPageTitleDescription>
                  <FormattedMessage
                    defaultMessage="Time to put your idle crypto to work! With our curated vaults, you can now earn across multiple chains and tokens, protected by expert Guardians. Start earning today with peace of mind."
                    description="earn.all-strategies.title-description"
                  />
                </StyledPageTitleDescription>
              </ContainerBox>
              <OneClickMigrationCard
                farmsWithDepositableTokens={farmsWithDepositableTokens}
                updateFarmTokensBalances={updateFarmTokensBalances}
              />
            </ContainerBox>
            <EarnWizard />
          </ContainerBox>
          <ContainerBox flex="1">
            <AllStrategiesTable
              updateFarmTokensBalances={updateFarmTokensBalances}
              farmsWithDepositableTokens={farmsWithDepositableTokens}
            />
          </ContainerBox>
        </ContainerBox>
        <EarnFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};
export default EarnFrame;
