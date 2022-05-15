import React, { CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import remove from 'lodash/remove';
import uniq from 'lodash/uniq';
import AutoSizer from 'react-virtualized-auto-sizer';
import Slide from '@mui/material/Slide';
import { Token, TokenList } from 'types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Search from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import TokenIcon from 'common/token-icon';
import { makeStyles, withStyles } from '@mui/styles';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from 'mocks/tokens';
import useAvailablePairs from 'hooks/useAvailablePairs';
import TuneIcon from '@mui/icons-material/Tune';
import Switch from '@mui/material/Switch';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import useTokenList from 'hooks/useTokenList';
import Button from 'common/button';
import TokenLists from 'common/token-lists';
import useTokenBalance from 'hooks/useTokenBalance';
import { formatCurrencyAmount } from 'utils/currency';
import FilledInput from '@mui/material/FilledInput';
import { createStyles } from '@mui/material';
import useUsdPrice from 'hooks/useUsdPrice';

type SetFromToState = React.Dispatch<React.SetStateAction<Token>>;

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: #1b1b1c;
  padding: 24px;
  display: flex;
`;

const StyledFilledInput = withStyles(() =>
  createStyles({
    root: {
      borderRadius: '8px',
    },
    input: {
      paddingTop: '8px',
    },
  })
)(FilledInput);

const StyledChip = styled(Chip)`
  margin-right: 5px;
`;

const StyledTuneIcon = styled(TuneIcon)`
  color: rgba(255, 255, 255, 0.5);
`;

const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 0px;
  margin-right: 7px;
`;

const StyledListItem = styled(ListItem)`
  padding-left: 0px;
`;

const StyledSwitchGrid = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.5) !important;
  flex: 0;
`;

const StyledList = styled(List)`
  ${({ theme }) => `
    scrollbar-width: thin;
    scrollbar-color: var(--thumbBG) var(--scrollbarBG);
    --scrollbarBG: ${theme.palette.mode === 'light' ? '#ffffff' : '#424242'};
    --thumbBG: ${theme.palette.mode === 'light' ? '#90a4ae' : '#ffffff'};
    ::-webkit-scrollbar {
      width: 11px;
    }
    ::-webkit-scrollbar-track {
      background: var(--scrollbarBG);
    }
    ::-webkit-scrollbar-thumb {
      background-color: var(--thumbBG);
      border-radius: 6px;
      border: 3px solid var(--scrollbarBG);
    }
  `}
`;

const StyledDialogTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 0;
`;

const StyledGrid = styled(Grid)<{ customSpacing?: number }>`
  margin-top: ${(props) => props.customSpacing || 0}px;
`;

const StyledBalanceContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface RowData {
  tokenList: TokenList;
  tokenKeys: string[];
  onClick: (token: string) => void;
}

interface RowProps {
  index: number;
  style: CSSProperties;
  data: RowData;
}

interface TokenPickerProps {
  shouldShow: boolean;
  availableFrom?: string[];
  onChange: SetFromToState;
  onClose: () => void;
  isFrom: boolean;
  usedTokens: string[];
  ignoreValues: string[];
}

