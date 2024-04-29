import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { DialogTitle, DialogTitleProps } from '.';

const meta: Meta<typeof DialogTitle> = {
  title: 'Components/DialogTitle',
  component: DialogTitle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DialogTitle>;

export const Primary: Story = {
  args: {},
  render: (args: DialogTitleProps) => <DialogTitle {...args} />,
};

export { DialogTitle };
