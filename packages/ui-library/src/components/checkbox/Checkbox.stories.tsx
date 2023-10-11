import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox, CheckboxProps } from '.';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Primary: Story = {
  args: {},
  render: (args: CheckboxProps) => <Checkbox {...args} />,
};

export { Checkbox };
