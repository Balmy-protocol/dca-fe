import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Popper, PopperProps } from '.';

const meta: Meta<typeof Popper> = {
  title: 'Components/Popper',
  component: Popper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popper>;

export const Primary: Story = {
  args: {},
  render: (args: PopperProps) => <Popper {...args} />,
};

export { Popper };
