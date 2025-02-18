import useReferrals from '@hooks/tiers/useReferrals';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ContainerBox, Typography, colors, TickSquareIcon, DividerBorder1, Tooltip, InfoCircleIcon } from 'ui-library';

export const ReferralsInformation = ({ isReferralModal }: { isReferralModal?: boolean }) => (
  <ContainerBox gap={3} flexDirection="column">
    <Typography variant="h6Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
      <FormattedMessage
        description="tier-view.referrals.card.title"
        defaultMessage="Referrals are counted only if the referee meets these criteria:"
      />
    </Typography>
    <ContainerBox gap={2} flexDirection={isReferralModal ? 'row' : 'column'}>
      <ContainerBox gap={2}>
        <TickSquareIcon sx={({ palette: { mode } }) => ({ color: colors[mode].accent.primary })} />
        <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
          <FormattedMessage
            description="tier-view.referrals.card.referralCriteria.criteria-1"
            defaultMessage="Deposit <b>$100+</b> in Earn Strategies."
            values={{ b: (chunks) => <b>{chunks}</b> }}
          />
        </Typography>
      </ContainerBox>
      <ContainerBox gap={2}>
        <TickSquareIcon sx={({ palette: { mode } }) => ({ color: colors[mode].accent.primary })} />
        <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
          <FormattedMessage
            description="tier-view.referrals.card.referralCriteria.criteria-2"
            defaultMessage="Keep the deposit for 48 hours."
          />
        </Typography>
      </ContainerBox>
    </ContainerBox>
  </ContainerBox>
);

const StyledReferralCard = styled(ContainerBox).attrs({ gap: 4, flexDirection: 'column' })`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(6)};
    background-color: ${colors[palette.mode].background.quartery};
    border: 1px solid ${colors[palette.mode].border.border1};
    border-radius: ${spacing(4)};
  `}
`;

const ReferralCard = () => {
  const { referred, activated } = useReferrals();

  return (
    <StyledReferralCard>
      <ReferralsInformation />
      <DividerBorder1 />
      <ContainerBox gap={4}>
        <ContainerBox gap={1} flexDirection="column">
          <ContainerBox gap={1} alignItems="center">
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="tier-view.referrals.card.totalReferrals" defaultMessage="Referrals" />
            </Typography>
            <Tooltip
              title={
                <FormattedMessage
                  description="tier-view.referrals.card.totalReferrals.tooltip"
                  defaultMessage="Total users that have used your referral link."
                />
              }
            >
              <ContainerBox>
                <InfoCircleIcon sx={({ palette: { mode } }) => ({ color: colors[mode].typography.typo3 })} />
              </ContainerBox>
            </Tooltip>
          </ContainerBox>
          <Typography variant="bodyBold">{referred}</Typography>
        </ContainerBox>
        <ContainerBox gap={1} flexDirection="column">
          <ContainerBox gap={1} alignItems="center">
            <Typography variant="bodySmallRegular">
              <FormattedMessage
                description="tier-view.referrals.card.activeReferrals"
                defaultMessage="Active Referrals"
              />
            </Typography>
            <Tooltip
              title={
                <FormattedMessage
                  description="tier-view.referrals.card.activeReferrals.tooltip"
                  defaultMessage="Active Referrals are referrals that have deposited at least $100 in Earn Strategies and kept it for 48 hours."
                />
              }
            >
              <ContainerBox>
                <InfoCircleIcon sx={({ palette: { mode } }) => ({ color: colors[mode].typography.typo3 })} />
              </ContainerBox>
            </Tooltip>
          </ContainerBox>
          <Typography variant="bodyBold">{activated}</Typography>
        </ContainerBox>
      </ContainerBox>
    </StyledReferralCard>
  );
};

export default ReferralCard;
