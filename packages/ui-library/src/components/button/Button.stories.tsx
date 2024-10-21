import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '.';
import type { ButtonProps } from '.';
import { colors } from './colors';

type StoryButtonBaseProps = Pick<
  ButtonProps,
  'variant' | 'size' | 'color' | 'children' | 'onClick' | 'fullWidth' | 'disabled'
>;

function StoryButton({ children }: StoryButtonBaseProps) {
  return <Button>{children}</Button>;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryButton> = {
  title: 'Components/Button',
  component: StoryButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <Button {...args}>Button</Button>,
  argTypes: {
    color: {
      options: colors,
      control: 'select',
      description:
        'The color of the component. It supports both default MUI colors and custom colors defined in our Theme',
      table: {
        type: null,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StoryButton>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Contained: Story = {
  args: {},
  render: (args) => (
    <Button variant="contained" {...args}>
      Button
    </Button>
  ),
};
export const ContainedDisabled: Story = {
  args: {},
  render: (args) => (
    <Button variant="contained" disabled {...args}>
      Button
    </Button>
  ),
};
export const Outlined: Story = {
  args: {},
  render: (args) => (
    <Button variant="outlined" {...args}>
      Button
    </Button>
  ),
};
export const OutlinedDisabled: Story = {
  args: {},
  render: (args) => (
    <Button variant="outlined" disabled {...args}>
      Button
    </Button>
  ),
};
export const Text: Story = {
  args: {},
  render: (args) => (
    <Button variant="text" {...args}>
      Button
    </Button>
  ),
};
export const TextDisabled: Story = {
  args: {},
  render: (args) => (
    <Button variant="text" disabled {...args}>
      Button
    </Button>
  ),
};

export const ContainedError: Story = {
  args: {},
  render: (args) => (
    <Button variant="contained" color="error" {...args}>
      Button
    </Button>
  ),
};

export { StoryButton };
