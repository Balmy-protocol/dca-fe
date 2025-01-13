import * as React from 'react';
import find from 'lodash/find';
import isUndefined from 'lodash/isUndefined';
import { Menu, MenuItem, KeyboardArrowDownIcon, Button } from 'ui-library';
import useAnalytics from '@hooks/useAnalytics';

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
  const { trackEvent } = useAnalytics();
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (key: number) => {
    if (!isUndefined(key) && typeof key === 'number') {
      setGraph(key);
      trackEvent('Position details - Change selected graph');
    }
    setAnchorEl(null);
  };
  const selectedOption = find(options, { key: selected });

  return (
    <div>
      <Button disableElevation onClick={handleClick} endIcon={<KeyboardArrowDownIcon />}>
        {selectedOption?.title}
      </Button>
      <Menu
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
      </Menu>
    </div>
  );
};

export default GraphSelector;
