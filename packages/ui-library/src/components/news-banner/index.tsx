import React from 'react';
import styled, { useTheme } from 'styled-components';
import { SPACING } from '../../theme/constants';
import { colors } from '../../theme';
import { ContainerBox } from '../container-box';
import { DonutShape, NewsBannerBackgroundGrid } from '../../assets';
import { Typography } from '@mui/material';

interface NewsBannerProps {
  text: string;
  onClick?: () => void;
  coinIcon?: React.ReactNode;
}

function CoinWrapper({
  style: { width = '40px', height = '40px', ...style },
  children,
}: {
  style: React.CSSProperties;
  children: React.ReactNode;
}) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <div
      style={{
        ...style,
        width,
        height,
        position: 'relative',
        padding: SPACING(3),
        borderRadius: '50%',
        border: `0.25px solid #ffffffa6`, // White with 65% opacity
        background: '#FFFFFF01', // White with 1% opacity
        backdropFilter: 'blur(5px)',
        boxShadow: colors[mode].dropShadow.dropShadow100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}

const StyledBannerContainer = styled(ContainerBox).attrs({
  fullWidth: true,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 4,
})<{ $clickable: boolean }>`
  ${({ theme: { palette, spacing }, $clickable }) => `
  padding: ${spacing(1)} ${spacing(5)};
  background: ${palette.gradient.newsBanner};
  border-radius: ${spacing(4)};
  overflow: hidden;
  position: relative;
  ${$clickable ? 'cursor: pointer;' : ''}
`}
`;

const StyledBackgroundGrid = styled(NewsBannerBackgroundGrid)`
  ${({ theme: { spacing } }) => `
    position: absolute;
    transform: rotate(0deg);
    right: -${spacing(10)};
  }`}
`;

const NewsBanner = ({ text, onClick, coinIcon }: NewsBannerProps) => {
  return (
    <StyledBannerContainer onClick={onClick} $clickable={!!onClick}>
      <StyledBackgroundGrid width={350} height={130} />
      <Typography variant="bodySemibold" color={({ palette }) => colors[palette.mode].accent.accent100}>
        {text}
      </Typography>
      <ContainerBox style={{ position: 'relative' }} alignItems="end">
        <DonutShape width={85} height={85} persistThemeColor="dark" />
        <div style={{ position: 'absolute' }}>
          <CoinWrapper
            style={{
              width: 30,
              height: 30,
            }}
          >
            {coinIcon}
          </CoinWrapper>
        </div>
      </ContainerBox>
    </StyledBannerContainer>
  );
};

export { NewsBanner, type NewsBannerProps };
