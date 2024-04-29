import React from 'react';
import styled from 'styled-components';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { Campaign } from '@types';
import { DateTime } from 'luxon';
import { Typography, HelpOutlineOutlinedIcon, Button, baseColors } from 'ui-library';
import ArrowRight from '@assets/svg/atom/arrow-right';
import { FormattedMessage, useIntl } from 'react-intl';

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

const ClaimItem = ({ campaign }: ClaimItemProps) => {
  const intl = useIntl();
  return (
    <StyledContent>
      <StyledCampaignSection>
        <Typography variant="h6">{campaign.title}</Typography>
        {campaign.expiresOn && (
          <Typography
            variant="bodySmallRegular"
            color={baseColors.disabledText}
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
            <Typography variant="bodyRegular">
              {formatCurrencyAmount({
                amount: campaign.tokens[0].balance,
                token: campaign.tokens[0],
                intl,
              })}{' '}
              {campaign.tokens[0].symbol}
            </Typography>
            <Typography variant="bodySmallRegular" color={baseColors.disabledText}>
              ${formatUsdAmount({ intl, amount: campaign.tokens[0].balanceUSD })}
            </Typography>
          </StyledAmountContainer>
        </StyledTokensContainer>
        <Button variant="text">
          <FormattedMessage description="claimModal claim" defaultMessage="Claim" />
          <ArrowRight size="inherit" fill="inherit" />
        </Button>
      </StyledCampaignSection>
    </StyledContent>
  );
};
export default ClaimItem;
