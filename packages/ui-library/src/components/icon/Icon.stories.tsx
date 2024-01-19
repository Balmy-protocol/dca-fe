import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ErrorCircleIcon, SuccessCircleIcon } from '../../icons';
import { SvgIcon, type SvgIconProps } from '@mui/material';

const meta: Meta<typeof SvgIcon> = {
  title: 'Components/Icon',
  component: SvgIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SvgIcon>;

export const ErrorCircle: Story = {
  args: {},
  render: (args: SvgIconProps) => <ErrorCircleIcon sx={{ fontSize: '100px' }} {...args} />,
};

export const SuccessCircle: Story = {
  args: {},
  render: (args: SvgIconProps) => <SuccessCircleIcon sx={{ fontSize: '100px' }} {...args} />,
};

export const Icon: Story = {
  args: {},
  render: (args: SvgIconProps) => <SvgIcon {...args} />,
};
