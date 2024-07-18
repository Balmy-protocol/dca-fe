import React from 'react';
import { ContainerBox, StyledNonFormContainer } from 'ui-library';
import EarnFAQ from '../../components/faq';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { EARN_ROUTE } from '@constants/routes';
import AllStrategiesTable from '../components/all-strategies-table';
import EarnWizard from '../components/wizard';

const EarnFrame = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(changeRoute(EARN_ROUTE.key));
  }, []);

  return (
    <StyledNonFormContainer flexDirection="column" flexWrap="nowrap">
      <ContainerBox flexDirection="column" gap={32}>
        <ContainerBox flexDirection="column" gap={20}>
          <EarnWizard />
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
