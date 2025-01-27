import React from 'react';
import type { Meta } from '@storybook/react';
import { EmailIcon, WalletIcon, SendIcon, BugReportIcon } from '../../icons';

import { Navigation, SectionType } from '.';
import type { NavigationProps } from '.';
import { ContainerBox } from '..';
import styled from 'styled-components';
import { colors } from '../../theme/colors';

const StyledContainerBox = styled(ContainerBox)`
  width: 990px;
  height: 1000px;
`;
function StoryNavigation({ children, ...args }: NavigationProps) {
  return (
    <StyledContainerBox>
      <Navigation {...args}>{children}</Navigation>
    </StyledContainerBox>
  );
}

const StyledPromotedBanner = styled(ContainerBox).attrs({ flex: 1, gap: 1 })`
  ${({
    theme: {
      palette: { mode, gradient },
      spacing,
    },
  }) => `
  // width: 208px;
  // height: 122px;
  padding: ${spacing(3)};
  position: relative;

  border-radius: ${spacing(3)};
  border: 1px solid ${colors[mode].accent.primary};
  background: ${gradient.earnWizard};

  /* dropshadow/100 */
    box-shadow: ${colors[mode].dropShadow.dropShadow100};
  `}
`;
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
    settingsOptions: [],
    helpOptions: [],
    onClickBrandLogo: () => {},
    headerContent: <div>Header content</div>,
    sections: [
      {
        label: 'Inbox',
        key: 'inbox',
        type: SectionType.link,
        icon: <EmailIcon />,
      },
      {
        type: SectionType.group,
        label: 'Starred',
        sections: [
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
        ],
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
    promotedBanner: <StyledPromotedBanner>Promoted banner</StyledPromotedBanner>,
  },
};

export default meta;

export { StoryNavigation };
