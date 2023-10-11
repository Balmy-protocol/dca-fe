import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { CardContent, CardContentProps } from '.';

const meta: Meta<typeof CardContent> = {
  title: 'Components/CardContent',
  component: CardContent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CardContent>;

export const Primary: Story = {
  args: {},
  render: (args: CardContentProps) => <CardContent {...args} />,
};

export { CardContent };
