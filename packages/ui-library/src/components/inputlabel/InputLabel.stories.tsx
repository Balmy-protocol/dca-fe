import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { InputLabel, InputLabelProps } from '.';

const meta: Meta<typeof InputLabel> = {
  title: 'Components/InputLabel',
  component: InputLabel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InputLabel>;

export const Primary: Story = {
  args: {},
  render: (args: InputLabelProps) => <InputLabel {...args} />,
};

export { InputLabel };
