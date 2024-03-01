import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TransactionConfirmation } from '.';
import type { TransactionConfirmationProps } from '.';
import { BalmyLogoSmallDark, BalmyLogoSmallLight } from '../../assets';
import { TokenType, TransactionEventIncomingTypes } from 'common-types';
import { ContainerBox } from '..';

function StoryTransactionConfirmation({ ...args }: TransactionConfirmationProps) {
  return (
    <ContainerBox style={{ width: '500px', height: '600px' }}>
      <TransactionConfirmation {...args} />
    </ContainerBox>
  );
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryTransactionConfirmation> = {
  title: 'Components/TransactionConfirmation',
  component: StoryTransactionConfirmation,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryTransactionConfirmation {...args}>child</StoryTransactionConfirmation>,
  args: {
    success: true,
    shouldShow: true,
    successTitle: 'Success!!!!',
    additionalActions: [
      {
        onAction: () => alert('Clicked action!'),
        label: 'Click me!',
        variant: 'contained',
        color: 'primary',
      },
    ],
    gasUsed: {
      protocolToken: {
        address: '0xblablabla',
        symbol: 'ETH',
        decimals: 18,
        chainId: 10,
        type: TokenType.BASE,
        underlyingTokens: [],
        name: 'Ethereum',
      },
      gasUsed: {
        amount: '4000000000000000',
        amountInUnits: '0.0004',
        amountInUSD: '1.23',
      },
    },
    balanceChanges: [
      {
        token: {
          icon: <BalmyLogoSmallDark />,
          address: '0xblablabla',
          symbol: 'USDC',
          decimals: 18,
          chainId: 10,
          type: TokenType.BASE,
          underlyingTokens: [],
          name: 'Usd Coin',
        },
        amount: {
          amount: '199999999999',
          amountInUnits: '19.99',
          amountInUSD: '22.1',
        },
        inflow: TransactionEventIncomingTypes.INCOMING,
      },
      {
        token: {
          icon: <BalmyLogoSmallLight />,
          address: '0xblablabla',
          symbol: 'ETH',
          decimals: 18,
          chainId: 10,
          type: TokenType.BASE,
          underlyingTokens: [],
          name: 'Ethereum',
        },
        amount: {
          amount: '1111',
          amountInUnits: '0.01',
          amountInUSD: '23.54',
        },
        inflow: TransactionEventIncomingTypes.OUTGOING,
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof StoryTransactionConfirmation>;

const Loading: Story = {
  args: {},
  render: (args: TransactionConfirmationProps) => <StoryTransactionConfirmation {...args} success={false} />,
};

export { StoryTransactionConfirmation, Loading };