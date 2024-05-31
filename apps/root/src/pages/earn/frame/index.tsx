import React from 'react';
import { Box, ContainerBox, StyledNonFormContainer } from 'ui-library';
import NetWorth from '@common/components/net-worth';
import EarnFAQ from '../components/faq';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { EARN_ROUTE } from '@constants/routes';
import AllStrategiesTable from '../components/all-strategies-table';

const DummyWizzardCta = () => (
  <Box padding={8} sx={{ background: 'green' }}>
    Wizard CTA
  </Box>
);

const EarnFrame = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(changeRoute(EARN_ROUTE.key));
  }, []);

  return (
    <StyledNonFormContainer flexDirection="column" flexWrap="nowrap">
      <ContainerBox flexDirection="column" gap={32}>
        <ContainerBox flexDirection="column" gap={8}>
          <ContainerBox flexDirection="column" gap={5}>
            <NetWorth walletSelector={{ options: { setSelectionAsActive: true } }} />
            <DummyWizzardCta />
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
