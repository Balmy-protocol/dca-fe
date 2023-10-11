import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { List, ListProps } from '.';

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof List>;

export const Primary: Story = {
  args: {},
  render: (args: ListProps) => <List {...args} />,
};

export { List };
