import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { AccordionDetails, AccordionDetailsProps } from '.';

const meta: Meta<typeof AccordionDetails> = {
  title: 'Components/AccordionDetails',
  component: AccordionDetails,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccordionDetails>;

export const Primary: Story = {
  args: {},
  render: (args: AccordionDetailsProps) => <AccordionDetails {...args} />,
};

export { AccordionDetails };
