import { EARN_ACCESS_NOW_ROUTE } from '@constants/routes';
import usePushToHistory from '@hooks/usePushToHistory';
import { useThemeMode } from '@state/config/hooks';
import React from 'react';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  colors,
  ContainerBox,
  Modal,
  SPACING,
  Typography,
  BalmyLogoSmallDark,
  ModalProps,
  Grid,
  Hidden,
} from 'ui-library';

interface EarnGainAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StyledContainer = styled(ContainerBox).attrs({ gap: 6, flexDirection: 'column' })`
  ${({ theme: { spacing } }) => `
    margin-top: ${spacing(7)};
    padding-top: ${spacing(6)};
  `}
`;

const StyledHeader = styled(ContainerBox).attrs({ justifyContent: 'space-between' })`
  background: linear-gradient(90deg, #e9e5ff -11.74%, #dec7ff 51.64%, #791aff 115.02%);
  ${({ theme: { spacing } }) => `
    height: ${spacing(24)};
  `}
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
`;

const StyledHeaderContent = styled(ContainerBox).attrs({ gap: 3, alignItems: 'center' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(5)} ${spacing(12)};
  `}
`;

const StlyedRainCoins = styled.div`
  background: url('https://ipfs.io/ipfs/QmSeVzhz72iHZGvq9pinvKeGScyQR85JqyBeahxVVs9Tuq') 50% / contain no-repeat;
  width: 250.26px;
  height: 227.044px;
  position: absolute;
  right: 7.996px;
  bottom: -72.098px;
`;

const StyledFeatureAssetFirst = styled.div`
  position: absolute;
  background: url('https://ipfs.io/ipfs/QmRknhCx7rWTCABFqYRdPm7iicaAJMWazGGDFXhygXnVTa') 50% / contain no-repeat;
  width: 198px;
  height: 197px;
  transform: rotate(15.309deg);
  left: -68px;
  bottom: -80px;
`;

const StyledFeatureAssetSecond = styled.div`
  position: absolute;
  background: url('https://ipfs.io/ipfs/QmTFLrcx2aTWeJKHCwCDU2yqLf44DcYZbrVsjrNP46vsR6') 50% / contain no-repeat;
  width: 289px;
  height: 289px;
  transform: rotate(-40.909deg);
  left: -166px;
  bottom: -171px;
`;

const StyledFeatureAssetThird = styled.div`
  position: absolute;
  background: url('https://ipfs.io/ipfs/QmYMtqhdUet6EMN8WX1GF667AU81Q7DYVvGDE8f9By23Uw') 50% / contain no-repeat;
  width: 242px;
  height: 242px;
  transform: rotate(71.567deg);
  left: -61px;
  bottom: -130px;
`;

interface FeatureCardProps {
  title: string;
  description: string;
  mode: 'light' | 'dark';
  FeatureAsset: React.ComponentType;
}

const getGradientColor = (mode: 'light' | 'dark') => {
  return mode === 'light'
    ? 'linear-gradient(180deg, #EBE4F5 0%, #BAB2FF 100%)'
    : 'linear-gradient(180deg, #2E2040 0%, #181122 100%)';
};

const FeatureCard = styled(({ title, description, FeatureAsset, ...props }: FeatureCardProps) => (
  <ContainerBox {...props} gap={1} flexDirection="column">
    <Typography variant="bodySmallSemibold" color={({ palette }) => colors[palette.mode].typography.typo1}>
      {title}
    </Typography>
    <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
      {description}
    </Typography>
    <FeatureAsset />
  </ContainerBox>
))`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(6)} ${spacing(6)} ${spacing(19)};
    border-radius: ${spacing(4)};
    background: ${getGradientColor(palette.mode)};
    height: 100%;
    position: relative;
    overflow: hidden;
  `}
`;

const EarnGainAccessModal = ({ isOpen, onClose }: EarnGainAccessModalProps) => {
  const intl = useIntl();
  const pushToHistory = usePushToHistory();
  const themeMode = useThemeMode();

  const handleAccessNow = () => {
    pushToHistory(`/${EARN_ACCESS_NOW_ROUTE.key}`);
    onClose();
  };

  const actions = React.useMemo(
    () =>
      [
        {
          label: intl.formatMessage(
            defineMessage({ description: 'earn.gain-access.modal.access-now', defaultMessage: 'Access now' })
          ),
          onClick: handleAccessNow,
          variant: 'contained',
        },
      ] as ModalProps['actions'],
    [handleAccessNow, intl]
  );

  return (
    <Modal open={isOpen} onClose={onClose} showCloseIcon actions={actions} customMaxWidth="822px">
      <StyledContainer>
        <StyledHeader>
          <StyledHeaderContent>
            <BalmyLogoSmallDark size={SPACING(7)} />
            <ContainerBox alignItems="center">
              <Typography variant="h3Bold" color={colors.light.accent.primary}>
                <FormattedMessage description="earn.gain-access.modal.title" defaultMessage="Earn Guardian" />
              </Typography>
              <Typography
                variant="h3Bold"
                color={colors.light.typography.typo1}
                sx={({ spacing }) => ({ paddingLeft: spacing(2) })}
              >
                <FormattedMessage description="earn.gain-access.modal.title-2" defaultMessage="is now live" />
              </Typography>
            </ContainerBox>
          </StyledHeaderContent>
          <Hidden mdDown>
            <ContainerBox style={{ position: 'relative' }} justifyContent="end" alignItems="end">
              <div style={{ position: 'absolute' }}>
                <StlyedRainCoins />
              </div>
            </ContainerBox>
          </Hidden>
        </StyledHeader>
        <Typography
          variant="bodyRegular"
          textAlign="center"
          color={({ palette: { mode } }) => colors[mode].typography.typo2}
        >
          <FormattedMessage
            description="earn.gain-access.modal.description"
            defaultMessage="If you've already signed up for beta access, place your code and start exploring! Haven’t signed up yet? Check if you qualify and be part of this exclusive early access to grow your crypto portfolio."
          />
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={4}>
            <FeatureCard
              title={intl.formatMessage({
                description: 'earn.gain-access.modal.feature-card.title.reclaim-time',
                defaultMessage: 'Reclaim your time',
              })}
              description={intl.formatMessage({
                description: 'earn.gain-access.modal.feature-card.description.reclaim-time',
                defaultMessage: 'Focus on what truly matters while your Guardian protects your investments.',
              })}
              mode={themeMode}
              FeatureAsset={StyledFeatureAssetFirst}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <FeatureCard
              title={intl.formatMessage({
                description: 'earn.gain-access.modal.feature-card.title.unlock-opportunities',
                defaultMessage: 'Unlock New Opportunities',
              })}
              description={intl.formatMessage({
                description: 'earn.gain-access.modal.feature-card.description.unlock-opportunities',
                defaultMessage: 'Take advantage of opportunities you might have missed and grow your portfolio.',
              })}
              mode={themeMode}
              FeatureAsset={StyledFeatureAssetSecond}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <FeatureCard
              title={intl.formatMessage({
                description: 'earn.gain-access.modal.feature-card.title.keep-simple',
                defaultMessage: 'Keep It Simple',
              })}
              description={intl.formatMessage({
                description: 'earn.gain-access.modal.feature-card.description.keep-simple',
                defaultMessage: 'Streamline your portfolio with a clear, unified platform.',
              })}
              mode={themeMode}
              FeatureAsset={StyledFeatureAssetThird}
            />
          </Grid>
        </Grid>
      </StyledContainer>
    </Modal>
  );
};

export default EarnGainAccessModal;
