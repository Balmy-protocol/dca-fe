import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ButtonGroup, ButtonGroupProps } from '.';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Primary: Story = {
  args: {},
  render: (args: ButtonGroupProps) => <ButtonGroup {...args} />,
};

export { ButtonGroup };
