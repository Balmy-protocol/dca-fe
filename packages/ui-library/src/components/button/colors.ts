import { darkTheme } from '../../theme';

const muiNonColorValues = [
  'mode',
  'common',
  'grey', // this is not a color even though it has the name of one :shrug:
  'contrastThreshold',
  'getContrastText',
  'augmentColor',
  'tonalOffset',
  'text',
  'divider',
  'background',
  'action',
];

export const colors = Object.keys(darkTheme.palette).filter((colorKey) => !muiNonColorValues.includes(colorKey));
