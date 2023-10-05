import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { DialogContent, DialogContentProps } from '.';

const meta: Meta<typeof DialogContent> = {
  title: 'Components/DialogContent',
  component: DialogContent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DialogContent>;

export const Primary: Story = {
  args: {},
  render: (args: DialogContentProps) => <DialogContent {...args} />,
};

export { DialogContent };
