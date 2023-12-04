import React from 'react';
import styled from 'styled-components';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount } from '@common/utils/currency';
import { Campaign } from '@types';
import { DateTime } from 'luxon';
import { Typography, HelpOutlineOutlinedIcon, Button } from 'ui-library';
import ArrowRight from '@assets/svg/atom/arrow-right';
import { FormattedMessage } from 'react-intl';

const StyledContent = styled.div`
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
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

const StyledAmountContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface ClaimItemProps {
  campaign: Campaign;
}

const ClaimItem = ({ campaign }: ClaimItemProps) => (
  <StyledContent>
    <StyledCampaignSection>
      <Typography variant="h6">{campaign.title}</Typography>
      {campaign.expiresOn && (
        <Typography
          variant="bodySmall"
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
      )}
    </StyledCampaignSection>
    <StyledCampaignSection>
      <StyledTokensContainer>
        <TokenIcon token={campaign.tokens[0]} />
        <StyledAmountContainer>
          <Typography variant="body">
            {formatCurrencyAmount(campaign.tokens[0].balance, campaign.tokens[0])} {campaign.tokens[0].symbol}
          </Typography>
          <Typography variant="bodySmall" color="rgba(255, 255, 255, 0.5)">
            ${campaign.tokens[0].balanceUSD.toFixed(2)}
          </Typography>
        </StyledAmountContainer>
      </StyledTokensContainer>
      <Button variant="text" color="secondary">
        <FormattedMessage description="claimModal claim" defaultMessage="Claim" />
        <ArrowRight size="inherit" fill="inherit" />
      </Button>
    </StyledCampaignSection>
  </StyledContent>
);

export default ClaimItem;
