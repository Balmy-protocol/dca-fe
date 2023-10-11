import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardProps } from '.';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {},
  render: (args: CardProps) => <Card {...args} />,
};

export { Card };
