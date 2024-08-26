import React from 'react';
import {
  ContainerBox,
  Typography,
  ForegroundPaper,
  DividerBorder2,
  colors,
  Collapse,
  ArrowUpIcon,
  Button,
  Tooltip,
  Hidden,
} from 'ui-library';
import styled from 'styled-components';
import NetWorthNumber from '@common/components/networth-number';
import useTrackEvent from '@hooks/useTrackEvent';
import { useShowBalances } from '@state/config/hooks';

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
  widgetId?: string; // used for tracking
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
  widgetId,
}: WidgetFrameProps) => {
  const [shouldShow, setShouldShow] = React.useState(true);
  const trackEvent = useTrackEvent();
  const showBalances = useShowBalances();

  const onToggleAccordion = (open: boolean) => {
    setShouldShow(open);
    trackEvent('Home - Toggle widget view', { open, widget: widgetId });
  };

  return (
    <StyledContainer>
      <StyledContainerBox flex={1} flexDirection="column" gap={3}>
        <ContainerBox
          alignItems="center"
          style={{ cursor: collapsable ? 'pointer' : 'auto' }}
          gap={2}
          onClick={() => collapsable && onToggleAccordion(!shouldShow)}
        >
          {Icon && (
            <Typography variant="h5" sx={{ display: 'flex' }}>
              <Icon size="inherit" />
            </Typography>
          )}
          <Typography variant="bodyRegular">
            {title}
            {` · `}
          </Typography>
          <NetWorthNumber
            value={assetValue}
            withAnimation={false}
            isLoading={isLoading}
            variant="bodyBold"
            size="medium"
          />
          {subtitle && (
            <Hidden mdDown>
              <Typography variant="bodyBold" fontWeight={700}>
                {` · `}
                {subtitle}
              </Typography>
            </Hidden>
          )}
          {totalValue && showPercentage && (
            <StyledPercentageBox>
              <Typography variant="bodySmallLabel">
                {showBalances ? ((assetValue / totalValue) * 100).toFixed(0) : '-'}%
              </Typography>
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
        <DividerBorder2 />
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
