import React from 'react';
import {
  Grid,
  Tabs,
  Tab,
  Typography,
  createStyles,
  Button,
  KeyboardArrowDownIcon,
  Menu,
  MenuItem,
  ContainerBox,
  useTheme,
  useMediaQuery,
} from 'ui-library';
import { withStyles } from 'tss-react/mui';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import PositionTimeline from './components/timeline';
import { PositionWithHistory } from 'common-types';
import find from 'lodash/find';
import isUndefined from 'lodash/isUndefined';

const StyledTab = withStyles(Tab, () =>
  createStyles({
    root: {
      padding: '5px',
      margin: '0 5px',
      minWidth: 'auto',
    },
  })
);

interface PositionSwapsProps {
  position?: PositionWithHistory;
  isLoading: boolean;
}

interface PositionTimelineSelectControlProps {
  options: {
    key: number;
    title: ReturnType<typeof defineMessage>;
  }[];
  selected: number;
  onSelect: (option: number) => void;
  disabled?: boolean;
}

const PositionTimelineFiltersControl = ({
  onSelect,
  options,
  selected,
  disabled,
}: PositionTimelineSelectControlProps) => {
  const intl = useIntl();

  return (
    <Tabs
      value={selected}
      TabIndicatorProps={{ style: { bottom: '8px' } }}
      onChange={(e, index: number) => onSelect(index)}
    >
      {options.map(({ title, key }) => (
        <StyledTab
          disableRipple
          key={key}
          label={
            <Typography variant="bodySmallRegular" color="inherit">
              {intl.formatMessage(title)}
            </Typography>
          }
          disabled={disabled}
        />
      ))}
    </Tabs>
  );
};

const PositionTimelineSelectControl = ({
  onSelect,
  options,
  selected,
  disabled,
}: PositionTimelineSelectControlProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const intl = useIntl();
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (key: number) => {
    if (!isUndefined(key) && typeof key === 'number') {
      onSelect(key);
    }
    setAnchorEl(null);
  };

  const selectedOption = find(options, { key: selected });

  return (
    <ContainerBox>
      <Button disableElevation disabled={disabled} onClick={handleClick} endIcon={<KeyboardArrowDownIcon />}>
        {selectedOption?.title && intl.formatMessage(selectedOption?.title)}
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
            {intl.formatMessage(option.title)}
          </MenuItem>
        ))}
      </Menu>
    </ContainerBox>
  );
};

const positionTimelineFilterOptions = [
  { title: defineMessage({ description: 'all', defaultMessage: 'All' }), key: 0 },
  { title: defineMessage({ description: 'swaps', defaultMessage: 'Swaps' }), key: 1 },
  { title: defineMessage({ description: 'modifications', defaultMessage: 'Modifications' }), key: 2 },
  { title: defineMessage({ description: 'withdraws', defaultMessage: 'Withdraws' }), key: 3 },
];

const PositionSwaps = ({ position, isLoading }: PositionSwapsProps) => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = React.useState<0 | 1 | 2 | 3>(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Grid container rowSpacing={6}>
      <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">
          <FormattedMessage description="timeline" defaultMessage="Timeline" />
        </Typography>
        {isMobile ? (
          <PositionTimelineSelectControl
            options={positionTimelineFilterOptions}
            selected={tabIndex}
            onSelect={setTabIndex as (arg0: number) => void}
          />
        ) : (
          <PositionTimelineFiltersControl
            options={positionTimelineFilterOptions}
            selected={tabIndex}
            onSelect={setTabIndex as (arg0: number) => void}
          />
        )}
      </Grid>
      <Grid item xs={12}>
        <PositionTimeline position={position} filter={tabIndex} isLoading={isLoading} />
      </Grid>
    </Grid>
  );
};
export default PositionSwaps;
