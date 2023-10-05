import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Popover, PopoverProps } from '.';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Primary: Story = {
  args: {},
  render: (args: PopoverProps) => <Popover {...args} />,
};

export { Popover };
