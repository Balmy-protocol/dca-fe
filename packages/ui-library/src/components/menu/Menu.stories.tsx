import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { MenuComponent, MenuProps } from '.';

const meta: Meta<typeof MenuComponent> = {
  title: 'Components/Menu',
  component: MenuComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MenuComponent>;

export const Primary: Story = {
  args: {},
  render: (args: MenuProps) => <MenuComponent {...args} />,
};

export { MenuComponent };
