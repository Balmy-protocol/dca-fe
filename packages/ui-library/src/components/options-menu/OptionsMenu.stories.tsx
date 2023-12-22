import React from 'react';
import type { Meta } from '@storybook/react';
import { EmailIcon, WalletIcon, SendIcon, HelpIcon, KeyboardArrowRightIcon } from '../../icons';

import { OptionsMenu, OptionsMenuOption, OptionsMenuOptionType } from '.';
import type { OptionsMenuProps } from '.';

function StoryOptionsMenu({ ...args }: OptionsMenuProps) {
  return <OptionsMenu {...args} />;
}

const defaultOptions: OptionsMenuOption[] = [
  {
    label: 'Option 1',
    onClick: () => {},
    icon: <EmailIcon />,
    type: OptionsMenuOptionType.option,
  },
  {
    label: 'Longer Option 2',
    onClick: () => {},
    icon: <SendIcon />,
    type: OptionsMenuOptionType.option,
  },
  {
    label: 'Option 3',
    onClick: () => {},
    type: OptionsMenuOptionType.option,
  },
  {
    label: 'Option 4',
    secondaryLabel: '0x123...123',
    onClick: () => {},
    icon: <WalletIcon />,
    type: OptionsMenuOptionType.option,
    control: <KeyboardArrowRightIcon />,
  },
];
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryOptionsMenu> = {
  title: 'Components/Icon Menu',
  component: StoryOptionsMenu,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryOptionsMenu {...args} />,
  args: {
    options: defaultOptions,
    mainDisplay: <HelpIcon />,
  },
};

export default meta;

export { StoryOptionsMenu };
