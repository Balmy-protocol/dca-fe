import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Switch, SwitchProps } from '.';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Primary: Story = {
  args: {},
  render: (args: SwitchProps) => <Switch {...args} />,
};

export { Switch };
