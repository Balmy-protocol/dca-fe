import * as React from 'react';
import {
  Typography,
  BalmyLogoSmallDark,
  BalmyLogoSmallLight,
  BackgroundPaper,
  ContainerBox,
  TickCircleIcon,
  useTheme,
  colors,
} from 'ui-library';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import styled from 'styled-components';
import Chart from './chart';

const BulletPoint = ({ label }: { label: string }) => (
  <ContainerBox gap={1} alignItems="center">
    <TickCircleIcon color="primary" />
    <Typography variant="bodySmallBold" noWrap>
      {label}
    </Typography>
  </ContainerBox>
);

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};
  align-items: center;
  padding-top: ${spacing(12)};
  margin-top: ${spacing(20)};
  padding-bottom: ${spacing(12)};
  position: relative;
  overflow: hidden;
  text-align: center;
`}
`;

const bulletLabels = defineMessages({
  investEasier: {
    defaultMessage: 'Invest easier',
    description: 'descInvesEasier',
  },
  reduceRisk: {
    description: 'descReduceRisk',
    defaultMessage: 'Reduce risk',
  },
  avoidMarketTiming: {
    description: 'descAvoidMarketTiming',
    defaultMessage: 'Avoid market timing',
  },
});

const AggregatorLanding = () => {
  const { palette, spacing } = useTheme();
  const intl = useIntl();

  const logoProps = { size: spacing(13), fill: colors[palette.mode].typography.typo2 };
  const logo =
    palette.mode === 'light' ? <BalmyLogoSmallDark {...logoProps} /> : <BalmyLogoSmallLight {...logoProps} />;

  return (
    <StyledBackgroundPaper variant="outlined">
      {logo}
      <Typography variant="h4" fontWeight={700}>
        <FormattedMessage description="dcaLandingTitle" defaultMessage="Balmy’s Dollar-Cost Average Strategy" />
      </Typography>
      <Typography variant="bodyRegular" textAlign="center">
        <FormattedMessage
          description="dcaLandingDescription"
          defaultMessage="An investment strategy that involves buying a fixed dollar amount of a cryptocurrency at regular intervals, regardless of the current market price."
        />
      </Typography>
      <ContainerBox gap={2} justifyContent="space-around" fullWidth>
        {Object.values(bulletLabels).map((label) => (
          <BulletPoint key={label.description} label={intl.formatMessage(label)} />
        ))}
      </ContainerBox>
      <ContainerBox alignSelf="stretch">
        <Chart />
      </ContainerBox>
    </StyledBackgroundPaper>
  );
};

export default AggregatorLanding;
