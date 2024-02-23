import type { Preview } from '@storybook/react';

import { withMuiTheme } from './with-mui-theme-decorator';
import { withReactIntl } from './with-react-intl-decorator';
import { colors } from '../src/theme';
import { withSnackbar } from './notistack-decorator';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: colors.light.background.primary,
        },
        {
          name: 'dark',
          value: colors.dark.background.primary,
        },
      ],
    },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      title: 'Theme',
      description: 'Theme for your components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'light', left: '☀️', title: 'Light mode' },
          { value: 'dark', left: '🌙', title: 'Dark mode' },
        ],
      },
    },
  },
  decorators: [withSnackbar, withReactIntl, withMuiTheme],
};

export default preview;
