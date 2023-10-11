import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ListItemButton, ListItemButtonProps } from '.';

const meta: Meta<typeof ListItemButton> = {
  title: 'Components/ListItemButton',
  component: ListItemButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListItemButton>;

export const Primary: Story = {
  args: {},
  render: (args: ListItemButtonProps) => <ListItemButton {...args} />,
};

export { ListItemButton };
