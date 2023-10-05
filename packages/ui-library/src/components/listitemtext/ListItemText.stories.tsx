import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ListItemText } from '.';

const meta: Meta<typeof ListItemText> = {
  title: 'Components/ListItemText',
  component: ListItemText,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListItemText>;

export const Primary: Story = {
  args: {},
};

export { ListItemText };
