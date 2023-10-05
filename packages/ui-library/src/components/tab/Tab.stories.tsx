import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tab, TabProps } from '.';

const meta: Meta<typeof Tab> = {
  title: 'Components/Tab',
  component: Tab,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tab>;

export const Primary: Story = {
  args: {},
  render: (args: TabProps) => <Tab {...args} />,
};

export { Tab };
