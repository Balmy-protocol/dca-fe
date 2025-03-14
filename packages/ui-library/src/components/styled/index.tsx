import styled from 'styled-components';
import { MAX_FORM_WIDTH } from '../../theme/constants';
import { Grid, Typography } from '../';
import { colors } from '../../theme/colors';

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

export const StyledPageTitleDescription = styled(Typography).attrs({ variant: 'bodyLargeRegular' })`
  color: ${({ theme: { palette } }) => colors[palette.mode].typography.typo2};
  max-width: 60ch;
`;
