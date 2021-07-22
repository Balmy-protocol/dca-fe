import React from 'react';
import styled from 'styled-components';
import FloatingMenu from 'common/floating-menu';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TwitterIcon from '@material-ui/icons/Twitter';
import DescriptionIcon from '@material-ui/icons/Description';
import GitHubIcon from '@material-ui/icons/GitHub';

const StyledListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

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
      <ListItemLink href="https://github.com/Mean-Finance/dca" target="_blank">
        <ListItemIcon>
          <GitHubIcon />
        </ListItemIcon>
        <ListItemText primary="Code" />
      </ListItemLink>
    </List>
  </FloatingMenu>
);

export default EtcButton;
