import React from 'react';
import styled from 'styled-components';
import Button from '@common/components/button';
import { FormattedMessage } from 'react-intl';
import WhaveLogoDark from 'assets/logo/wave_logo_dark';
import Typography from '@mui/material/Typography';
import ClaimModal from '@common/components/claim-modal';

const StyledMeanLogoContainer = styled.div`
  background: black;
  display: flex;
  border-radius: 20px;
  padding: 5px;
`;

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.302), 0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
  margin-right: 10px;
  padding: 4px 8px;
  gap: 5px;
`;

const ClaimButton = () => {
  const [shouldShowClaimModal, setShouldShowClaimModal] = React.useState(false);

  return (
    <>
      <ClaimModal open={shouldShowClaimModal} onCancel={() => setShouldShowClaimModal(false)} />
      <StyledButton variant="outlined" color="transparent" onClick={() => setShouldShowClaimModal(true)}>
        <StyledMeanLogoContainer>
          <WhaveLogoDark size="16px" />
        </StyledMeanLogoContainer>
        <Typography variant="body1">
          <FormattedMessage description="claimButton" defaultMessage="Claim" />
        </Typography>
      </StyledButton>
    </>
  );
};

export default ClaimButton;
