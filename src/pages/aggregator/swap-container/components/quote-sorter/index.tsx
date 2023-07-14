import * as React from 'react';
import styled from 'styled-components';
import find from 'lodash/find';
import { FormattedMessage } from 'react-intl';
import { SORT_LEAST_GAS, SORT_MOST_PROFIT, SORT_MOST_RETURN, SwapSortOptions } from '@constants/aggregator';
import Button from '@common/components/button';
import { createStyles, Theme } from '@mui/material';
import { withStyles } from '@mui/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface QuoteSorterProps {
  isLoading: boolean;
}

const SORT_OPTIONS = () => [
  {
    key: SORT_MOST_RETURN,
    label: (
      <FormattedMessage
        description="sortMostReturnSellOrder"
        defaultMessage="Most received tokens / Less spent tokens (for buy orders)"
      />
    ),
    help: (
      <FormattedMessage
        description="sortMostReturnSellOrderHelp"
        defaultMessage="Sort routes by where you can receive more tokens/spend less tokens"
      />
    ),
  },
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

const QuoteSorter = ({ isLoading }: QuoteSorterProps) => {
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

  const selectedOption = find(SORT_OPTIONS(), { key: sorting });

  return (
    <StyledContainer>
      <Typography variant="body1" sx={{ display: 'flex' }}>
        <FormattedMessage description="selectBestQuoteBy" defaultMessage="Select by" />
      </Typography>
      <Button
        variant="text"
        color="default"
        disableElevation
        onClick={handleClick}
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
        {SORT_OPTIONS().map((option) => (
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
    </StyledContainer>
  );
};

export default QuoteSorter;
