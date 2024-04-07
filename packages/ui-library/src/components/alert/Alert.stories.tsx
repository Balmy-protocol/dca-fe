import React from 'react';
import type { Meta } from '@storybook/react';

import { Alert, AlertProps } from '.';
function StoryAlert({ ...args }: AlertProps) {
  return (
    <Alert
      severity="warning"
      variant="standard"
      sx={{ alignItems: 'center', marginTop: ({ spacing }) => spacing(8) }}
      {...args}
    >
      This is an Alert message
    </Alert>
  );
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryAlert> = {
  title: 'Components/Alert',
  component: StoryAlert,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryAlert {...args} />,
  args: {},
};

export default meta;

export { StoryAlert };