const useListItemStyles = makeStyles(({ palette }) => ({
  root: {
    borderRadius: 6,
    color: palette.text.secondary,
    '&:hover': {
      color: palette.text.primary,
      backgroundColor: palette.mode === 'light' ? palette.grey[100] : palette.grey[700],
    },
  },
  selected: {
    '&.Mui-selected': {
      fontWeight: 500,
      // backgroundColor: palette.primary.mainaccentColor,
      color: palette.primary.main,
      '&:hover': {
        color: palette.primary.main,
        // backgroundColor: accentColor
      },
    },
  },
}));
const Row = ({ index, style, data: { onClick, tokenList, tokenKeys } }: RowProps) => {
  const classes = useListItemStyles();

  const tokenBalance = useTokenBalance(tokenList[tokenKeys[index]]);
  const [tokenValue] = useUsdPrice(tokenList[tokenKeys[index]], tokenBalance);

  return (
    <StyledListItem classes={classes} onClick={() => onClick(tokenKeys[index])} style={style}>
      <StyledListItemIcon>
        <TokenIcon size="24px" token={tokenList[tokenKeys[index]]} />
      </StyledListItemIcon>
      <ListItemText disableTypography>
        <span>
          <Typography variant="body1" component="span" color="#FFFFFF">
            {tokenList[tokenKeys[index]].name}
          </Typography>
          <Typography variant="body1" component="span" color="rgba(255, 255, 255, 0.5)">
            {` (${tokenList[tokenKeys[index]].symbol})`}
          </Typography>
        </span>
      </ListItemText>
      <StyledBalanceContainer>
        {tokenBalance && (
          <Typography variant="body1" color="#FFFFFF">
            {formatCurrencyAmount(tokenBalance, tokenList[tokenKeys[index]], 6)}
          </Typography>
        )}
        {!!tokenValue && (
          <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
            ${tokenValue.toFixed(2)}
          </Typography>
        )}
      </StyledBalanceContainer>
    </StyledListItem>
  );
};

