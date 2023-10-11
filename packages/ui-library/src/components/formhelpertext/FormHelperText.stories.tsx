import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { FormHelperText, FormHelperTextProps } from '.';

const meta: Meta<typeof FormHelperText> = {
  title: 'Components/FormHelperText',
  component: FormHelperText,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormHelperText>;

export const Primary: Story = {
  args: {},
  render: (args: FormHelperTextProps) => <FormHelperText {...args} />,
};

export { FormHelperText };
