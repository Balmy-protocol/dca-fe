import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Chip, ChipProps } from '.';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Primary: Story = {
  args: {},
  render: (args: ChipProps) => <Chip {...args} />,
};

export { Chip };
