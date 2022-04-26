import React from 'react';
import FloatingMenu from 'common/floating-menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import List from '@mui/material/List';
import ListItem, { ListItemProps } from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TwitterIcon from '@mui/icons-material/Twitter';
import DescriptionIcon from '@mui/icons-material/Description';
import GitHubIcon from '@mui/icons-material/GitHub';

function ListItemLink(props: ListItemProps<'a', { button?: true }>) {
  return <ListItem button component="a" {...props} />;
}

const EtcButton = () => (
  <FloatingMenu buttonContent={<MoreVertIcon />}>
    <List>
      <ListItemLink href="https://twitter.com/mean_fi" target="_blank">
        <ListItemIcon>
          <TwitterIcon />
        </ListItemIcon>
        <ListItemText primary="Twitter" />
      </ListItemLink>
      <ListItemLink href="https://docs.mean.finance" target="_blank">
        <ListItemIcon>
          <DescriptionIcon />
        </ListItemIcon>
        <ListItemText primary="Docs" />
      </ListItemLink>
      <ListItemLink href="https://github.com/Mean-Finance/dca-v2-core" target="_blank">
        <ListItemIcon>
          <GitHubIcon />
        </ListItemIcon>
        <ListItemText primary="Code" />
      </ListItemLink>
    </List>
  </FloatingMenu>
);

export default EtcButton;
