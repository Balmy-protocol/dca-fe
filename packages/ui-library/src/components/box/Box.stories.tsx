import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Box, BoxProps } from '.';

const meta: Meta<typeof Box> = {
  title: 'Components/Box',
  component: Box,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Primary: Story = {
  args: {},
  render: (args: BoxProps) => <Box {...args} />,
};

export { Box };
