import { MaterialDesignContent } from 'notistack';
import styled from 'styled-components';
import { colors } from '../../theme';

export const StyledMaterialDesignContent = styled(MaterialDesignContent)(({ theme: { palette, spacing } }) => ({
  '&.notistack-MuiContent': {
    backgroundColor: colors[palette.mode].background.secondary,
    padding: spacing(3),
    borderRadius: spacing(2),
    '& > div': {
      gap: spacing(2),
      color: colors[palette.mode].typography.typo2,
      fontWeight: 'bold',
    },
    '& .MuiButton-root': {
      padding: 0,
    },
  },
  '&.notistack-MuiContent-success': {
    border: `1px solid ${colors[palette.mode].semantic.success.darker}`,
  },
  '&.notistack-MuiContent-error': {
    border: `1px solid ${colors[palette.mode].semantic.error.primary}`,
  },
  '&.notistack-MuiContent-warning': {
    border: `1px solid ${colors[palette.mode].semantic.warning.primary}`,
  },
}));
