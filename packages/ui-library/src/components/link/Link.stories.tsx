import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { LinkComponent, LinkProps } from '.';

const meta: Meta<typeof LinkComponent> = {
  title: 'Components/Link',
  component: LinkComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LinkComponent>;

export const Primary: Story = {
  args: {},
  render: (args: LinkProps) => <LinkComponent {...args} />,
};

export { LinkComponent };
