import React from 'react';
import type { Meta } from '@storybook/react';

import { TwitterShareLinkButton } from '.';
import type { TwitterShareLinkButtonProps } from '.';

function StoryTwitterShareLinkButton({ ...args }: TwitterShareLinkButtonProps) {
  return <TwitterShareLinkButton {...args} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryTwitterShareLinkButton> = {
  title: 'Components/TwitterShareLinkButton',
  component: StoryTwitterShareLinkButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryTwitterShareLinkButton {...args}>Share</StoryTwitterShareLinkButton>,
  args: {
    text: `📊 I've been DCAing $USDC to $wsTETH daily on @balmy_xyz for 30 days!\nWant to check out my investment? 👇🏼`,
    url: 'https://app.balmy.xyz/1284/positions/4/10?utm_source=twitter&utm_medium=social&utm_campaign=recurring_investment_shared',
  },
};

export default meta;

export { StoryTwitterShareLinkButton };
