import React, { useState } from 'react';
import {
  DiscordIcon,
  GithubIcon,
  HelpIcon,
  CogIcon,
  MenuIcon,
  TwitterIcon,
  ExpandLessIcon,
  ExpandMoreIcon,
} from '../../icons';
import { AppBar } from '../appbar';
import { Toolbar } from '../toolbar';
import { IconButton } from '../iconbutton';
import { Drawer } from '../drawer';
import { Collapse } from '../collapse';
import { Box } from '../box';
import { DividerBorder2 } from '../divider';
import { List } from '../list';
import { ListItem } from '../listitem';
import { ListItemButton } from '../listitembutton';
import { ListItemIcon } from '../listitemicon';
import { ListItemText } from '../listitemtext';
import { Container } from '../container';
import { Link, Typography, useTheme } from '@mui/material';
import BalmyLogoLight from '../../assets/balmy-logo-light';
import BalmyLogoDark from '../../assets/balmy-logo-dark';
import styled from 'styled-components';
import { OptionsMenu, OptionsMenuOption } from '../options-menu';
import { colors } from '../../theme/colors';
import { ContainerBox } from '../container-box';
import isUndefined from 'lodash/isUndefined';

enum SectionType {
  divider = 'divider',
  link = 'link',
  group = 'group',
}

type BaseLinkSection = {
  type: SectionType.link;
  label: string;
  icon: React.ReactElement;
  key: string;
  activeKeys?: string[];
};

type LinkSection = BaseLinkSection & {
  options?: BaseLinkSection[];
};

type GroupSection = {
  sections: LinkSection[];
  type: SectionType.group;
  label: string;
};

type DividerSection = {
  type: SectionType.divider;
};

type Section = LinkSection | DividerSection | GroupSection;

type NavigationProps = React.PropsWithChildren<{
  selectedSection: string;
  sections: Section[];
  onSectionClick: (section: Section, openInNewTab?: boolean) => void;
  settingsOptions: OptionsMenuOption[];
  helpOptions: OptionsMenuOption[];
  extraHeaderTools?: React.ReactElement;
  onClickBrandLogo: () => void;
  headerContent?: React.ReactNode;
}>;

const drawerWidthMd = 240;
const drawerWidthSm = 200;

const StyledIconToolbar = styled(Toolbar)`
  ${({ theme: { spacing } }) => `
    padding: 0px ${spacing(6)};
  `}
`;

const StyledListItemButton = styled(ListItemButton)`
  ${({ theme: { spacing, palette } }) => `
    padding: ${spacing(3)} ${spacing(4)};
    color: ${colors[palette.mode].typography.typo3};
    &.Mui-selected {
      background-color: inherit;
      color: ${colors[palette.mode].accent.primary}
    }
    &.Mui-selected:hover {
      background-color: inherit;
      color: ${colors[palette.mode].accent.primary}
    }
    &:hover {
      background-color: ${colors[palette.mode].background.emphasis};
      color: ${colors[palette.mode].accent.accent600};
      border-radius: ${spacing(2)};
    }
  `}
`;

const StyledListItemIcon = styled(ListItemIcon)`
  ${({ theme: { spacing } }) => `
    color: inherit;

    min-width: 0;
    margin-right: ${spacing(3)};
  `}
`;

const StyledDrawerContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledDrawerFooterContainer = styled.div`
  ${({
    theme: {
      space,
      palette: { mode },
    },
  }) => `
    display: flex;
    margin-bottom: ${space.s05};
    justify-content: center;
    gap: ${space.s05};
    margin-top: auto;
    color: ${colors[mode].typography.typo3}
  `}
`;

const AppBarRightContainer = styled(ContainerBox)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`;

const BuiltListItem = ({
  section,
  isSelected,
  showChevron,
  isOpen,
  onClick,
}: {
  section: LinkSection;
  isSelected: boolean;
  showChevron?: boolean;
  isOpen?: boolean;
  onClick: (openInNewTab?: boolean) => void;
}) => (
  <ListItem key={section.key} disablePadding>
    <StyledListItemButton selected={isSelected} onClick={(evt) => onClick(evt.ctrlKey || evt.metaKey)}>
      <StyledListItemIcon>{section.icon}</StyledListItemIcon>
      <ListItemText
        primary={section.label}
        primaryTypographyProps={{ variant: 'bodySmallRegular', color: 'inherit' }}
      />
      {showChevron && <>{isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</>}
    </StyledListItemButton>
  </ListItem>
);

const CollapsableItems = ({
  section,
  selectedSection,
  onSectionClick,
}: {
  section: LinkSection;
  selectedSection: string;
  onSectionClick: (section: Section, openInNewTab?: boolean) => void;
}) => {
  const [open, setOpen] = useState<undefined | boolean>();
  const { options, ...sectionWithoutOptions } = section;

  const isOpen = isUndefined(open) ? !!options?.find((option) => option.key === selectedSection) : open;

  return (
    <>
      <BuiltListItem
        section={sectionWithoutOptions}
        isSelected={section.key === selectedSection || !!section.activeKeys?.includes(selectedSection)}
        showChevron
        isOpen={isOpen}
        onClick={() => setOpen((oldSetOpen) => !oldSetOpen)}
      />
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List dense disablePadding sx={({ spacing }) => ({ padding: `0 ${spacing(3)}` })}>
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          {options?.map((subSection) => buildItem(subSection, selectedSection, onSectionClick))}
        </List>
      </Collapse>
    </>
  );
};

const StyledGroupContainer = styled(ContainerBox).attrs({ gap: 2, flexDirection: 'column' })``;

const StyledDrawerLinksContainer = styled(ContainerBox).attrs({ gap: 8, flexDirection: 'column' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(8)} ${spacing(4)};
  `}
