import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TierPillTabs, TierPillTabsProps } from '.';

const meta: Meta<typeof TierPillTabs> = {
  title: 'Components/TierPillTabs',
  component: TierPillTabs,
  parameters: {
    layout: 'centered',
  },
  args: {
    options: [
      {
        label: 'All',
        key: 0,
      },
      {
        label: 'Increase',
        key: 1,
      },
      {
        label: 'Withdraw',
        key: 2,
        isCurrent: true,
      },
      {
        label: 'Withdraw',
        key: 3,
      },
      {
        label: 'Withdraw',
        key: 4,
      },
    ],
    onChange: (key) => alert(key),
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TierPillTabs>;

export const Primary: Story = {
  args: {},
  render: (args: TierPillTabsProps) => <TierPillTabs {...args} />,
};

export { TierPillTabs };
