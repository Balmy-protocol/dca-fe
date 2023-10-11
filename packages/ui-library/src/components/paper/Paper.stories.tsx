import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Paper, PaperProps } from '.';

const meta: Meta<typeof Paper> = {
  title: 'Components/Paper',
  component: Paper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Paper>;

export const Primary: Story = {
  args: {},
  render: (args: PaperProps) => <Paper {...args} />,
};

export { Paper };
