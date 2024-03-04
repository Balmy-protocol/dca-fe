import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Input, InputProps } from '.';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Primary: Story = {
  args: {},
  render: (args: InputProps) => <Input {...args} />,
};

export { Input };
