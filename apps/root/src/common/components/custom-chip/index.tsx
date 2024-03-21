import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { Typography, Tooltip, TooltipProps, Theme } from 'ui-library';
import { withStyles } from 'tss-react/mui';

const StyledChipContainer = styled.div<{ tooltip?: boolean; pointer?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 3px;
  border-radius: 24px;
  padding: 1px 10px 1px 6px;
  cursor: default;
  ${({ tooltip }) => (tooltip ? 'cursor: default;' : '')}
  ${({ pointer }) => (pointer ? 'cursor: pointer;' : '')}
`;

const StyledIconContainer = styled.div``;

const StyledChildrenContainer = styled.div``;

const StyledExtraTextContainer = styled(Typography)``;

export const DarkTooltip = withStyles(Tooltip, (theme: Theme) => ({
  tooltip: {
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

const CustomChipContent = React.forwardRef<
  HTMLDivElement,
  {
    icon: React.ReactNode;
    extraText?: React.ReactNode;
    tooltip?: boolean;
    pointer?: boolean;
    children: React.ReactNode;
  }
>(({ children, icon, extraText, tooltip, pointer, ...otherProps }, ref) => (
  <StyledChipContainer ref={ref} {...otherProps} tooltip={tooltip} pointer={pointer}>
    <StyledIconContainer>{icon}</StyledIconContainer>
    <StyledChildrenContainer>{children}</StyledChildrenContainer>
    {extraText && <StyledExtraTextContainer variant="bodySmall">{extraText}</StyledExtraTextContainer>}
  </StyledChipContainer>
));

interface CustomChipProps {
  icon: React.ReactNode;
  extraText?: React.ReactNode;
  pointer?: boolean;
  tooltip?: boolean;
  tooltipTitle?: React.ReactNode;
  tooltipPlacement?: TooltipProps['placement'];
}

const CustomChip: React.FC<PropsWithChildren<CustomChipProps>> = ({
  children,
  icon,
  extraText,
  tooltip,
  tooltipTitle,
  tooltipPlacement,
  pointer,
}) =>
  tooltip ? (
    <DarkTooltip title={tooltipTitle || ''} arrow placement={tooltipPlacement || 'top'}>
      <CustomChipContent icon={icon} extraText={extraText} tooltip={tooltip} pointer={pointer}>
        {children}
      </CustomChipContent>
    </DarkTooltip>
  ) : (
    <CustomChipContent icon={icon} extraText={extraText} pointer={pointer}>
      {children}
    </CustomChipContent>
  );

export default CustomChip;
