import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Collapse, CollapseProps } from '.';

const meta: Meta<typeof Collapse> = {
  title: 'Components/Collapse',
  component: Collapse,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Collapse>;

export const Primary: Story = {
  args: {},
  render: (args: CollapseProps) => <Collapse {...args} />,
};

export { Collapse };
