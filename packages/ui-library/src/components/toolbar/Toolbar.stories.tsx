import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Toolbar, ToolbarProps } from '.';

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Primary: Story = {
  args: {},
  render: (args: ToolbarProps) => <Toolbar {...args} />,
};

export { Toolbar };
