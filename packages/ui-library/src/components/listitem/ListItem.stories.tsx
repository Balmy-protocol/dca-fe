import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ListItem, ListItemProps } from '.';

const meta: Meta<typeof ListItem> = {
  title: 'Components/ListItem',
  component: ListItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListItem>;

export const Primary: Story = {
  args: {},
  render: (args: ListItemProps) => <ListItem {...args} />,
};

export { ListItem };
