import React from 'react';
import {
  Grid,
  Typography,
  Button,
  KeyboardArrowDownIcon,
  Menu,
  MenuItem,
  ContainerBox,
  useTheme,
  useMediaQuery,
  BackgroundPaper,
  PillTabs,
} from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import PositionTimeline, { PositionTimelineProps } from './timeline';
import find from 'lodash/find';
import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components';

const StyledPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)}
  `}
`;

export type TimelineItemComponent = {
  transactionData: () => React.ReactElement;
  icon: React.ComponentType;
  content: () => React.ReactElement;
};

export type TimelineMessageMap<ActionTypeAction extends string, TAction, TPosition> = Record<
  ActionTypeAction,
  (positionState: TAction, position: TPosition) => TimelineItemComponent
>;

interface PositionTimelineControlsProps<TAction, TPosition> extends PositionTimelineProps<TAction, TPosition> {
  tabIndex: number;
  setTabIndex: (tabIndex: number) => void;
  options: FilterOptions;
}

type FilterOptions = {
  key: number;
  title: ReturnType<typeof defineMessage>;
}[];

interface PositionTimelineSelectControlProps {
  options: FilterOptions;
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
    <PillTabs
      options={options.map(({ title, key }) => ({
        key,
        label: intl.formatMessage(title),
      }))}
      selected={selected}
      onChange={onSelect}
      disabled={disabled}
    />
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
  const handleClose = (key?: number) => {
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
        onClose={() => handleClose()}
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

const PositionTimelineControls = <TAction, TPosition>({
  options,
  setTabIndex,
  tabIndex,
  ...timelineProps
}: PositionTimelineControlsProps<TAction, TPosition>) => {
  const theme = useTheme();
  const shouldUseSelectMenu = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <StyledPaper>
      <Grid container rowSpacing={6}>
        <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="bodyBold">
            <FormattedMessage description="timeline" defaultMessage="Timeline" />
          </Typography>
          {shouldUseSelectMenu ? (
            <PositionTimelineSelectControl options={options} selected={tabIndex} onSelect={setTabIndex} />
          ) : (
            <PositionTimelineFiltersControl options={options} selected={tabIndex} onSelect={setTabIndex} />
          )}
        </Grid>
        <Grid item xs={12}>
          <PositionTimeline {...timelineProps} />
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default PositionTimelineControls;
