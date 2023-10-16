import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { IconButton, IconButtonProps } from '.';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Primary: Story = {
  args: {},
  render: (args: IconButtonProps) => <IconButton {...args} />,
};

export { IconButton };
