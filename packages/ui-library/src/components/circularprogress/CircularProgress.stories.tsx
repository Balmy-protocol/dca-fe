import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { CircularProgress, CircularProgressProps } from '.';

const meta: Meta<typeof CircularProgress> = {
  title: 'Components/CircularProgress',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CircularProgress>;

export const Primary: Story = {
  args: {},
  render: (args: CircularProgressProps) => <CircularProgress {...args} />,
};

export { CircularProgress };
