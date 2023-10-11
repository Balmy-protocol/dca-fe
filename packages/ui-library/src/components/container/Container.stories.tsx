import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Container, ContainerProps } from '.';

const meta: Meta<typeof Container> = {
  title: 'Components/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Primary: Story = {
  args: {},
  render: (args: ContainerProps) => <Container {...args} />,
};

export { Container };
