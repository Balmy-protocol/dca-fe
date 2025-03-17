import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TokenAmounUsdInput } from '.';
import { PROTOCOL_TOKEN_ADDRESS } from './useTokenAmountUsd';
import type { TokenAmounUsdInputProps } from '.';
import { TokenType } from 'common-types';

function StoryTokenAmountUsdInput({ ...args }: TokenAmounUsdInputProps) {
  const [value, setValue] = useState<string | undefined>(args.value || undefined);

  const onChange = (newValue: string) => {
    setValue(newValue);
  };

  return <TokenAmounUsdInput {...args} value={value} onChange={onChange} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryTokenAmountUsdInput> = {
  title: 'Components/TokenAmountUsdInput',
  component: StoryTokenAmountUsdInput,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryTokenAmountUsdInput {...args}>child</StoryTokenAmountUsdInput>,
  args: {
    token: {
      name: 'Polygon Ecosystem Token',
      symbol: 'POL',
      address: '0xeeee',
      chainId: 137,
      decimals: 18,
      type: TokenType.BASE,
      underlyingTokens: [],
      chainAddresses: [],
    },
    tokenPrice: BigInt('200000000000000000'),
    balance: {
      amount: BigInt('12100000000000000000'),
      amountInUnits: '12.1',
    },
  },
};
type Story = StoryObj<typeof StoryTokenAmountUsdInput>;

export const Protocol: Story = {
  args: {},
  render: (args: TokenAmounUsdInputProps) => (
    <StoryTokenAmountUsdInput
      {...args}
      token={{
        name: 'Polygon Ecosystem Token',
        symbol: 'POL',
        address: PROTOCOL_TOKEN_ADDRESS,
        chainId: 137,
        decimals: 18,
        type: TokenType.BASE,
        underlyingTokens: [],
        chainAddresses: [],
      }}
      value={undefined}
    />
  ),
};

export const Empty: Story = {
  args: {},
  render: (args: TokenAmounUsdInputProps) => <StoryTokenAmountUsdInput value={undefined} {...args} />,
};

export const Focused: Story = {
  args: {},
  render: (args: TokenAmounUsdInputProps) => <StoryTokenAmountUsdInput value="12.1" {...args} />,
};

export const Disabled: Story = {
  args: {},
  render: (args: TokenAmounUsdInputProps) => <StoryTokenAmountUsdInput disabled value="12.1" {...args} />,
};

export default meta;

export { StoryTokenAmountUsdInput };
