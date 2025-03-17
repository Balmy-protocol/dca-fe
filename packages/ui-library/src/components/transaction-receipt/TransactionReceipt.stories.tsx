import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TransactionReceipt } from '.';
import { HelpOutlineIcon } from '../../icons';
import type { TransactionReceiptProps } from '.';
import {
  IndexerUnits,
  TokenType,
  TransactionEventIncomingTypes,
  TransactionEventTypes,
  TransactionStatus,
  WithdrawType,
} from 'common-types';

function StoryTransactionReceipt({ ...args }: TransactionReceiptProps) {
  const [open, setOpen] = useState(true);
  return <TransactionReceipt {...args} open={open} onClose={() => setOpen(false)} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryTransactionReceipt> = {
  title: 'Components/TransactionReceipt',
  component: StoryTransactionReceipt,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryTransactionReceipt {...args}>child</StoryTransactionReceipt>,
  args: {
    transaction: {
      type: TransactionEventTypes.ERC20_TRANSFER,
      unit: IndexerUnits.ERC20_TRANSFERS,
      tx: {
        initiatedBy: '0xaaaa',
        chainId: 1,
        txHash: '0xhash',
        timestamp: 1703711755,
        spentInGas: {
          amount: BigInt('5'),
          amountInUnits: '0.0001',
          amountInUSD: '1',
        },
        explorerLink: 'https://etherscan.io/tx/0x5bf9e7d45b5e2b023e4c6112c0610292e770ef7a3f7c031062fe93ac1f82c5e5',
        network: {
          name: 'Ethereum',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            chainId: 1,
            address: '0xaddress',
            type: TokenType.NATIVE,
            underlyingTokens: [],
            icon: <HelpOutlineIcon />,
            chainAddresses: [],
          },
          chainId: 1,
          rpc: [],
          mainCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            chainId: 1,
            address: '0xaddress',
            type: TokenType.NATIVE,
            underlyingTokens: [],
            icon: <HelpOutlineIcon />,
            chainAddresses: [],
          },
        },
        nativePrice: 10,
      },
      data: {
        tokenFlow: TransactionEventIncomingTypes.INCOMING,
        token: {
          name: 'Token',
          symbol: 'TKN',
          decimals: 18,
          chainId: 10,
          address: '0xaddress',
          type: TokenType.ERC20_TOKEN,
          underlyingTokens: [],
          icon: <HelpOutlineIcon />,
          chainAddresses: [],
        },
        from: '0xaaaaa',
        to: '0xaaaaa',
        amount: {
          amount: BigInt('10'),
          amountInUnits: '0.1',
          amountInUSD: '1',
        },
        tokenPrice: 10,
        status: TransactionStatus.DONE,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TransactionReceipt>;

export const EarnWithdrawReceipt: Story = {
  args: {
    transaction: {
      type: TransactionEventTypes.EARN_WITHDRAW,
      unit: IndexerUnits.EARN,
      tx: {
        initiatedBy: '0xaaaa',
        chainId: 1,
        txHash: '0xhash',
        timestamp: 1703711755,
        spentInGas: {
          amount: BigInt('5'),
          amountInUnits: '0.0001',
          amountInUSD: '1',
        },
        explorerLink: 'https://etherscan.io/tx/0x5bf9e7d45b5e2b023e4c6112c0610292e770ef7a3f7c031062fe93ac1f82c5e5',
        network: {
          name: 'Ethereum',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            chainId: 1,
            address: '0xaddress',
            type: TokenType.NATIVE,
            underlyingTokens: [],
            icon: <HelpOutlineIcon />,
            chainAddresses: [],
          },
          chainId: 1,
          rpc: [],
          mainCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            chainId: 1,
            address: '0xaddress',
            type: TokenType.NATIVE,
            underlyingTokens: [],
            icon: <HelpOutlineIcon />,
            chainAddresses: [],
          },
        },
        nativePrice: 10,
      },
      data: {
        tokenFlow: TransactionEventIncomingTypes.INCOMING,
        positionId: '1-0x1-1',
        strategyId: '1-1-1',
        withdrawn: [
          {
            token: {
              name: 'Token',
              symbol: 'TKN',
              decimals: 18,
              chainId: 10,
              address: '0xaddress',
              type: TokenType.ERC20_TOKEN,
              underlyingTokens: [],
              icon: <HelpOutlineIcon />,
              chainAddresses: [],
            },
            amount: {
              amount: BigInt('10'),
              amountInUnits: '0.1',
              amountInUSD: '1',
            },
            withdrawType: WithdrawType.IMMEDIATE,
          },
          {
            token: {
              name: 'Token',
              symbol: 'TKN',
              decimals: 18,
              chainId: 10,
              address: '0xaddress',
              type: TokenType.ERC20_TOKEN,
              underlyingTokens: [],
              icon: <HelpOutlineIcon />,
              chainAddresses: [],
            },
            amount: {
              amount: BigInt('10'),
              amountInUnits: '0.1',
              amountInUSD: '1',
            },
            withdrawType: WithdrawType.IMMEDIATE,
          },
        ],
        recipient: '0x123',
        status: TransactionStatus.DONE,
      },
    },
  },
  render: (args: TransactionReceiptProps) => <StoryTransactionReceipt {...args} />,
};

export { StoryTransactionReceipt };
