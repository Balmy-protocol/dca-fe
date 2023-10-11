import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Typography, TypographyProps } from '.';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Primary: Story = {
  args: {},
  render: (args: TypographyProps) => <Typography {...args} />,
};

export { Typography };
