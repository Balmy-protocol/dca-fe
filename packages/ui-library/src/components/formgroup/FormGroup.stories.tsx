import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { FormGroup, FormGroupProps } from '.';

const meta: Meta<typeof FormGroup> = {
  title: 'Components/FormGroup',
  component: FormGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormGroup>;

export const Primary: Story = {
  args: {},
  render: (args: FormGroupProps) => <FormGroup {...args} />,
};

export { FormGroup };
