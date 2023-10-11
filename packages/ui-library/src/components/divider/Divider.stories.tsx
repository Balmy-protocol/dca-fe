import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Divider, DividerProps } from '.';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Primary: Story = {
  args: {},
  render: (args: DividerProps) => <Divider {...args} />,
};

export { Divider };
