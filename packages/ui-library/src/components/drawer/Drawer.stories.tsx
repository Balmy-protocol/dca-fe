import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Drawer, DrawerProps } from '.';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Primary: Story = {
  args: {},
  render: (args: DrawerProps) => <Drawer {...args} />,
};

export { Drawer };
