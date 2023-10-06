import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ListComponent, ListProps } from '.';

const meta: Meta<typeof ListComponent> = {
  title: 'Components/List',
  component: ListComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListComponent>;

export const Primary: Story = {
  args: {},
  render: (args: ListProps) => <ListComponent {...args} />,
};

export { ListComponent };
