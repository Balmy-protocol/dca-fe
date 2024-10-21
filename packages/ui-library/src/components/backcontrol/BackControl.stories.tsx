import type { Meta, StoryObj } from '@storybook/react';

import { BackControl } from '.';

const meta: Meta<typeof BackControl> = {
  title: 'Components/BackControl',
  component: BackControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BackControl>;

export const Primary: Story = {
  args: {
    // eslint-disable-next-line no-console
    onClick: () => console.log('BackControl clicked!'),
    label: 'Back',
  },
};

export const Text: Story = {
  args: {
    // eslint-disable-next-line no-console
    onClick: () => console.log('BackControl clicked!'),
    label: 'Back',
    variant: 'text',
  },
};

export { BackControl };
