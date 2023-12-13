import React from 'react';
import type { Meta } from '@storybook/react';
import { EmailIcon, WalletIcon, SendIcon, BugReportIcon } from '../../icons';

import { Navigation, SectionType } from '.';
import type { NavigationProps } from '.';

function StoryNavigation({ children, ...args }: NavigationProps) {
  return <Navigation {...args}>{children}</Navigation>;
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryNavigation> = {
  title: 'Components/Navigation',
  component: StoryNavigation,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryNavigation {...args}>child</StoryNavigation>,
  args: {
    sections: [
      {
        label: 'Inbox',
        key: 'inbox',
        type: SectionType.link,
        icon: <EmailIcon />,
      },
      {
        label: 'Starred',
        key: 'starred',
        type: SectionType.link,
        icon: <WalletIcon />,
      },
      {
        label: 'Send Email',
        key: 'email',
        type: SectionType.link,
        icon: <SendIcon />,
      },
      {
        label: 'Nested Drafts',
        key: 'drafts',
        type: SectionType.link,
        icon: <BugReportIcon />,
        options: [
          {
            label: 'One nested',
            key: 'nested-1',
            type: SectionType.link,
            icon: <EmailIcon />,
          },
          {
            label: 'Two nested',
            key: 'nested-2',
            type: SectionType.link,
            icon: <SendIcon />,
          },
          {
            label: 'Three nested',
            key: 'nested-3',
            type: SectionType.link,
            icon: <WalletIcon />,
          },
        ],
      },
      {
        type: SectionType.divider,
      },
      {
        label: 'All email',
        key: 'allEmail',
        type: SectionType.link,
        icon: <EmailIcon />,
      },
      {
        label: 'Trash',
        key: 'trash',
        type: SectionType.link,
        icon: <WalletIcon />,
      },
      {
        label: 'Spam',
        key: 'spam',
        type: SectionType.link,
        icon: <SendIcon />,
      },
    ],
    selectedSection: 'inbox',
  },
};

export default meta;

export { StoryNavigation };
