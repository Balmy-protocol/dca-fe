import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { HiddenNumber } from '.';
import type { HiddenNumberProps } from '.';

function StoryHiddenNumber({ ...args }: HiddenNumberProps) {
  return <HiddenNumber {...args} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryHiddenNumber> = {
  title: 'Components/HiddenNumber',
  component: StoryHiddenNumber,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryHiddenNumber {...args}>child</StoryHiddenNumber>,
  args: {
    size: 'medium',
  },
};

type Story = StoryObj<typeof StoryHiddenNumber>;

const Large: Story = {
  args: {},
  render: (args: HiddenNumberProps) => <StoryHiddenNumber {...args} size="large" />,
};

const Medium: Story = {
  args: {},
  render: (args: HiddenNumberProps) => <StoryHiddenNumber {...args} size="medium" />,
};
const Small: Story = {
  args: {},
  render: (args: HiddenNumberProps) => <StoryHiddenNumber {...args} size="small" />,
};

export default meta;

export { StoryHiddenNumber, Large, Medium, Small };
