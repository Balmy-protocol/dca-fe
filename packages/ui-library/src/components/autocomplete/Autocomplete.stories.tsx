import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Input from '@mui/material/Input';

import { Autocomplete } from '.';

const meta: Meta<typeof Autocomplete> = {
  title: 'Components/Autocomplete',
  component: Autocomplete,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Autocomplete>;

export const Primary: Story = {
  args: {},
  render: () => (
    <Autocomplete
      options={['apple', 'banana', 'orange', 'grape', 'watermelon', 'pineapple']}
      renderInput={(params) => <Input {...params} placeholder="Choose a fruit" disableUnderline />}
    />
  ),
};

export { Autocomplete };
