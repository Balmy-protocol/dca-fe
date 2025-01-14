import { DisplayStrategy } from 'common-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import {
  Typography,
  GlobalIcon,
  colors,
  ContainerBox,
  Skeleton,
  ArrowDropDownIcon,
  ArrowDropUpIcon,
  Collapse,
  ForegroundPaper,
  Link,
  TwitterIcon,
  DiscordIcon,
} from 'ui-library';
import { SPACING } from 'ui-library/src/theme/constants';
import { getLogoURL } from '@common/utils/urlParser';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI } from '@common/utils/currency';

interface DataGuardianProps {
  strategy?: DisplayStrategy;
}

interface DataGuardianContentProps {
  strategy?: DisplayStrategy;
}

const StyledContainer = styled(ContainerBox).attrs({ gap: 4, flexDirection: 'column' })`
  ${({ theme }) => `
    border: 1px solid ${colors[theme.palette.mode].border.border1};
    padding: ${theme.space.s05};
    border-radius: ${theme.spacing(3)};
  `}
`;

const StyledHowItWorksTitleContainer = styled(ContainerBox).attrs({ gap: 1, alignItems: 'center' })`
  cursor: pointer;
`;

const StyledHowItWorksCollapseContainer = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { space } }) => `
    padding: ${space.s05};
    display: flex;
  `}
`;

const StyledGuardianPill = styled(ContainerBox).attrs({ gap: 2, alignItems: 'center' })`
  ${({ theme }) => `
    padding: ${theme.spacing(2)} ${theme.spacing(4)} ${theme.spacing(2)} ${theme.spacing(2)};
    background-color: ${colors[theme.palette.mode].background.secondary};
    border: 1.5px solid ${colors[theme.palette.mode].border.border1};
    border-radius: ${theme.spacing(15)};
  `}
`;

const LinkContainer = styled(ContainerBox).attrs({ gap: 2, alignItems: 'center' })``;
const SkeletonDataGuardian = () => (
  <ContainerBox gap={4} alignItems="center">
    <StyledGuardianPill>
      <Skeleton variant="circular" width={SPACING(7)} height={SPACING(7)} />
      <Typography variant="bodySemibold">
        <Skeleton variant="text" width="7ch" />
      </Typography>
    </StyledGuardianPill>
    <LinkContainer>
      <Skeleton variant="circular" width={SPACING(5)} height={SPACING(5)} />
      <Skeleton variant="circular" width={SPACING(5)} height={SPACING(5)} />
    </LinkContainer>
  </ContainerBox>
);

const DataGuardianContent = ({ strategy }: DataGuardianContentProps) => (
  <ContainerBox gap={4} alignItems="center">
    <StyledGuardianPill>
      {strategy?.guardian?.logo && <TokenIcon token={emptyTokenWithLogoURI(strategy.guardian.logo || '')} size={7} />}
      <Typography variant="bodySemibold">{strategy?.guardian?.name}</Typography>
    </StyledGuardianPill>
    {!!strategy?.guardian?.links && (
      <LinkContainer>
        {strategy.guardian.links.twitter && (
          <Link
            underline="none"
            target="_blank"
            href={getLogoURL(strategy.guardian.links.twitter)}
            color={({ palette: { mode } }) => colors[mode].typography.typo3}
          >
            <TwitterIcon size={SPACING(5)} />
          </Link>
        )}
        {strategy.guardian.links.discord && (
          <Link
            underline="none"
            target="_blank"
            href={getLogoURL(strategy.guardian.links.discord)}
            color={({ palette: { mode } }) => colors[mode].typography.typo3}
          >
            <DiscordIcon size={SPACING(5)} />
          </Link>
        )}
        {strategy.guardian.links.website && (
          <Link
            underline="none"
            target="_blank"
            href={getLogoURL(strategy.guardian.links.website)}
            color={({ palette: { mode } }) => colors[mode].typography.typo3}
          >
            <GlobalIcon size={SPACING(5)} />
          </Link>
        )}
      </LinkContainer>
    )}
  </ContainerBox>
);

const DataGuardian = ({ strategy }: DataGuardianProps) => {
  const [isHelpExpanded, setHelpExpanded] = React.useState(false);

  return (
    <StyledContainer>
      <ContainerBox flexDirection="column" gap={1}>
        <Typography variant="bodyBold">
          <FormattedMessage
            description="earn.strategy-details.vault-data.guardian.title"
            defaultMessage="Boost Your Investment Security with Balmy's Guardian"
          />
        </Typography>
        <Typography variant="bodyRegular">
          <FormattedMessage
            description="earn.strategy-details.vault-data.guardian.subtitle"
            defaultMessage="Rest easy knowing this Guardian keeps a vigilant eye on your investments. With continuous monitoring and quick action against threats, your assets stay protected while you live your life."
          />
        </Typography>
      </ContainerBox>
      {strategy?.guardian ? <DataGuardianContent strategy={strategy} /> : <SkeletonDataGuardian />}
      <ContainerBox flexDirection="column" gap={2}>
        <StyledHowItWorksTitleContainer onClick={() => setHelpExpanded(!isHelpExpanded)}>
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="earn.strategy-details.vault-data.guardian.how-it-works.title"
              defaultMessage="How it works"
            />
          </Typography>
          {isHelpExpanded ? <ArrowDropUpIcon fontSize="inherit" /> : <ArrowDropDownIcon fontSize="inherit" />}
        </StyledHowItWorksTitleContainer>
        <Collapse in={isHelpExpanded} unmountOnExit>
          <StyledHowItWorksCollapseContainer>
            <Typography variant="bodyRegular">
              <FormattedMessage
                description="earn.strategy-details.vault-data.guardian.how-it-works.content"
                defaultMessage="Here will go the description of how a guardian works"
              />
            </Typography>
          </StyledHowItWorksCollapseContainer>
        </Collapse>
      </ContainerBox>
    </StyledContainer>
  );
};

export default DataGuardian;
