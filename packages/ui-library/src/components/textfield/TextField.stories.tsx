import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TextField, TextFieldProps } from '.';

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Primary: Story = {
  args: {},
  render: (args: TextFieldProps) => <TextField {...args} />,
};

export { TextField };
