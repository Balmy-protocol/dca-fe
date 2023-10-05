import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Skeleton, SkeletonProps } from '.';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Primary: Story = {
  args: {},
  render: (args: SkeletonProps) => <Skeleton {...args} />,
};

export { Skeleton };
