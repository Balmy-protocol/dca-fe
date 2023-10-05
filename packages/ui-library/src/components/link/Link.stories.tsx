import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Link, LinkProps } from '.';

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Primary: Story = {
  args: {},
  render: (args: LinkProps) => <Link {...args} />,
};

export { Link };
