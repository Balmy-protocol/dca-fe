import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { AccordionSummary, AccordionSummaryProps } from '.';

const meta: Meta<typeof AccordionSummary> = {
  title: 'Components/AccordionSummary',
  component: AccordionSummary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccordionSummary>;

export const Primary: Story = {
  args: {},
  render: (args: AccordionSummaryProps) => <AccordionSummary {...args} />,
};

export { AccordionSummary };
