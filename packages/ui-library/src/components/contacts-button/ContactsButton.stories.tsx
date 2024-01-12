import React from 'react';
import type { Meta } from '@storybook/react';

import ContactsButton, { ContactsButtonProps } from '.';

function StoryContactsButton({ ...args }: ContactsButtonProps) {
  return <ContactsButton {...args} />;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof ContactsButton> = {
  title: 'Components/ContactsButton',
  component: StoryContactsButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryContactsButton {...args} />,
  // eslint-disable-next-line no-console
  args: { onClick: () => console.log('Clicked!') },
};

export default meta;

export { StoryContactsButton };
