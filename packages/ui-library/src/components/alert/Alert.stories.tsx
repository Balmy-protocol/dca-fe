import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Alert, AlertProps } from '.';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Primary: Story = {
  args: {},
  render: (args: AlertProps) => <Alert {...args} />,
};

export { Alert };
