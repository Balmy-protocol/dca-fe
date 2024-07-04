import styled from 'styled-components';
import { Paper } from '../paper';
import { baseTheme } from '../../theme';
import { MAX_FORM_WIDTH } from '../../theme/constants';
import { Grid } from '../';

export const StyledPaperContainer = styled(Paper)<{ $column?: boolean; $align?: boolean }>`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  backdrop-filter: blur(6px);
  display: flex;
  gap: 24px;
  flex-direction: ${({ $column }) => ($column ? 'column' : 'row')};
  ${({ $align }) => ($align ? 'align-self: flex-start;' : '')}
`;

export const StyledContentContainer = styled.div`
  padding: ${baseTheme.spacing(4)};
  border-radius: ${baseTheme.spacing(8)};
`;

export const StyledFormContainer = styled(Grid).attrs({
  flex: '1',
  container: true,
  alignItems: 'stretch',
  direction: 'row',
})`
  max-width: ${MAX_FORM_WIDTH};
`;

export const StyledNonFormContainer = styled(Grid).attrs({
  flex: '1',
  container: true,
  alignItems: 'stretch',
  direction: 'row',
})``;

export const ColorCircle = styled.div<{ color?: string; size?: number }>`
  ${({ color, size, theme: { spacing } }) => `
    width: ${spacing(size || 4)};
    height: ${spacing(size || 4)};
    background-color: ${color || 'transparent'};
    border-radius: 50%;
    display: inline-block
  `}
`;
