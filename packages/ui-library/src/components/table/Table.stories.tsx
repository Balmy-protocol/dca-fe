import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Table } from '.';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Primary: Story = {
  args: {},
  render: (args) => <Table {...args} />,
};

export { Table };
