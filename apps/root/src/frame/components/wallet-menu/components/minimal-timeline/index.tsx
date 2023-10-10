import React from 'react';
import styled from 'styled-components';
import { Grid, Typography, CircularProgress, IconButton, Menu, MenuItem, OpenInNewIcon } from 'ui-library';

const StyledTimeline = styled(Grid)`
  position: relative;
  padding: 0px 0px 0px 10px;
  &:before {
    content: '';
    position: absolute;
    left: 10px;
    top: 5px;
    bottom: 0px;
    width: 4px;
    border-left: 3px dashed #dce2f9;
  }
`;

const StyledTimelineContainer = styled(Grid)`
  position: relative;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  &:last-child {
    margin-bottom: 0px;
  }
`;

const StyledTimelineIcon = styled.div<{ hasIcon?: boolean }>`
  position: absolute;
  left: ${(props) => (!props.hasIcon && '-7px') || '-8px'};
  top: calc(50% - ${(props) => (!props.hasIcon && '7px') || '10px'});
  width: ${(props) => (!props.hasIcon && '16px') || '20px'};
  height: ${(props) => (!props.hasIcon && '16px') || '20px'};
  border-radius: 50%;
  text-align: center;
  background: ${(props) => (!props.hasIcon && '#dce2f9') || 'transparent'};

  i {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

const StyledTimelineContent = styled.div`
  padding: 0px;
  position: relative;
  text-align: start;
  color: rgba(255, 255, 255, 0.5) !important;
  padding: 0px 10px 0px 22px;
  overflow-wrap: anywhere;
  font-weight: 400 !important;
  flex-grow: 1;
`;

const StyledTimelineLink = styled.div``;

interface TimelineContextMenuItem {
  label: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (extraData?: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData?: any;
}
interface TimelineItemProps {
  content: React.ReactNode;
  link?: string;
  isPending: boolean;
  icon?: React.ReactElement;
  id?: string;
  contextMenu?: TimelineContextMenuItem[];
}

interface TimelineProps {
  items: TimelineItemProps[];
}

const MinimalTimeline = ({ items }: TimelineProps) => {
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    item: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            item: index,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const handleClose = (item: TimelineContextMenuItem) => {
    setContextMenu(null);
    item.action(item.extraData);
  };

  return (
    <StyledTimeline container>
      {items.map((item, index) => (
        <StyledTimelineContainer item xs={12} key={item.link} onContextMenu={(evt) => handleContextMenu(evt, index)}>
          {item.icon ? <StyledTimelineIcon hasIcon>{item.icon}</StyledTimelineIcon> : <StyledTimelineIcon />}
          <StyledTimelineContent>
            <Typography variant="body1">{item.content}</Typography>
          </StyledTimelineContent>
          <StyledTimelineLink>
            {item.isPending && <CircularProgress size={24} />}
            {!item.isPending && item.link && (
              <IconButton aria-label="close" onClick={() => window.open(item.link, '_blank')}>
                <OpenInNewIcon style={{ color: '#3076F6', fontSize: '1.5rem' }} />
              </IconButton>
            )}
          </StyledTimelineLink>
        </StyledTimelineContainer>
      ))}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        {items[contextMenu?.item || 0] &&
          items[contextMenu?.item || 0].contextMenu?.map((item, index) => (
            <MenuItem key={index} onClick={() => handleClose(item)}>
              {item.label}
            </MenuItem>
          ))}
      </Menu>
    </StyledTimeline>
  );
};
export default MinimalTimeline;
