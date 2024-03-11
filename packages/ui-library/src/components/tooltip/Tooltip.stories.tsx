import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip, TooltipProps } from '.';
import { Typography } from '@mui/material';

function StoryTooltip(args: TooltipProps) {
  return (
    <Tooltip {...args}>
      <Typography variant="body">Discover</Typography>
    </Tooltip>
  );
}

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
  args: { title: <Typography variant="bodySmall">Read me please!</Typography>, open: true },
  render: (args: TooltipProps) => <StoryTooltip {...args} />,
};

export { Tooltip };
