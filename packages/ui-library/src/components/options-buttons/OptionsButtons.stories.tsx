import React, { useState } from 'react';
import type { Meta } from '@storybook/react';

import { OptionsButtons } from '.';
import type { OptionsButtonsProps } from '.';

interface Option {
  text: string;
  value: string;
}

const options: Option[] = [
  { text: 'Standard', value: 'standard' },
  { text: 'Fast', value: 'fast' },
  { text: 'Instant', value: 'instant' },
];

function StoryOptionsButtons({ options: buttonsOptions }: OptionsButtonsProps) {
  const [value, setValue] = useState(options[0]);

  const setActiveOption = (newValue: Option) => {
    setValue(newValue);
  };

  return <OptionsButtons activeOption={value} setActiveOption={setActiveOption} options={buttonsOptions} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryOptionsButtons> = {
  title: 'Components/OptionsButtons',
  component: StoryOptionsButtons,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryOptionsButtons {...args} />,
  args: {
    options,
  },
};

export default meta;

export { StoryOptionsButtons };
