import React from 'react';
import type { Meta } from '@storybook/react';

import { ThumbsSatisfaction, ThumbsSatisfactionProps } from '.';

function StoryThumbsSatisfaction({ ...args }: ThumbsSatisfactionProps) {
  return <ThumbsSatisfaction {...args} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryThumbsSatisfaction> = {
  title: 'Components/ThumbsSatisfaction',
  component: StoryThumbsSatisfaction,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryThumbsSatisfaction {...args} />,
  args: {
    id: 'was this helpfull',
    onClickOption: ({ id, value }) => {
      // eslint-disable-next-line no-console
      console.log('Clicked', value, id);
    },
  },
};

export default meta;

export { StoryThumbsSatisfaction };
