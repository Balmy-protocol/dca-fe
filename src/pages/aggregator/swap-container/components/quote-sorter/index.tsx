import * as React from 'react';
import styled from 'styled-components';
import find from 'lodash/find';
import { FormattedMessage } from 'react-intl';
import { SORT_LEAST_GAS, SORT_MOST_PROFIT, SORT_MOST_RETURN, SwapSortOptions } from '@constants/aggregator';
import Button from '@common/components/button';
import { createStyles, Theme } from '@mui/material';
import { withStyles } from '@mui/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SortIcon from '@mui/icons-material/Sort';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useAppDispatch } from '@state/hooks';
import { setSorting } from '@state/aggregator-settings/actions';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';

const DarkTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 5px;
`;

const StyledMenu = withStyles(() =>
  createStyles({
    paper: {
      backgroundColor: '#1d1c1c',
      border: '2px solid rgba(255, 255, 255, 0.5)',
    },
  })
)(Menu);

interface QuoteSorterProps {
  isLoading: boolean;
  isBuyOrder: boolean;
}

const SORT_OPTIONS = (isBuyOrder: boolean) => [
  ...(isBuyOrder
    ? [
        {
          key: SORT_MOST_RETURN,
          label: <FormattedMessage description="sortMostReturnBuyOrder" defaultMessage="Least spent" />,
          help: (
            <FormattedMessage
              description="sortMostReturnBuyOrderHelp"
              defaultMessage="Sort routes by where you have to spend less tokens"
            />
          ),
        },
      ]
    : [
        {
          key: SORT_MOST_RETURN,
          label: <FormattedMessage description="sortMostReturnSellOrder" defaultMessage="Most received tokens" />,
          help: (
            <FormattedMessage
              description="sortMostReturnSellOrderHelp"
              defaultMessage="Sort routes by where you can receive more tokens"
            />
          ),
        },
      ]),
  {
    key: SORT_MOST_PROFIT,
    label: <FormattedMessage description="sortHighReturn" defaultMessage="Gas cost considered" />,
    help: (
      <FormattedMessage
        description="sortHighReturnHelp"
        defaultMessage="Sort routes by the best relation between price and gas cost"
      />
    ),
  },
  {
    key: SORT_LEAST_GAS,
    label: <FormattedMessage description="sortLeastGas" defaultMessage="Least gas" />,
    help: <FormattedMessage description="sortLeastGasHelp" defaultMessage="Sort routes by least gas spent" />,
  },
];

const QuoteSorter = ({ isLoading, isBuyOrder }: QuoteSorterProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { sorting } = useAggregatorSettingsState();
  const open = Boolean(anchorEl);
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const setQuoteSorting = (newSort: SwapSortOptions) => {
    dispatch(setSorting(newSort));
    trackEvent('Aggregator - Change selected sorting', { sort: newSort });
  };

  const handleClose = (key: SwapSortOptions) => {
    if (key && typeof key === 'string') {
      setQuoteSorting(key);
    }
    setAnchorEl(null);
  };

  const selectedOption = find(SORT_OPTIONS(isBuyOrder), { key: sorting });

  return (
    <div>
      <Button
        variant="outlined"
        color="default"
        disableElevation
        onClick={handleClick}
        startIcon={<SortIcon />}
        endIcon={<KeyboardArrowDownIcon />}
        disabled={isLoading}
      >
        {selectedOption?.label}
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
        {SORT_OPTIONS(isBuyOrder).map((option) => (
          <MenuItem onClick={() => handleClose(option.key as SwapSortOptions)} disableRipple key={option.key}>
            {option.label}
            <Typography variant="body2" sx={{ display: 'flex' }}>
              <DarkTooltip title={option.help} arrow placement="top">
                <StyledHelpOutlineIcon fontSize="inherit" />
              </DarkTooltip>
            </Typography>
          </MenuItem>
        ))}
      </StyledMenu>
    </div>
  );
};

export default QuoteSorter;
