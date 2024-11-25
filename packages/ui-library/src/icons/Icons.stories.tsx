import React from 'react';
import type { Meta } from '@storybook/react';

import * as CustomIcons from '.';
import { ContainerBox } from '../components/container-box';
import { SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

function StoryCustomIconInput({ ...args }: IconProps) {
  const pairs = Object.entries(CustomIcons);
  return (
    <ContainerBox gap={3} flexWrap="wrap">
      {pairs.map(([name, Icon]) => (
        <ContainerBox key={name} gap={2} flexDirection="column" justifyContent="center" alignItems="center">
          {name}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-expect-error */}
          <Icon {...args} />
        </ContainerBox>
      ))}
    </ContainerBox>
  );
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryCustomIconInput> = {
  title: 'Components/Icons',
  component: StoryCustomIconInput,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryCustomIconInput {...args} />,
  args: {
    size: '24px',
  },
};

export default meta;

export { StoryCustomIconInput };
