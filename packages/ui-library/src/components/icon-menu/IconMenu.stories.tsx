import React from 'react';
import type { Meta } from '@storybook/react';
import { EmailIcon, WalletIcon, SendIcon, HelpIcon } from '../../icons';

import { IconMenu, IconMenuOption } from '.';
import type { IconMenuProps } from '.';

function StoryIconMenu({ ...args }: IconMenuProps) {
  return <IconMenu {...args} />;
}

const defaultOptions: IconMenuOption[] = [
  {
    label: 'Option 1',
    onClick: () => {},
    icon: <EmailIcon />,
  },
  {
    label: 'Option 2',
    onClick: () => {},
    icon: <SendIcon />,
  },
  {
    label: 'Option 3',
    onClick: () => {},
  },
  {
    label: 'Option 4',
    onClick: () => {},
    icon: <WalletIcon />,
  },
];
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryIconMenu> = {
  title: 'Components/Icon Menu',
  component: StoryIconMenu,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryIconMenu {...args} />,
  args: {
    options: defaultOptions,
    icon: <HelpIcon />,
  },
};

export default meta;

export { StoryIconMenu };
