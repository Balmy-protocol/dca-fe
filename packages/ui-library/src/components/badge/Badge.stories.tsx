import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Badge, BadgeProps } from '.';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Primary: Story = {
  args: {},
  render: (args: BadgeProps) => <Badge {...args} />,
};

export { Badge };
