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
import { Divider } from '../divider';
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

enum SectionType {
  divider = 'divider',
  link = 'link',
}

type BaseLinkSection = {
  type: SectionType.link;
  label: string;
  icon: React.ReactElement;
  key: string;
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
  onSectionClick: (key: string) => void;
  settingsOptions: OptionsMenuOption[];
  helpOptions: OptionsMenuOption[];
  extraHeaderTools?: React.ReactElement;
}>;

const drawerWidth = 240;

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
      color: ${palette.primary.main}
    }
    &.Mui-selected:hover {
      background-color: inherit;
      color: ${palette.primary.light}
    }
    &:hover {
      background-color: inherit;
      color: ${palette.primary.light}
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
  ${({ theme: { spacing } }) => `
    display: flex;
    margin-bottom: ${spacing(5)};
    justify-content: center;
    gap: ${spacing(6)};
    margin-top: auto;
  `}
`;

const AppBarRightContainer = styled.div`
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
      <ListItemText primary={section.label} />
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
  onSectionClick: (key: string) => void;
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

const buildItem = (section: Section, selectedSection: string, onSectionClick: (key: string) => void) => {
  if (section.type === SectionType.divider) {
    return <Divider key="divider" />;
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
      isSelected={section.key === selectedSection}
      onClick={() => onSectionClick(section.key)}
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
  onSectionClick: (key: string) => void;
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
}: NavigationProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    palette: { mode },
    spacing,
  } = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerLinks = buildDrawer({ sections, selectedSection, onSectionClick });
  const icon = mode === 'light' ? <BalmyLogoLight size="110px" /> : <BalmyLogoDark size="110px" />;
  const drawer = (
    <StyledDrawerContainer>
      <StyledIconToolbar sx={{ padding: `${spacing(4)} ${spacing(6)}`, marginBottom: spacing(10) }}>
        {icon}
      </StyledIconToolbar>
      <Divider />
      {drawerLinks}
      <StyledDrawerFooterContainer>
        <Link underline="none" target="_blank" href="https://github.com/Mean-Finance">
          <GithubIcon />
        </Link>
        <Link underline="none" target="_blank" href="https://twitter.com/mean_fi">
          <TwitterIcon />
        </Link>
        <Link underline="none" target="_blank" href="http://discord.mean.finance">
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
              <MenuIcon />
            </IconButton>
            <AppBarRightContainer>
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
            display: { sm: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { sm: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </>
  );
};

export { NavigationProps, Navigation, Section, SectionType, LinkSection, DividerSection };
