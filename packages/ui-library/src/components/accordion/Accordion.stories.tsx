import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Accordion, AccordionProps } from '.';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Primary: Story = {
  args: {},
  render: (args: AccordionProps) => <Accordion {...args} />,
};

export { Accordion };
