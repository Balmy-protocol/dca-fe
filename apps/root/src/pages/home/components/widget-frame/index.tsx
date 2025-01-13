import React from 'react';
import {
  ContainerBox,
  Typography,
  colors,
  Collapse,
  ArrowUpIcon,
  Button,
  Tooltip,
  Hidden,
  BackgroundPaper,
  DiagramIcon,
} from 'ui-library';
import styled from 'styled-components';
import NetWorthNumber from '@common/components/networth-number';
import useAnalytics from '@hooks/useAnalytics';
import { useShowBalances, useThemeMode } from '@state/config/hooks';
import isUndefined from 'lodash/isUndefined';

const StyledContainer = styled(BackgroundPaper).attrs({ variant: 'outlined' })<{ $solid?: boolean }>`
  ${({ theme: { space, palette }, $solid }) => `
    padding: ${space.s05};
    ${$solid || palette.mode === 'dark' ? `background: ${colors[palette.mode].background.quarteryNoAlpha};` : ''}
    `}
  display: flex;
  flex: 1;
`;

const StyledCollapseIconContainer = styled(ContainerBox)<{ $isOpen: boolean }>`
  ${({ $isOpen }) => `
    transform: rotate(${$isOpen ? 0 : 180}deg);
    transition: transform 150ms cubic-bezier(0.4,0,0.2,1) 0ms;
  `}
`;

const StyledCollapse = styled(Collapse)`
  flex: 1;
  display: flex;
  margin-top: ${({ theme, in: show }) => theme.spacing(show ? 4 : 0)};
  transition: all 300ms;
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
  solid?: boolean;
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
  solid,
}: WidgetFrameProps) => {
  const [shouldShow, setShouldShow] = React.useState(true);
  const { trackEvent } = useAnalytics();
  const showBalances = useShowBalances();
  const mode = useThemeMode();

  const onToggleAccordion = (open: boolean) => {
    setShouldShow(open);
    trackEvent('Home - Toggle widget view', { open, widget: widgetId });
  };

  return (
    <StyledContainer $solid={solid}>
      <ContainerBox flex={1} flexDirection="column">
        <ContainerBox
          alignItems="center"
          style={{ cursor: collapsable ? 'pointer' : 'auto' }}
          gap={2}
          onClick={() => collapsable && onToggleAccordion(!shouldShow)}
        >
          {(Icon && <Icon sx={{ color: colors[mode].typography.typo2 }} />) || (
            <DiagramIcon sx={{ color: colors[mode].typography.typo2 }} />
          )}
          <Typography variant="bodySemibold">
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
          {!isUndefined(totalValue) && totalValue !== 0 && showPercentage && (
            <StyledPercentageBox>
              <Typography variant="labelRegular">
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
                <ArrowUpIcon sx={{ color: colors[mode].typography.typo3 }} />
              </StyledCollapseIconContainer>
            </ContainerBox>
          )}
        </ContainerBox>
        <ContainerBox flex={1}>
          <StyledCollapse in={shouldShow}>{children}</StyledCollapse>
        </ContainerBox>
      </ContainerBox>
    </StyledContainer>
  );
};

export default WidgetFrame;
