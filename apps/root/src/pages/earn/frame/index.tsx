import React from 'react';
import { Box, ContainerBox, StyledNonFormContainer } from 'ui-library';
import NetWorth from '@common/components/net-worth';
import EarnFAQ from '../components/faq';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { EARN_ROUTE } from '@constants/routes';

const DummyWizzardCta = () => (
  <Box padding={8} sx={{ background: 'green' }}>
    Wizard CTA
  </Box>
);
const DummyTable = () => <Box sx={{ background: 'green' }}>Table</Box>;

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
            <DummyTable />
          </ContainerBox>
        </ContainerBox>
        <EarnFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};
export default EarnFrame;
