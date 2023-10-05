import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Menu, MenuProps } from '.';

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Primary: Story = {
  args: {},
  render: (args: MenuProps) => <Menu {...args} />,
};

export { Menu };
