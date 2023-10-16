import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Select, SelectProps } from '.';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Primary: Story = {
  args: {},
  render: (args: SelectProps) => <Select {...args} />,
};

export { Select };
