import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Dialog, DialogProps } from '.';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Primary: Story = {
  args: {},
  render: (args: DialogProps) => <Dialog {...args} />,
};

export { Dialog };
