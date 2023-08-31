import React from 'react';
import styled from 'styled-components';
import some from 'lodash/some';
import Button from '@common/components/button';
import { FormattedMessage } from 'react-intl';
import useClaimableCampaigns from '@hooks/useClaimableCampaigns';
import WhaveLogoDark from '@assets/logo/wave_logo_dark';
import Typography from '@mui/material/Typography';
import ClaimModal from '@common/components/claim-modal';
import Badge from '@mui/material/Badge';
import { withStyles } from 'tss-react/mui';
import { createStyles } from '@mui/material/styles';

const StyledMeanLogoContainer = styled.div`
  background: black;
  display: flex;
  border-radius: 20px;
  padding: 5px;
`;

const StyledBadge = withStyles(Badge, () =>
  createStyles({
    root: {
      marginRight: '10px',
    },
    badge: {
      color: 'white',
      marginRight: '2px',
      marginTop: '2px',
    },
  })
);

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
  padding: 4px 8px;
  gap: 5px;
`;

const ClaimButton = () => {
  const [shouldShowClaimModal, setShouldShowClaimModal] = React.useState(false);
  const [campaigns, isLoadingCampaigns] = useClaimableCampaigns();

  const hasUnclaimedCampaigns = some(campaigns, (campaign) => !campaign.claimed);

  return (
    <>
      <ClaimModal
        open={shouldShowClaimModal}
        campaigns={campaigns}
        isLoadingCampaigns={isLoadingCampaigns}
        onCancel={() => setShouldShowClaimModal(false)}
      />
      <StyledBadge showZero={false} badgeContent={hasUnclaimedCampaigns ? ' ' : 0} variant="dot" color="secondary">
        <StyledButton variant="outlined" size="small" color="transparent" onClick={() => setShouldShowClaimModal(true)}>
          <StyledMeanLogoContainer>
            <WhaveLogoDark size="13px" />
          </StyledMeanLogoContainer>
          <Typography variant="body1">
            <FormattedMessage description="claimButton" defaultMessage="Claim" />
          </Typography>
        </StyledButton>
      </StyledBadge>
    </>
  );
};

export default ClaimButton;
