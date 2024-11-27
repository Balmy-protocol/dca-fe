import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { PillTabs, PillTabsProps } from '.';

const meta: Meta<typeof PillTabs> = {
  title: 'Components/PillTabs',
  component: PillTabs,
  parameters: {
    layout: 'centered',
  },
  args: {
    options: [
      {
        label: 'All',
        key: 1,
      },
      {
        label: 'Increase',
        key: 2,
      },
      {
        label: 'Withdraw',
        key: 3,
      },
    ],
    onChange: (key) => alert(key),
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PillTabs>;

export const Primary: Story = {
  args: {},
  render: (args: PillTabsProps) => <PillTabs {...args} />,
};

export { PillTabs };
