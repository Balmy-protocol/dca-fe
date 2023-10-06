import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { BadgeComponent, BadgeProps } from '.';

const meta: Meta<typeof BadgeComponent> = {
  title: 'Components/Badge',
  component: BadgeComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BadgeComponent>;

export const Primary: Story = {
  args: {},
  render: (args: BadgeProps) => <BadgeComponent {...args} />,
};

export { BadgeComponent };
