import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { CssBaseline, CssBaselineProps } from '.';

const meta: Meta<typeof CssBaseline> = {
  title: 'Components/CssBaseline',
  component: CssBaseline,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CssBaseline>;

export const Primary: Story = {
  args: {},
  render: (args: CssBaselineProps) => <CssBaseline {...args} />,
};

export { CssBaseline };
