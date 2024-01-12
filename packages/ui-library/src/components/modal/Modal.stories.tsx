import React from 'react';
import type { Meta } from '@storybook/react';

import { Modal } from '.';
import type { ModalProps } from '.';
import { Button } from '@mui/material';

function StoryModal({ children, ...args }: ModalProps) {
  return <Modal {...args}>{children}</Modal>;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryModal> = {
  title: 'Components/Modal',
  component: StoryModal,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryModal {...args}>child</StoryModal>,
  args: {
    open: true,
    showCloseButton: true,
    showCloseIcon: true,
    title: 'Modal title',
    closeOnBackdrop: true,
    headerButton: <Button>Click me</Button>,
  },
};

export default meta;

export { StoryModal };
