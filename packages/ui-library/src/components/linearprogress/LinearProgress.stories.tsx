import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { LinearProgress, LinearProgressProps } from '.';

const meta: Meta<typeof LinearProgress> = {
  title: 'Components/LinearProgress',
  component: LinearProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LinearProgress>;

export const Primary: Story = {
  args: {},
  render: (args: LinearProgressProps) => <LinearProgress {...args} />,
};

export { LinearProgress };
