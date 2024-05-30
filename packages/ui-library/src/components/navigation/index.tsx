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
import { Link, useTheme } from '@mui/material';
import BalmyLogoLight from '../../assets/balmy-logo-light';
import BalmyLogoDark from '../../assets/balmy-logo-dark';
import styled from 'styled-components';
import { OptionsMenu, OptionsMenuOption } from '../options-menu';
import { SPACING } from '../../theme/constants';
import { colors } from '../../theme/colors';
import { ContainerBox } from '../container-box';

enum SectionType {
  divider = 'divider',
  link = 'link',
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

type DividerSection = {
  type: SectionType.divider;
};

type Section = LinkSection | DividerSection;

type NavigationProps = React.PropsWithChildren<{
  selectedSection: string;
  sections: Section[];
  onSectionClick: (section: Section) => void;
  settingsOptions: OptionsMenuOption[];
  helpOptions: OptionsMenuOption[];
  extraHeaderTools?: React.ReactElement;
  onClickBrandLogo: () => void;
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
    padding: ${spacing(3)} ${spacing(6)};
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
      spacing,
      palette: { mode },
    },
  }) => `
    display: flex;
    margin-bottom: ${spacing(5)};
    justify-content: center;
    gap: ${spacing(6)};
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
  onClick: () => void;
}) => (
  <ListItem key={section.key} disablePadding>
    <StyledListItemButton selected={isSelected} onClick={onClick}>
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
  onSectionClick: (section: Section) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { options, ...sectionWithoutOptions } = section;

  const isOpen = open || !!options?.find((option) => option.key === selectedSection);

  return (
    <>
      <BuiltListItem
        section={sectionWithoutOptions}
        isSelected={false}
        showChevron
        isOpen={isOpen}
        onClick={() => setOpen((oldSetOpen) => !oldSetOpen)}
      />
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List dense disablePadding sx={{ padding: `0 ${SPACING(3)}` }}>
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          {options?.map((subSection) => buildItem(subSection, selectedSection, onSectionClick))}
        </List>
      </Collapse>
    </>
  );
};

const buildItem = (section: Section, selectedSection: string, onSectionClick: (section: Section) => void) => {
  if (section.type === SectionType.divider) {
    return <DividerBorder2 />;
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
      onClick={() => onSectionClick(section)}
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
  onSectionClick: (section: Section) => void;
}) => {
  const items = [];
  let lastSectionType: SectionType | undefined = undefined;
  let i = 0;

  while (i < sections.length) {
    let section = sections[i];

    if (lastSectionType !== SectionType.link && sections[i].type === SectionType.link) {
      const links = [];
      while (i < sections.length && section.type === SectionType.link) {
        links.push(buildItem(section, selectedSection, onSectionClick));
        i++;
        section = sections[i];
      }
      items.push(<List dense>{links}</List>);
    } else if (section.type === SectionType.divider) {
      items.push(buildItem(section, selectedSection, onSectionClick));
      i++;
    }

    lastSectionType = section && section.type;
  }

  return items;
};
const Navigation = ({
  children,
  sections,
  selectedSection,
  onSectionClick,
  settingsOptions,
  helpOptions,
  extraHeaderTools,
  onClickBrandLogo,
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
      <StyledIconToolbar sx={{ padding: `${spacing(4)} ${spacing(6)}`, marginBottom: spacing(10) }}>
        {icon}
      </StyledIconToolbar>
      <DividerBorder2 />
      {drawerLinks}
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
              <OptionsMenu options={helpOptions} mainDisplay={<HelpIcon />} />
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
