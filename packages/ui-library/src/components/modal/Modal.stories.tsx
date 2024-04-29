import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Modal } from '.';
import type { ModalProps } from '.';
import { Button } from '@mui/material';
import { OptionsMenu, OptionsMenuOptionType } from '../options-menu';
import { ContentCopyIcon, DeleteIcon, EditIcon } from '../../icons';

type Story = StoryObj<typeof Modal>;

function StoryModal({ children, ...args }: ModalProps) {
  return <Modal {...args}>{children}</Modal>;
}

export const ActionsModal: Story = {
  args: {
    actions: [
      {
        label: 'action 1',
        onClick: () => {},
        options: [
          { text: 'option 1', onClick: () => {} },
          { text: 'option 2', onClick: () => {} },
        ],
      },
      {
        label: 'action 2',
        onClick: () => {},
        options: [
          { text: 'option 1', onClick: () => {} },
          { text: 'option 2', onClick: () => {} },
        ],
      },
    ],
  },
  render: (args: ModalProps) => <Modal {...args} />,
};

export const NestedModal: Story = {
  args: {
    showCloseButton: false,
    children: (
      <OptionsMenu
        mainDisplay={'Check out this menu :)'}
        options={[
          {
            type: OptionsMenuOptionType.option,
            Icon: ContentCopyIcon,
            label: 'Copy',
            onClick: () => {},
          },
          {
            type: OptionsMenuOptionType.option,
            Icon: EditIcon,
            label: 'Edit',
            onClick: () => {},
          },
          {
            type: OptionsMenuOptionType.divider,
          },
          {
            type: OptionsMenuOptionType.option,
            Icon: DeleteIcon,
            label: 'Delete',
            color: 'error',
            onClick: () => {},
          },
        ]}
      />
    ),
  },
  render: (args: ModalProps) => <Modal {...args} />,
};

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
    headerButton: <Button variant="contained">Click me</Button>,
  },
};

export default meta;

export { StoryModal };
