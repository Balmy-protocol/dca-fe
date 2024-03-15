import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TokenPicker } from '.';
import type { TokenPickerProps, TokenWithBalance } from '.';
import { Button } from '../button';
import { TokenType, TokenWithIcon } from 'common-types';
import BalmyLogoSmallLight from '../../assets/balmy-logo-small-light';
import { formatUnits } from 'viem';
import BalmyLogoSmallDark from '../../assets/balmy-logo-small-dark';

function generateRandomTokenNameAndSymbol(): { name: string; symbol: string } {
  const nameParts = ['Crypto', 'Chain', 'Bit', 'Ether', 'Quantum', 'Block', 'Net', 'Coin', 'Token', 'Ledger'];
  const symbolChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const pickRandomElement = (array: string[]) => array[Math.floor(Math.random() * array.length)];

  // Generate token name
  const name = `${pickRandomElement(nameParts)}${pickRandomElement(nameParts)}`;

  // Generate token symbol (3-5 characters long)
  let symbol = '';
  const symbolLength = Math.floor(Math.random() * 3) + 3; // Random length between 3 and 5
  for (let i = 0; i < symbolLength; i++) {
    symbol += symbolChars.charAt(Math.floor(Math.random() * symbolChars.length));
  }

  return { name, symbol };
}

function generateRandomAddress(): `0x${string}` {
  let result = '';
  for (let i = 0; i < 40; i++) {
    result += Math.floor(Math.random() * 16).toString(16);
  }
  return `0x${result}`;
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomBoolean(): boolean {
  return Math.random() >= 0.5;
}

function generateRandomBigIntWithDecimals(min: bigint, max: bigint, decimals: number): bigint {
  const range = max - min + BigInt(1);
  const base = min + BigInt(Math.floor(Number(range) * Math.random()));
  // @ts-expect-error no care about this, its going to run on the browser
  const decimalPart = BigInt(Math.floor(Math.random() * Number(BigInt(10n) ** BigInt(decimals))));
  // @ts-expect-error no care about this, its going to run on the browser
  return base * BigInt(10n) ** BigInt(decimals) + decimalPart;
}

function getRandomNumberWithDecimals(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(2);
}

const buildTokenWithBalance = (): TokenWithBalance => {
  const icon = getRandomBoolean() ? <BalmyLogoSmallLight /> : <BalmyLogoSmallDark />;
  const token: TokenWithIcon = {
    address: generateRandomAddress(),
    decimals: getRandomNumber(6, 18),
    chainId: 10,
    type: TokenType.BASE,
    underlyingTokens: [],
    icon,
    ...generateRandomTokenNameAndSymbol(),
  };

  const willHaveBalance = getRandomBoolean();
  const balanceAmount = generateRandomBigIntWithDecimals(BigInt(1), BigInt(4000), token.decimals);
  return {
    token,
    isCustomToken: getRandomBoolean(),
    allowsYield: getRandomBoolean(),
    balance:
      (willHaveBalance && {
        amount: balanceAmount,
        amountInUSD: (getRandomBoolean() && getRandomNumberWithDecimals(1, 1000)) || undefined,
        amountInUnits: parseFloat(formatUnits(balanceAmount, token.decimals)).toFixed(2),
      }) ||
      undefined,
  };
};

function StoryTokenPicker({ ...args }: TokenPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (token: TokenWithBalance) => {
    alert(`Selected token ${JSON.stringify(token)}`);
  };

  const handleFetchCustomToken = (tokenAddress: string) => {
    // eslint-disable-next-line no-console
    console.log(`Called fetch custom token with ${tokenAddress}`);
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={() => setIsOpen(!isOpen)}>
        Open picker
      </Button>
      <TokenPicker
        {...args}
        modalTitle="Token picker"
        onFetchCustomToken={handleFetchCustomToken}
        shouldShow={isOpen}
        onChange={handleChange}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

const randomTokens = [];

const amountOfRandomTokens = 1000;

for (let i = 0; i < amountOfRandomTokens; i++) {
  randomTokens.push(buildTokenWithBalance());
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryTokenPicker> = {
  title: 'Components/TokenPicker',
  component: StoryTokenPicker,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryTokenPicker {...args}>child</StoryTokenPicker>,
  args: {
    tokens: randomTokens,
    isLoadingTokens: false,
    isLoadingBalances: false,
    isLoadingPrices: false,
    allowedPairs: undefined,
    isLoadingCustomToken: false,
    onFetchCustomToken: undefined,
    filterByPair: false,
    otherSelected: randomTokens[0].token,
  },
};

type Story = StoryObj<typeof StoryTokenPicker>;

const Empty: Story = {
  args: {},
  render: (args: TokenPickerProps) => <StoryTokenPicker {...args} tokens={[]} />,
};

const Loading: Story = {
  args: {},
  render: (args: TokenPickerProps) => (
    <StoryTokenPicker {...args} tokens={[]} isLoadingBalances={true} isLoadingPrices={true} isLoadingTokens={true} />
  ),
};

export default meta;

export { StoryTokenPicker, Empty, Loading };
