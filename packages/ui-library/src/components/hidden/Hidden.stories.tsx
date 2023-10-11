import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Hidden, HiddenProps } from '.';

const meta: Meta<typeof Hidden> = {
  title: 'Components/Hidden',
  component: Hidden,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Hidden>;

export const Primary: Story = {
  args: {},
  render: (args: HiddenProps) => <Hidden {...args} />,
};

export { Hidden };
