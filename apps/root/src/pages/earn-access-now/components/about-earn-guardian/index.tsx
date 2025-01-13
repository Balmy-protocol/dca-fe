import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import {
  BackgroundPaper,
  Button,
  colors,
  ContainerBox,
  EyeIcon,
  Grid,
  Link,
  PersonOutlineRoundedIcon,
  ShieldTickIcon,
  SvgIconProps,
  Typography,
} from 'ui-library';

interface AboutCardProps {
  Icon: React.ComponentType<SvgIconProps>;
  title: React.ReactElement;
  description: React.ReactElement;
}

const AboutCard = styled(({ Icon, title, description, ...props }: AboutCardProps) => (
  <BackgroundPaper {...props} variant="outlined">
    <Icon sx={({ palette }) => ({ color: colors[palette.mode].accentPrimary })} fontSize="large" />
    <ContainerBox flexDirection="column" gap={2}>
      <Typography variant="h4Bold" color={({ palette }) => colors[palette.mode].typography.typo2}>
        {title}
      </Typography>
      <Typography variant="bodyRegular">{description}</Typography>
    </ContainerBox>
  </BackgroundPaper>
))`
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { spacing } }) => spacing(6)};
  padding: ${({ theme: { spacing } }) => spacing(6)};
  height: 100%;
`;

const AboutEarnGuardian = () => {
  return (
    <ContainerBox flexDirection="column" gap={8}>
      <ContainerBox gap={6} justifyContent="space-between" flexWrap="wrap">
        <Typography variant="h2Bold">
          <FormattedMessage
            description="earn-access-now.about-earn-guardian.title"
            defaultMessage="What's Earn Guardian"
          />
        </Typography>
        <ContainerBox justifyContent="flex-start">
          <Link href={`https://guardians.balmy.xyz/`} underline="none" target="_blank">
            <Button variant="outlined">
              <FormattedMessage
                description="earn-access-now.about-earn-guardian.button"
                defaultMessage="Learn More About Earn"
              />
            </Button>
          </Link>
        </ContainerBox>
      </ContainerBox>
      <Grid container columnSpacing={8} rowSpacing={6}>
        <Grid item xs={12} md={4}>
          <AboutCard
            Icon={ShieldTickIcon}
            title={
              <FormattedMessage description="earn-access-now.about-card.1.title" defaultMessage="Reclaim your time" />
            }
            description={
              <FormattedMessage
                description="earn-access-now.about-card.1.description"
                defaultMessage="Focus on what truly matters while your Guardian protects your investments."
              />
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AboutCard
            Icon={EyeIcon}
            title={
              <FormattedMessage
                description="earn-access-now.about-card.1.title"
                defaultMessage="Be the calm in the storm"
              />
            }
            description={
              <FormattedMessage
                description="earn-access-now.about-card.1.description"
                defaultMessage="Stay composed during market turbulence, knowing your assets are secure."
              />
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AboutCard
            Icon={PersonOutlineRoundedIcon}
            title={
              <FormattedMessage
                description="earn-access-now.about-card.1.title"
                defaultMessage="Simplify your DeFi journey"
              />
            }
            description={
              <FormattedMessage
                description="earn-access-now.about-card.1.description"
                defaultMessage="Streamline your portfolio with a clear, unified platform."
              />
            }
          />
        </Grid>
      </Grid>
    </ContainerBox>
  );
};

export default AboutEarnGuardian;
