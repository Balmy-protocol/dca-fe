import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { FilledInput, FilledInputProps } from '.';

const meta: Meta<typeof FilledInput> = {
  title: 'Components/FilledInput',
  component: FilledInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilledInput>;

export const Primary: Story = {
  args: {},
  render: (args: FilledInputProps) => <FilledInput {...args} />,
};

export { FilledInput };
