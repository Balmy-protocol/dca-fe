import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TextField, TextFieldProps } from '.';
import { SearchIcon } from '../../icons';

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
  args: {
    placeholder: 'Type in here...',
    InputProps: {
      startAdornment: <SearchIcon />,
    },
  },
  render: (args: TextFieldProps) => <TextField {...args} />,
};

export const PrimarySmall: Story = {
  args: {
    placeholder: 'Type in here...',
    InputProps: {
      startAdornment: <SearchIcon />,
    },
  },
  render: (args: TextFieldProps) => <TextField size="small" {...args} />,
};

export const StartIcon: Story = {
  args: {
    placeholder: 'Type in here...',
    InputProps: {
      startAdornment: <SearchIcon />,
    },
  },
  render: (args: TextFieldProps) => <TextField {...args} />,
};

export { TextField };
