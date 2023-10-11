import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Grid, GridProps } from '.';

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Grid>;

export const Primary: Story = {
  args: {},
  render: (args: GridProps) => <Grid {...args} />,
};

export { Grid };
