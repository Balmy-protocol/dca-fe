import React from 'react';
import type { Meta } from '@storybook/react';
import { type LinearProgressProps } from '../linearprogress';

import { PositionProgressBar } from '.';
import { ContainerBox } from '../container-box';

function StoryPositionProgressBar({ value }: LinearProgressProps) {
  return (
    <ContainerBox style={{ width: '50vw' }} flexDirection="column">
      <PositionProgressBar value={value} style={{ width: '50vw' }} />
    </ContainerBox>
  );
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryPositionProgressBar> = {
  title: 'Components/PositionProgressBar',
  component: StoryPositionProgressBar,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryPositionProgressBar {...args} />,
  args: {
    value: 50,
  },
};

export default meta;

export { StoryPositionProgressBar };
