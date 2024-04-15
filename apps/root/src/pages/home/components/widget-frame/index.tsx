import React from 'react';
import {
  ContainerBox,
  Typography,
  ForegroundPaper,
  Divider,
  colors,
  Collapse,
  ArrowUpIcon,
  Button,
  Tooltip,
} from 'ui-library';
import styled from 'styled-components';
import NetWorthNumber from '@common/components/networth-number';

const StyledDivider = styled(Divider)`
  border-color: ${({ theme: { palette } }) => colors[palette.mode].border.border2};
`;

const StyledContainer = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  display: flex;
  flex: 1;
`;

const StyledContainerBox = styled(ContainerBox)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)};
  `}
`;

const StyledCollapseIconContainer = styled(ContainerBox)<{ $isOpen: boolean }>`
  ${({ $isOpen }) => `
    transform: rotate(${$isOpen ? 0 : 180}deg);
    transition: transform 150ms cubic-bezier(0.4,0,0.2,1) 0ms;
  `}
`;

const StyledPercentageBox = styled(ContainerBox)`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    border-radius: ${spacing(1)};
    border: 1px solid ${colors[mode].border.border2};
    background: ${colors[mode].background.tertiary};
    padding: ${spacing(1)};
  `}
`;

interface WidgetFrameProps extends React.PropsWithChildren {
  assetValue: number;
  totalValue?: number;
  showPercentage?: boolean;
  isLoading?: boolean;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  collapsable?: boolean;
  Icon?: React.ElementType;
  actions?: {
    label: React.ReactNode;
    icon: React.ElementType;
    onClick: () => void;
    disabled?: boolean;
    tooltipTitle?: React.ReactNode;
  }[];
}

const WidgetFrame = ({
  assetValue,
  isLoading,
  children,
  subtitle,
  title,
  collapsable,
  Icon,
  totalValue,
  showPercentage,
  actions,
}: WidgetFrameProps) => {
  const [shouldShow, setShouldShow] = React.useState(true);

  return (
    <StyledContainer>
      <StyledContainerBox flex={1} flexDirection="column" gap={3}>
        <ContainerBox
          alignItems="center"
          style={{ cursor: collapsable ? 'pointer' : 'auto' }}
          gap={2}
          onClick={() => collapsable && setShouldShow(!shouldShow)}
        >
          {Icon && (
            <Typography variant="h5" sx={{ display: 'flex' }}>
              <Icon size="inherit" />
            </Typography>
          )}
          <Typography variant="h6">
            {title}
            {` · `}
          </Typography>
          <NetWorthNumber value={assetValue} withAnimation={false} isLoading={isLoading} variant="h6" />
          {subtitle && (
            <Typography variant="h6" fontWeight={700}>
              {` · `}
              {subtitle}
            </Typography>
          )}
          {totalValue && showPercentage && (
            <StyledPercentageBox>
              <Typography variant="bodySmallRegular">{((assetValue / totalValue) * 100).toFixed(0)}%</Typography>
            </StyledPercentageBox>
          )}
          {actions && !!actions.length && (
            <ContainerBox flex={1} alignItems="center" justifyContent="flex-end">
              {actions.map(({ label, icon: ActionIcon, onClick, disabled, tooltipTitle }, index) => (
                <Tooltip title={tooltipTitle} placement="top" arrow key={index}>
                  <Button
                    variant="text"
                    disabled={disabled}
                    onClick={onClick}
                    sx={{ pointerEvents: 'auto !important' }}
                  >
                    <ContainerBox alignItems="center" gap={1}>
                      <Typography variant="bodyRegular" sx={{ display: 'flex' }}>
                        <ActionIcon size="inherit" />
                      </Typography>
                      <Typography variant="bodySmallRegular">{label}</Typography>
                    </ContainerBox>
                  </Button>
                </Tooltip>
              ))}
            </ContainerBox>
          )}
          {collapsable && (
            <ContainerBox flex={1} justifyContent="flex-end">
              <StyledCollapseIconContainer $isOpen={shouldShow}>
                <ArrowUpIcon />
              </StyledCollapseIconContainer>
            </ContainerBox>
          )}
        </ContainerBox>
        <StyledDivider />
        <ContainerBox flex={1}>
          <Collapse in={shouldShow} sx={{ flex: 1, display: 'flex' }}>
            {children}
          </Collapse>
        </ContainerBox>
      </StyledContainerBox>
    </StyledContainer>
  );
};

export default WidgetFrame;