const TokenPicker = ({
  shouldShow,
  isFrom,
  availableFrom = [],
  onClose,
  onChange,
  ignoreValues,
  usedTokens,
}: TokenPickerProps) => {
  const tokenList = useTokenList();
  const [search, setSearch] = React.useState('');
  const [isOnlyPairs, setIsOnlyPairs] = React.useState(false);
  const [shouldShowTokenLists, setShouldShowTokenLists] = React.useState(false);
  let tokenKeysToUse: string[] = [];
  const tokenKeys = React.useMemo(() => Object.keys(tokenList), [tokenList]);
  const availablePairs = useAvailablePairs();
  const currentNetwork = useCurrentNetwork();

  const handleOnClose = () => {
    if (shouldShowTokenLists) {
      setShouldShowTokenLists(false);
    } else {
      setSearch('');
      onClose();
    }
  };

  const handleItemSelected = (item: string) => {
    onChange(tokenList[item]);
    handleOnClose();
  };

  const uniqTokensFromPairs = React.useMemo(
    () =>
      uniq(availablePairs.reduce((accum, current) => [...accum, current.token0.address, current.token1.address], [])),
    [availablePairs]
  );

  tokenKeysToUse = !isOnlyPairs ? tokenKeys : uniqTokensFromPairs;

  const memoizedUsedTokens = React.useMemo(
    () => usedTokens.filter((el) => !ignoreValues.includes(el) && tokenKeysToUse.includes(el)),
    [usedTokens, ignoreValues, tokenKeysToUse]
  );

  const memoizedTokenKeys = React.useMemo(() => {
    const filteredTokenKeys = tokenKeysToUse.filter(
      (el) =>
        tokenList[el] &&
        (tokenList[el].name.toLowerCase().includes(search.toLowerCase()) ||
          tokenList[el].symbol.toLowerCase().includes(search.toLowerCase()) ||
          tokenList[el].address.toLowerCase().includes(search.toLowerCase())) &&
        !usedTokens.includes(el) &&
        !ignoreValues.includes(el) &&
        tokenList[el].chainId === currentNetwork.chainId
    );

    if (filteredTokenKeys.findIndex((el) => el === getWrappedProtocolToken(currentNetwork.chainId).address) !== -1) {
      remove(filteredTokenKeys, (token) => token === getWrappedProtocolToken(currentNetwork.chainId).address);
      filteredTokenKeys.unshift(getWrappedProtocolToken(currentNetwork.chainId).address);
    }

    if (filteredTokenKeys.findIndex((el) => el === PROTOCOL_TOKEN_ADDRESS) !== -1) {
      remove(filteredTokenKeys, (token) => token === PROTOCOL_TOKEN_ADDRESS);
      filteredTokenKeys.unshift(PROTOCOL_TOKEN_ADDRESS);
    }

    return filteredTokenKeys;
  }, [tokenKeys, search, usedTokens, ignoreValues, tokenKeysToUse, availableFrom, currentNetwork.chainId]);

  const itemData = React.useMemo(
    () => ({ onClick: handleItemSelected, tokenList, tokenKeys: memoizedTokenKeys }),
    [memoizedTokenKeys, tokenList]
  );

  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
        <IconButton
          aria-label="close"
          size="small"
          onClick={handleOnClose}
          style={{ position: 'absolute', top: '24px', right: '32px' }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
        <Grid container spacing={1} direction="column" style={{ flexWrap: 'nowrap' }}>
          {shouldShowTokenLists ? (
            <TokenLists />
          ) : (
            <>
              <Grid item xs={12} style={{ flexBasis: 'auto' }}>
                <Typography variant="body1" fontWeight={600} fontSize="1.2rem">
                  {isFrom ? (
                    <FormattedMessage description="You sell" defaultMessage="You sell" />
                  ) : (
                    <FormattedMessage description="You receive" defaultMessage="You receive" />
                  )}
                </Typography>
              </Grid>
              <StyledGrid item xs={12} customSpacing={12} style={{ flexBasis: 'auto' }}>
                <StyledFilledInput
                  placeholder="Search your token"
                  onChange={(evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                    setSearch(evt.currentTarget.value)
                  }
                  fullWidth
                  disableUnderline
                  endAdornment={<Search />}
                  type="text"
                  margin="none"
                />
              </StyledGrid>
              <StyledSwitchGrid item xs={12}>
                <FormattedMessage
                  description="createdPairsSwitchToken"
                  defaultMessage="Only tokens with created pairs"
                />
                <Switch
                  checked={isOnlyPairs}
                  onChange={() => setIsOnlyPairs(!isOnlyPairs)}
                  name="isOnlyPairs"
                  color="primary"
                />
              </StyledSwitchGrid>
              {!!memoizedUsedTokens.length && (
                <>
                  <StyledGrid item xs={12} customSpacing={12} style={{ flexBasis: 'auto' }}>
                    <Typography variant="caption">
                      <FormattedMessage description="your tokens" defaultMessage="Tokens in your wallet" />
                    </Typography>
                  </StyledGrid>
                  <Grid item xs={12} style={{ flexBasis: 'auto' }}>
                    {memoizedUsedTokens.map((token) => (
                      <StyledChip
                        icon={<TokenIcon size="24px" token={tokenList[token]} isInChip />}
                        label={tokenList[token].symbol}
                        onClick={() => handleItemSelected(token)}
                        key={tokenList[token].address}
                      />
                    ))}
                  </Grid>
                  <StyledGrid item xs={12} customSpacing={12} style={{ flexBasis: 'auto' }}>
                    <Divider />
                  </StyledGrid>
                </>
              )}
              <StyledGrid item xs={12} customSpacing={10} style={{ flexBasis: 'auto' }}>
                <StyledDialogTitle>
                  <Typography variant="body1" fontWeight={600} fontSize="1.2rem">
                    <FormattedMessage description="token list" defaultMessage="Token list" />
                  </Typography>
                  <IconButton aria-label="close" onClick={() => setShouldShowTokenLists(!shouldShowTokenLists)}>
                    <StyledTuneIcon />
                  </IconButton>
                </StyledDialogTitle>
              </StyledGrid>
              <StyledGrid item xs={12} style={{ flexGrow: 1 }}>
                <AutoSizer>
                  {({ height, width }) => (
                    <StyledList
                      height={height}
                      itemCount={memoizedTokenKeys.length}
                      itemSize={52}
                      width={width}
                      itemData={itemData}
                    >
                      {Row}
                    </StyledList>
                  )}
                </AutoSizer>
              </StyledGrid>
            </>
          )}
        </Grid>
      </StyledOverlay>
    </Slide>
  );
};

export default TokenPicker;
