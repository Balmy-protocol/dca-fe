import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { DialogActions, DialogActionsProps } from '.';

const meta: Meta<typeof DialogActions> = {
  title: 'Components/DialogActions',
  component: DialogActions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DialogActions>;

export const Primary: Story = {
  args: {},
  render: (args: DialogActionsProps) => <DialogActions {...args} />,
};

export { DialogActions };
