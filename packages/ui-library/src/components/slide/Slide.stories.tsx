import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Slide, SlideProps } from '.';

const meta: Meta<typeof Slide> = {
  title: 'Components/Slide',
  component: Slide,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Slide>;

export const Primary: Story = {
  args: {},
  render: (args: SlideProps) => <Slide {...args} />,
};

export { Slide };
