import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { NewsBanner } from '.';
import type { NewsBannerProps } from '.';

function StoryNewsBanner({ ...args }: NewsBannerProps) {
  return <NewsBanner {...args} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryNewsBanner> = {
  title: 'Components/NewsBanner',
  component: StoryNewsBanner,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryNewsBanner {...args}>child</StoryNewsBanner>,
  args: {
    text: 'News Banner',
    onClick: () => {},
    coinIcon: <div />,
  },
};

type Story = StoryObj<typeof StoryNewsBanner>;

export default meta;

export { StoryNewsBanner, Story };
