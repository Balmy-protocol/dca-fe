import React from 'react';
import type { Meta } from '@storybook/react';

import { SplitButton } from '.';
import type { SplitButtonProps } from '.';

function StorySplitButton({ ...args }: SplitButtonProps) {
  return <SplitButton {...args} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StorySplitButton> = {
  title: 'Components/SplitButton',
  component: StorySplitButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StorySplitButton {...args}>child</StorySplitButton>,
  args: {
    options: [
      {
        onClick: () => alert('clicked first option'),
        text: 'First option',
        disabled: false,
      },
      {
        onClick: () => alert('clicked second option'),
        text: 'Second option',
        disabled: false,
      },
      {
        onClick: () => alert('clicked disabled option'),
        text: 'Disabled option',
        disabled: true,
      },
    ],
    onClick: () => alert('clicked main option'),
    text: 'Split button here',
    color: 'primary',
    variant: 'contained',
    disabled: false,
  },
};

export default meta;

export { StorySplitButton };
