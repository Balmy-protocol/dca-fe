import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ListSubheader, ListSubheaderProps } from '.';

const meta: Meta<typeof ListSubheader> = {
  title: 'Components/ListSubheader',
  component: ListSubheader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListSubheader>;

export const Primary: Story = {
  args: {},
  render: (args: ListSubheaderProps) => <ListSubheader {...args} />,
};

export { ListSubheader };
