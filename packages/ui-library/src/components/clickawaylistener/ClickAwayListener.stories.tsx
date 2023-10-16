import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ClickAwayListener, ClickAwayListenerProps } from '.';

const meta: Meta<typeof ClickAwayListener> = {
  title: 'Components/ClickAwayListener',
  component: ClickAwayListener,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ClickAwayListener>;

export const Primary: Story = {
  args: {},
  render: (args: ClickAwayListenerProps) => <ClickAwayListener {...args} />,
};

export { ClickAwayListener };
