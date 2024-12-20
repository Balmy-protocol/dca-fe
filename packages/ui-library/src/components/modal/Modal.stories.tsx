import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Modal } from '.';
import type { ModalProps } from '.';
import { Button } from '@mui/material';
import { OptionsMenu, OptionsMenuOptionType } from '../options-menu';
import { ContentCopyIcon, DeleteIcon, EditIcon } from '../../icons';
import { ContainerBox } from '../container-box';

type Story = StoryObj<typeof Modal>;

function StoryModal({ children, ...args }: ModalProps) {
  const [open, setOpen] = useState(args.open);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal onClose={() => setOpen(false)} {...args} open={open}>
        {children}
      </Modal>
    </>
  );
}

export const ActionsModal: Story = {
  args: {
    actions: [
      {
        label: 'action 1',
        onClick: () => {},
      },
      {
        label: 'action 2',
        onClick: () => {},
      },
    ],
  },
  render: (args: ModalProps) => (
    <StoryModal {...args}>
      <ContainerBox>Some content</ContainerBox>
      <ContainerBox>Some other content</ContainerBox>
      <ContainerBox>And of course, more content</ContainerBox>
    </StoryModal>
  ),
};

export const HorizontalActionsModal: Story = {
  args: {
    actionsAlignment: 'horizontal',
    actions: [
      {
        label: 'action 1',
        onClick: () => {},
      },
      {
        label: 'action 2',
        onClick: () => {},
      },
    ],
  },
  render: (args: ModalProps) => <StoryModal {...args}>child</StoryModal>,
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
  render: (args: ModalProps) => <StoryModal {...args} />,
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
    open: false,
    showCloseButton: true,
    showCloseIcon: true,
    title: 'Modal title',
    closeOnBackdrop: true,
    headerButton: <Button variant="contained">Click me</Button>,
  },
};

export default meta;

export { StoryModal };
