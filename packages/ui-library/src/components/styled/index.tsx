import styled from 'styled-components';
import { Paper } from '../paper';
import { baseTheme } from '../../theme';

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
