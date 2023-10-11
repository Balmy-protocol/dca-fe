import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { CardActions, CardActionsProps } from '.';

const meta: Meta<typeof CardActions> = {
  title: 'Components/CardActions',
  component: CardActions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CardActions>;

export const Primary: Story = {
  args: {},
  render: (args: CardActionsProps) => <CardActions {...args} />,
};

export { CardActions };
