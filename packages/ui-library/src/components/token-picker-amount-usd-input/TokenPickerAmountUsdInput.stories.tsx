import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TokenType } from 'common-types';
import { TokenPickerAmountUsdInput, TokenPickerAmountUsdInputProps } from '.';

function StoryTokenAmountUsdInput({ ...args }: TokenPickerAmountUsdInputProps) {
  const [value, setValue] = useState<string>(args.value || '');

  const onChange = (newValue: string) => {
    setValue(newValue);
  };

  return <TokenPickerAmountUsdInput {...args} value={value} onChange={onChange} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryTokenAmountUsdInput> = {
  title: 'Components/TokenPickerAmountUsdInput',
  component: StoryTokenAmountUsdInput,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryTokenAmountUsdInput {...args} />,
  args: {
    id: 'token-picker-amount-usd-input',
    label: 'Token',
    startSelectingCoin: () => {},
    onChange: () => {},
    token: {
      name: 'Polygon Ecosystem Token',
      symbol: 'POL',
      address: '0xeeee',
      chainId: 137,
      icon: <></>,
      decimals: 18,
      type: TokenType.BASE,
      underlyingTokens: [],
      chainAddresses: [],
    },
    tokenPrice: BigInt('200000000000000000'),
    balance: {
      amount: BigInt('12100000000000000000'),
      amountInUnits: '12.1',
      amountInUSD: '17.03',
    },
    maxBalanceBtn: true,
  },
};
type Story = StoryObj<typeof StoryTokenAmountUsdInput>;

export const Empty: Story = {
  args: {
    value: '',
  },
  render: (args: TokenPickerAmountUsdInputProps) => <StoryTokenAmountUsdInput {...args} />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args: TokenPickerAmountUsdInputProps) => <StoryTokenAmountUsdInput {...args} />,
};

export default meta;

export { StoryTokenAmountUsdInput };
