import React from 'react';
import type { Meta } from '@storybook/react';

import CustomerSatisfaction, { CustomerSatisfactionProps } from '.';

function StoryCustomerSatisfaction({ ...args }: CustomerSatisfactionProps) {
  return <CustomerSatisfaction {...args} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryCustomerSatisfaction> = {
  title: 'Components/CustomerSatisfaction',
  component: StoryCustomerSatisfaction,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryCustomerSatisfaction {...args} />,
  args: {
    mainQuestion: "How's it going?",
    options: [
      { label: '🥶', value: 1 },
      { label: '😎', value: 2 },
      { label: '🥵', value: 3 },
    ],
    ratingDescriptors: ['Too cold', 'Hot!'],
    onClickOption: () => {
      // eslint-disable-next-line no-console
      console.log('Clicked');
    },
  },
};

export default meta;

export { StoryCustomerSatisfaction };
