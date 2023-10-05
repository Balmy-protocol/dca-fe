import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { InputAdornment, InputAdornmentProps } from '.';

const meta: Meta<typeof InputAdornment> = {
  title: 'Components/InputAdornment',
  component: InputAdornment,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InputAdornment>;

export const Primary: Story = {
  args: {},
  render: (args: InputAdornmentProps) => <InputAdornment {...args} />,
};

export { InputAdornment };
