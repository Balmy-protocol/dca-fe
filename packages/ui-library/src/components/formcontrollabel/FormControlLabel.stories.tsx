import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { FormControlLabel, FormControlLabelProps } from '.';

const meta: Meta<typeof FormControlLabel> = {
  title: 'Components/FormControlLabel',
  component: FormControlLabel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormControlLabel>;

export const Primary: Story = {
  args: {},
  render: (args: FormControlLabelProps) => <FormControlLabel {...args} />,
};

export { FormControlLabel };
