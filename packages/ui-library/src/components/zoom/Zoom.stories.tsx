import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Zoom, ZoomProps } from '.';

const meta: Meta<typeof Zoom> = {
  title: 'Components/Zoom',
  component: Zoom,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Zoom>;

export const Primary: Story = {
  args: {},
  render: (args: ZoomProps) => <Zoom {...args} />,
};

export { Zoom };
