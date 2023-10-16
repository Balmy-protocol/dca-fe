import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { SvgIcon, SvgIconProps } from '.';

const meta: Meta<typeof SvgIcon> = {
  title: 'Components/SvgIcon',
  component: SvgIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SvgIcon>;

export const Primary: Story = {
  args: {},
  render: (args: SvgIconProps) => <SvgIcon {...args} />,
};

export { SvgIcon };
