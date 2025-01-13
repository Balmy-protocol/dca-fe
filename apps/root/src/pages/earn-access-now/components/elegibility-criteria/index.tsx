import Address from '@common/components/address';
import useUser from '@hooks/useUser';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BackgroundPaper, Button, colors, ContainerBox, InformationIcon, Typography } from 'ui-library';

export const StyledElegibilityCriteriaBackgroundPaper = styled(BackgroundPaper).attrs({
  variant: 'outlined',
})`
  min-height: ${({ theme }) => theme.spacing(87.5)};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

interface ElegibilityCriteriaProps {
  setIsCheckingEligibility: (value: boolean) => void;
  isCheckingEligibility: boolean;
}

const ElegibilityCriteria = ({ setIsCheckingEligibility }: ElegibilityCriteriaProps) => {
  const user = useUser();
  const isLoggedIn = !!user;

  return (
    <StyledElegibilityCriteriaBackgroundPaper>
      <ContainerBox flexDirection="column" gap={6}>
        <ContainerBox flexDirection="column" gap={2}>
          <Typography variant="h5Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
            <FormattedMessage
              description="earn-access-now.eligibility.title"
              defaultMessage="Eligibility Requirements"
            />
          </Typography>
          <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
            <FormattedMessage
              description="earn-access-now.eligibility.description"
              defaultMessage="You can qualify for Early Access if you meet <b>at least one</b> of the following criteria:"
              values={{
                b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              }}
            />
          </Typography>
        </ContainerBox>
        <ContainerBox flexDirection="column" gap={3}>
          <ContainerBox gap={2} alignItems="center">
            <InformationIcon sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
            <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
              <FormattedMessage
                description="earn-access-now.eligibility.criteria.1"
                defaultMessage="Swapped at least <b>$100</b> on Superchain (excluding stablecoin-to-stablecoin swaps)."
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />
            </Typography>
          </ContainerBox>
          <ContainerBox gap={2} alignItems="center">
            <InformationIcon sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
            <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
              <FormattedMessage
                description="earn-access-now.eligibility.criteria.2"
                defaultMessage="Have a <b>DCA position</b> on Superchain with <b>30 or more swaps executed</b>."
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />
            </Typography>
          </ContainerBox>
          <ContainerBox gap={2} alignItems="center">
            <InformationIcon sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
            <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
              <FormattedMessage
                description="earn-access-now.eligibility.criteria.3"
                defaultMessage="Holder of the exclusive <b>Lobsters NFT</b>"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />{' '}
              <Address address="0x026224a2940bfe258d0dbe947919b62fe321f042" trimAddress showDetailsOnHover />
            </Typography>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox justifyContent="flex-start">
          <Button variant="contained" disabled={!isLoggedIn} onClick={() => setIsCheckingEligibility(true)}>
            <FormattedMessage
              description="earn-access-now.eligibility.button"
              defaultMessage="Check your Wallets Now"
            />
          </Button>
        </ContainerBox>
      </ContainerBox>
    </StyledElegibilityCriteriaBackgroundPaper>
  );
};

export default ElegibilityCriteria;
