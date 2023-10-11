import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip, TooltipProps } from '.';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Primary: Story = {
  args: {},
  render: (args: TooltipProps) => <Tooltip {...args} />,
};

export { Tooltip };
