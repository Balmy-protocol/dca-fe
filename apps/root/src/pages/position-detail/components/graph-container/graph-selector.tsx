import * as React from 'react';
import find from 'lodash/find';
import isUndefined from 'lodash/isUndefined';
import Button from '@common/components/button';
import { createStyles } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Menu, MenuItem } from 'ui-library';

const StyledMenu = withStyles(Menu, () =>
  createStyles({
    paper: {
      backgroundColor: '#1d1c1c',
      border: '2px solid rgba(255, 255, 255, 0.5)',
    },
  })
);

interface GraphSelectorProps {
  setGraph: (sorting: number) => void;
  selected: number;
  options: {
    key: number;
    title: React.ReactNode;
  }[];
}

const GraphSelector = ({ setGraph, selected, options }: GraphSelectorProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (key: number) => {
    if (!isUndefined(key) && typeof key === 'number') {
      setGraph(key);
    }
    setAnchorEl(null);
  };
  const selectedOption = find(options, { key: selected });

  return (
    <div>
      <Button
        variant="outlined"
        color="default"
        disableElevation
        onClick={handleClick}
        startIcon={<TimelineIcon />}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {selectedOption?.title}
      </Button>
      <StyledMenu
        elevation={0}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {options.map((option) => (
          <MenuItem onClick={() => handleClose(option.key)} disableRipple key={option.key}>
            {option.title}
          </MenuItem>
        ))}
      </StyledMenu>
    </div>
  );
};

export default GraphSelector;
