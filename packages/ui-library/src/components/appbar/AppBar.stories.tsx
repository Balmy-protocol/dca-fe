import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { AppBar, AppBarProps } from '.';

const meta: Meta<typeof AppBar> = {
  title: 'Components/AppBar',
  component: AppBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppBar>;

export const Primary: Story = {
  args: {},
  render: (args: AppBarProps) => <AppBar {...args} />,
};

export { AppBar };
