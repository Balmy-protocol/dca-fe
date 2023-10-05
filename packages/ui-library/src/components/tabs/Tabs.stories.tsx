import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tabs, TabsProps } from '.';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Primary: Story = {
  args: {},
  render: (args: TabsProps) => <Tabs {...args} />,
};

export { Tabs };
