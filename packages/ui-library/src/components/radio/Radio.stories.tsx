import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Radio, RadioProps } from '.';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Primary: Story = {
  args: {},
  render: (args: RadioProps) => <Radio {...args} />,
};

export { Radio };
