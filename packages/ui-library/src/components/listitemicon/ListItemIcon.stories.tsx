import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ListItemIcon, ListItemIconProps } from '.';

const meta: Meta<typeof ListItemIcon> = {
  title: 'Components/ListItemIcon',
  component: ListItemIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListItemIcon>;

export const Primary: Story = {
  args: {},
  render: (args: ListItemIconProps) => <ListItemIcon {...args} />,
};

export { ListItemIcon };
