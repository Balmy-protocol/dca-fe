import React from 'react';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import { withStyles } from '@mui/styles';
import { Theme, Tooltip, TooltipProps } from '@mui/material';

const StyledChipContainer = styled.div<{ tooltip?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 3px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(216, 216, 216, 0.1);
  padding: 1px 10px 1px 6px;
  ${({ tooltip }) => (tooltip ? 'cursor: default;' : '')}
`;

const StyledIconContainer = styled.div``;

const StyledChildrenContainer = styled.div``;

const StyledExtraTextContainer = styled(Typography)``;

const DarkTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    // backgroundColor: theme.palette.primary.dark,
    // color: theme.palette.common.white,
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

const CustomChipContent = React.forwardRef<
  HTMLDivElement,
  { icon: React.ReactNode; extraText?: React.ReactNode; tooltip?: boolean; children: React.ReactNode }
>(({ children, icon, extraText, tooltip, ...otherProps }, ref) => (
  <StyledChipContainer ref={ref} {...otherProps} tooltip={tooltip}>
    <StyledIconContainer>{icon}</StyledIconContainer>
    <StyledChildrenContainer>{children}</StyledChildrenContainer>
    {extraText && (
      <StyledExtraTextContainer variant="body2" color="rgba(255, 255, 255, 0.5)">
        {extraText}
      </StyledExtraTextContainer>
    )}
  </StyledChipContainer>
));

const CustomChip: React.FC<{
  icon: React.ReactNode;
  extraText?: React.ReactNode;
  tooltip?: boolean;
  tooltipTitle?: React.ReactNode;
  tooltipPlacement?: TooltipProps['placement'];
}> = ({ children, icon, extraText, tooltip, tooltipTitle, tooltipPlacement }) =>
  tooltip ? (
    <DarkTooltip title={tooltipTitle || ''} arrow placement={tooltipPlacement || 'top'}>
      <CustomChipContent icon={icon} extraText={extraText} tooltip={tooltip}>
        {children}
      </CustomChipContent>
    </DarkTooltip>
  ) : (
    <CustomChipContent icon={icon} extraText={extraText}>
      {children}
    </CustomChipContent>
  );

export default CustomChip;
