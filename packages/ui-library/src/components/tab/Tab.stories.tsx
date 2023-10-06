import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TabComponent, TabProps } from '.';

const meta: Meta<typeof TabComponent> = {
  title: 'Components/Tab',
  component: TabComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TabComponent>;

export const Primary: Story = {
  args: {},
  render: (args: TabProps) => <TabComponent {...args} />,
};

export { TabComponent };
