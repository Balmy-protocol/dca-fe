import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { MuiSelect, MuiSelectProps } from '.';

const meta: Meta<typeof MuiSelect> = {
  title: 'Components/Mui-Select',
  component: MuiSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MuiSelect>;

export const Primary: Story = {
  args: {},
  render: (args: MuiSelectProps) => <MuiSelect {...args} />,
};

export { MuiSelect };
