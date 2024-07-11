import React from 'react';
import { ContainerBox, StyledNonFormContainer } from 'ui-library';
import EarnFAQ from '../../components/faq';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { EARN_ROUTE } from '@constants/routes';
import AllStrategiesTable from '../components/strategies-table';
import EarnWizard from '../components/wizard';
import useEarnService from '@hooks/earn/useEarnService';
import useFilteredStrategies from '@hooks/earn/useFilteredStrategies';
import { StrategyColumnKeys } from '../components/strategies-table/components/columns';

const EarnFrame = () => {
  const dispatch = useAppDispatch();
  const earnService = useEarnService();
  const { strategies, hasFetchedAllStrategies } = useFilteredStrategies();

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
          <EarnWizard />
          <ContainerBox flex="1">
            <AllStrategiesTable
              defaultOrderBy={StrategyColumnKeys.TVL}
              hasFetchedAllStrategies={hasFetchedAllStrategies}
              strategies={strategies}
            />
          </ContainerBox>
        </ContainerBox>
        <EarnFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};
export default EarnFrame;