`;

const StyledGroupTitle = styled(Typography).attrs({ variant: 'labelRegular' })`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    color: ${colors[mode].typography.typo4};
  `}
`;

const BuiltGroupItem = ({
  section,
  selectedSection,
  onSectionClick,
}: {
  section: GroupSection;
  selectedSection: string;
  onSectionClick: (section: Section) => void;
}) => {
  const { sections } = section;

  return (
    <StyledGroupContainer>
      <StyledGroupTitle>{section.label}</StyledGroupTitle>
      <List dense disablePadding sx={{ padding: 0 }}>
        {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
        {sections.map((subSection) => buildItem(subSection, selectedSection, onSectionClick))}
      </List>
    </StyledGroupContainer>
  );
};

const buildItem = (
  section: Section,
  selectedSection: string,
  onSectionClick: (section: Section, openInNewTab?: boolean) => void
) => {
  if (section.type === SectionType.divider) {
    return <DividerBorder2 />;
  }

  if (section.type === SectionType.group) {
    return <BuiltGroupItem section={section} selectedSection={selectedSection} onSectionClick={onSectionClick} />;
  }

  if (section.options) {
    return (
      <CollapsableItems
        key={section.key}
        section={section}
        selectedSection={selectedSection}
        onSectionClick={onSectionClick}
      />
    );
  }

  return (
    <BuiltListItem
      section={section}
      isSelected={section.key === selectedSection || !!section.activeKeys?.includes(selectedSection)}
      onClick={(openInNewTab) => onSectionClick(section, openInNewTab)}
      key={section.key}
    />
  );
};

const buildDrawer = ({
  sections,
  selectedSection,
  onSectionClick,
}: {
  sections: Section[];
  selectedSection: string;
  onSectionClick: (section: Section, openInNewTab?: boolean) => void;
}) => {
  const items = [];
  let i = 0;

  while (i < sections.length) {
    let section = sections[i];

    if (section.type === SectionType.group) {
      const links = [];
      while (i < sections.length && sections[i].type === SectionType.group) {
        links.push(buildItem(section, selectedSection, onSectionClick));
        i++;
        section = sections[i];
      }
      items.push(
        <List dense sx={{ padding: 0 }}>
          {links}
        </List>
      );
    } else if (sections[i].type === SectionType.link) {
      const links = [];
      while (i < sections.length && sections[i].type === SectionType.link) {
        links.push(buildItem(section, selectedSection, onSectionClick));
        i++;
        section = sections[i];
      }
      items.push(
        <List dense sx={{ padding: 0 }}>
          {links}
        </List>
      );
    } else if (section.type === SectionType.divider) {
      items.push(buildItem(section, selectedSection, onSectionClick));
      i++;
    }
  }

  return items;
};

const StyledBeamerContainer = styled(ContainerBox)`
  .beamer_icon.active {
    top: -5px !important;
    right: -8px !important;
  }
`;
const Navigation = ({
  children,
  sections,
  selectedSection,
  onSectionClick,
  settingsOptions,
  helpOptions,
  extraHeaderTools,
  onClickBrandLogo,
  headerContent,
}: NavigationProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    palette: { mode },
    spacing,
    breakpoints,
  } = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerWidth = breakpoints.down('md') ? drawerWidthSm : drawerWidthMd;
  const drawerLinks = buildDrawer({ sections, selectedSection, onSectionClick });

  const iconProps = { cursor: 'pointer', onClick: onClickBrandLogo, size: '110px' };
  const icon = mode === 'light' ? <BalmyLogoLight {...iconProps} /> : <BalmyLogoDark {...iconProps} />;

  const drawer = (
    <StyledDrawerContainer>
      <StyledIconToolbar sx={{ padding: `${spacing(4)} ${spacing(6)}` }}>{icon}</StyledIconToolbar>
      {headerContent}
      <StyledDrawerLinksContainer>{drawerLinks}</StyledDrawerLinksContainer>
      <StyledDrawerFooterContainer>
        <Link
          underline="none"
          target="_blank"
          href="https://github.com/balmy-protocol"
          sx={{ color: colors[mode].typography.typo3 }}
        >
          <GithubIcon />
        </Link>
        <Link
          underline="none"
          target="_blank"
          href="https://twitter.com/balmy_xyz"
          sx={{ color: colors[mode].typography.typo3 }}
        >
          <TwitterIcon />
        </Link>
        <Link
          underline="none"
          target="_blank"
          href="http://discord.balmy.xyz"
          sx={{ color: colors[mode].typography.typo3 }}
        >
          <DiscordIcon />
        </Link>
      </StyledDrawerFooterContainer>
    </StyledDrawerContainer>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: colors[mode].background.secondary,
        }}
      >
        <Container>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon sx={{ color: colors[mode].accentPrimary }} />
            </IconButton>
            <AppBarRightContainer alignItems="center" justifyContent="flex-end" flex={1} gap={2}>
              {extraHeaderTools}
              <OptionsMenu
                options={helpOptions}
                mainDisplay={
                  <StyledBeamerContainer className="beamer-whats-new" data-beamer-click="false">
                    <HelpIcon />
                  </StyledBeamerContainer>
                }
              />
              <OptionsMenu options={settingsOptions} mainDisplay={<CogIcon />} />
            </AppBarRightContainer>
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: colors[mode].background.secondary,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: colors[mode].background.secondary,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex !important',
          flexDirection: 'column',
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          alignSelf: 'flex-end',
          padding: 0,
          maxWidth: '100%',
          alignItems: 'center',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </>
  );
};

export { NavigationProps, Navigation, Section, SectionType, LinkSection, DividerSection };
