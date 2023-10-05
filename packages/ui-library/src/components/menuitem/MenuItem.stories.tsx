import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { MenuItem, MenuItemProps } from '.';

const meta: Meta<typeof MenuItem> = {
  title: 'Components/MenuItem',
  component: MenuItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MenuItem>;

export const Primary: Story = {
  args: {},
  render: (args: MenuItemProps) => <MenuItem {...args} />,
};

export { MenuItem };
