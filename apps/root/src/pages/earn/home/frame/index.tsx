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
import { setOrderBy } from '@state/all-strategies-filters/actions';
import { useAllStrategiesFilters } from '@state/all-strategies-filters/hooks';

const EarnFrame = () => {
  const dispatch = useAppDispatch();
  const earnService = useEarnService();
  const { strategies, hasFetchedAllStrategies } = useFilteredStrategies();
  const { orderBy } = useAllStrategiesFilters();

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

  const onSortChange = (property: StrategyColumnKeys) => {
    const isAsc = orderBy.column === property && orderBy.order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    dispatch(setOrderBy({ column: property, order: newOrder }));
  };

  return (
    <StyledNonFormContainer flexDirection="column" flexWrap="nowrap">
      <ContainerBox flexDirection="column" gap={32}>
        <ContainerBox flexDirection="column" gap={20}>
          <EarnWizard />
          <ContainerBox flex="1">
            <AllStrategiesTable
              isLoading={!hasFetchedAllStrategies}
              strategies={strategies}
              onSortChange={onSortChange}
              orderBy={orderBy}
            />
          </ContainerBox>
        </ContainerBox>
        <EarnFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};
export default EarnFrame;
