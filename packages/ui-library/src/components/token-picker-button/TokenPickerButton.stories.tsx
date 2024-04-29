import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TokenPickerButton } from '.';
import type { TokenPickerButtonProps } from '.';
import { HelpOutlineIcon } from '../../icons';
import { TokenType } from 'common-types';

function StoryTokenPickerButton({ ...args }: TokenPickerButtonProps) {
  return <TokenPickerButton {...args} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryTokenPickerButton> = {
  title: 'Components/TokenPickerButton',
  component: StoryTokenPickerButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryTokenPickerButton {...args} />,
  args: {
    token: {
      address: '0x',
      chainId: 1,
      decimals: 18,
      icon: <HelpOutlineIcon />,
      name: 'Token',
      symbol: 'TKN',
      type: TokenType.ERC20_TOKEN,
      underlyingTokens: [],
    },
    onClick: () => {},
  },
};

type Story = StoryObj<typeof StoryTokenPickerButton>;

const Empty: Story = {
  args: {},
  render: (args: TokenPickerButtonProps) => <StoryTokenPickerButton {...args} token={undefined} />,
};

export default meta;

export { StoryTokenPickerButton, Empty };
