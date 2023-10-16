import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { FormControl, FormControlProps } from '.';

const meta: Meta<typeof FormControl> = {
  title: 'Components/FormControl',
  component: FormControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormControl>;

export const Primary: Story = {
  args: {},
  render: (args: FormControlProps) => <FormControl {...args} />,
};

export { FormControl };
