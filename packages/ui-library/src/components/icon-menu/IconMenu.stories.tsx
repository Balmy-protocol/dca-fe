import React from 'react';
import type { Meta } from '@storybook/react';
import { EmailIcon, WalletIcon, SendIcon, HelpIcon, KeyboardArrowRightIcon } from '../../icons';

import { IconMenu, IconMenuOption, IconMenuOptionType } from '.';
import type { IconMenuProps } from '.';

function StoryIconMenu({ ...args }: IconMenuProps) {
  return <IconMenu {...args} />;
}

const defaultOptions: IconMenuOption[] = [
  {
    label: 'Option 1',
    onClick: () => {},
    icon: <EmailIcon />,
    type: IconMenuOptionType.option,
  },
  {
    label: 'Longer Option 2',
    onClick: () => {},
    icon: <SendIcon />,
    type: IconMenuOptionType.option,
  },
  {
    label: 'Option 3',
    onClick: () => {},
    type: IconMenuOptionType.option,
  },
  {
    label: 'Option 4',
    secondaryLabel: '0x123...123',
    onClick: () => {},
    icon: <WalletIcon />,
    type: IconMenuOptionType.option,
    control: <KeyboardArrowRightIcon />,
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
    mainDisplay: <HelpIcon />,
  },
};

export default meta;

export { StoryIconMenu };
