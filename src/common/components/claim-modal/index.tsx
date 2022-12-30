import React from 'react';
import Modal from 'common/modal';
import Button from 'common/button';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import Typography from '@mui/material/Typography';
import ArrowRight from 'assets/svg/atom/arrow-right';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import useClaimableCampaigns from 'hooks/useClaimableCampaigns';
import { Campaign } from 'types';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import TokenIcon from 'common/token-icon';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { formatCurrencyAmount } from 'utils/currency';

const StyledContent = styled.div`
  background-color: #333333;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
`;

const StyledClaimContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  flex: 1;
`;

const StyledCampaignSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledTokensContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

interface ClaimItemProps {
  campaign: Campaign;
}

const ClaimItem = ({ campaign }: ClaimItemProps) => (
  <StyledContent>
    <StyledCampaignSection>
      <Typography variant="h6">{campaign.title}</Typography>

      <Typography
        variant="body2"
        color="rgba(255, 255, 255, 0.5)"
        sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}
      >
        <HelpOutlineOutlinedIcon fontSize="inherit" />
        <FormattedMessage
          description="claimModal expires"
          defaultMessage="Expires on {date}"
          values={{
            date: DateTime.fromSeconds(Number(campaign.expiresOn)).toLocaleString(DateTime.DATE_MED),
          }}
        />
      </Typography>
    </StyledCampaignSection>
    <StyledCampaignSection>
      <StyledTokensContainer>
        <TokenIcon token={campaign.tokens[0]} />
        <Typography variant="h6">
          {formatCurrencyAmount(campaign.tokens[0].balance, campaign.tokens[0])} {campaign.tokens[0].symbol}
        </Typography>
        <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
          ${campaign.tokens[0].balanceUSD.toFixed(2)}
        </Typography>
      </StyledTokensContainer>
      <Button variant="text" color="secondary">
        <FormattedMessage description="claimModal claim" defaultMessage="Claim" />
        <ArrowRight size="inherit" fill="inherit" />
      </Button>
    </StyledCampaignSection>
  </StyledContent>
);

interface ClaimModalProps {
  onCancel: () => void;
  open: boolean;
}

const ClaimModal = ({ open, onCancel }: ClaimModalProps) => {
  const [campaigns, isLoadingCampaigns] = useClaimableCampaigns();
  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      showCloseIcon
      maxWidth="sm"
      title={<FormattedMessage description="claimModal title" defaultMessage="Claim campaigns" />}
      actions={[]}
    >
      <StyledClaimContainer>
        <Grid container alignItems="stretch" rowSpacing={2}>
          {isLoadingCampaigns && !campaigns && <CenteredLoadingIndicator />}
          {campaigns &&
            !!campaigns.length &&
            campaigns.map((campaign) => (
              <Grid item xs={12}>
                <ClaimItem campaign={campaign} />
              </Grid>
            ))}
          {campaigns && !campaigns.length && (
            <StyledContent>
              <FormattedMessage description="claimModal noCampaigns" defaultMessage="No campaigns to claim" />
            </StyledContent>
          )}
        </Grid>
      </StyledClaimContainer>
    </Modal>
  );
};
export default ClaimModal;
