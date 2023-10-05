import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Grow, GrowProps } from '.';

const meta: Meta<typeof Grow> = {
  title: 'Components/Grow',
  component: Grow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Grow>;

export const Primary: Story = {
  args: {},
  render: (args: GrowProps) => <Grow {...args} />,
};

export { Grow };
