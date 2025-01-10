import useInviteCodes from '@hooks/tiers/useInviteCodes';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ContainerBox, Typography, colors, TickSquareIcon } from 'ui-library';

const StyledReferralCard = styled(ContainerBox).attrs({ gap: 4, flexDirection: 'column' })`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(6)};
    background-color: ${colors[palette.mode].background.quartery};
    border: 1px solid ${colors[palette.mode].border.border1};
    border-radius: ${spacing(4)};
  `}
`;

const getGradientColor = (mode: 'light' | 'dark') => {
  return mode === 'light'
    ? 'linear-gradient(180deg, #EBE4F5 0%, #BAB2FF 100%)'
    : 'linear-gradient(180deg, #2E2040 0%, #181122 100%)';
};

const StyledGraphCard = styled(ContainerBox).attrs({ gap: 2, flexDirection: 'column' })`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(6)} ${spacing(6)} ${spacing(19)};
    border-radius: ${spacing(4)};
    background: ${getGradientColor(palette.mode)};
    height: 100%;
    position: relative;
    overflow: hidden;
    border: 1px solid ${colors[palette.mode].border.border1};
  `}
`;

const FeatureAsset = styled.div`
  position: absolute;
  background: url('https://ipfs.io/ipfs/QmRvtfXtN9R7ERLuSuf6TatGBj3p6Dd1b1g9KGWMpzau8w') 50% / contain no-repeat;
  width: 255px;
  height: 255px;
  transform: rotate(64.979deg);
  left: -120px;
  bottom: -110px;
`;

const GraphCard = ({ referrals }: { referrals: number }) => (
  <StyledGraphCard>
    <Typography variant="labelExtraLarge" color={({ palette }) => colors[palette.mode].typography.typo1}>
      <FormattedMessage description="tier-view.referrals.card.graph.title" defaultMessage="Make each invite count" />
    </Typography>
    <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
      <FormattedMessage
        description="tier-view.referrals.card.graph.description"
        defaultMessage="Make every code count! You have <b>{referrals} referral codes left</b> to share. Use them wisely to invite the right people and maximize your rewards."
        values={{ b: (chunks) => <b>{chunks}</b>, referrals }}
      />
    </Typography>
    <FeatureAsset />
  </StyledGraphCard>
);

const ReferralCard = () => {
  const inviteCodes = useInviteCodes();

  const totalInviteCodes = inviteCodes.length;
  const availableInviteCodes = totalInviteCodes - inviteCodes.filter((inviteCode) => inviteCode.claimedBy).length;

  return (
    <StyledReferralCard>
      <ContainerBox gap={3} flexDirection="column">
        <Typography variant="h6Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
          <FormattedMessage
            description="tier-view.referrals.card.title"
            defaultMessage="Referrals are counted only if the referee meets these criteria:"
          />
        </Typography>
        <ContainerBox gap={2} flexDirection="column">
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
        <GraphCard referrals={availableInviteCodes} />
      </ContainerBox>
    </StyledReferralCard>
  );
};

export default ReferralCard;
