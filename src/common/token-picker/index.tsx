import React, { CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import remove from 'lodash/remove';
import uniq from 'lodash/uniq';
import AutoSizer from 'react-virtualized-auto-sizer';
import Slide from '@material-ui/core/Slide';
import { Token, TokenList } from 'types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InputBase from '@material-ui/core/InputBase';
import Search from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Chip from '@material-ui/core/Chip';
import TokenIcon from 'common/token-icon';
import { makeStyles } from '@material-ui/core/styles';
import { PROTOCOL_TOKEN_ADDRESS, WRAPPED_PROTOCOL_TOKEN } from 'mocks/tokens';
import useAvailablePairs from 'hooks/useAvailablePairs';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import useTokenList from 'hooks/useTokenList';
import Button from 'common/button';
import TokenLists from 'common/token-lists';

type SetFromToState = React.Dispatch<React.SetStateAction<Token>>;
interface PartialTheme {
  spacing: (space: number) => number;
  palette: { grey: string[]; type: 'light' | 'dark' };
}

const searchStyles = ({ spacing, palette }: PartialTheme) => {
  // ATTENTION!
  // you can customize some important variables here!!
  const backgroundColor = palette.type === 'light' ? palette.grey[100] : 'rgba(255, 255, 255, 0.12)';
  const space = spacing(1); // default = 8;
  const borderRadius = 30;
  const iconColor = palette.type === 'light' ? palette.grey[500] : '#ffffff';
  // end of variables
  return {
    root: {
      backgroundColor,
      borderRadius,
      padding: `${space}px ${space * 2}px`,
    },
    input: {
      fontSize: 16,
    },
    adornedStart: {
      '& > *:first-child': {
        // * is the icon at the beginning of input
        fontSize: 20,
        color: iconColor,
        marginRight: space,
      },
    },
  };
};
const useSearchInputStyles = makeStyles(searchStyles);

const StyledOverlay = styled.div`
  ${({ theme }) => `
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 99;
    background-color: ${theme.palette.type === 'light' ? '#ffffff' : '#424242'};
    padding: 32px;
    display: flex;
  `}
`;

const StyledChip = styled(Chip)`
  margin-right: 5px;
`;

const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 0px;
  margin-right: 16px;
`;

const StyledListItem = styled(ListItem)`
  padding-left: 0px;
`;

const StyledButton = styled(Button)`
  padding: 18px 22px;
  border-radius: 12px;
`;

const StyledList = styled(List)`
  ${({ theme }) => `

    scrollbar-width: thin;
    scrollbar-color: var(--thumbBG) var(--scrollbarBG);
    --scrollbarBG: ${theme.palette.type === 'light' ? '#ffffff' : '#424242'};
    --thumbBG: ${theme.palette.type === 'light' ? '#90a4ae' : '#ffffff'};
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

const StyledGrid = styled(Grid)<{ customSpacing?: number }>`
  margin-top: ${(props) => props.customSpacing || 0}px;
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
    padding: '0.5rem 1rem',
    '&:hover': {
      color: palette.text.primary,
      backgroundColor: palette.type === 'light' ? palette.grey[100] : palette.grey[700],
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

  return (
    <StyledListItem classes={classes} button onClick={() => onClick(tokenKeys[index])} style={style}>
      <StyledListItemIcon>
        <TokenIcon size="32px" token={tokenList[tokenKeys[index]]} />
      </StyledListItemIcon>
      <ListItemText disableTypography>
        <span>
          <Typography variant="body1" component="span">
            {tokenList[tokenKeys[index]].name}
          </Typography>
          <Typography variant="subtitle1" component="span">
            {` - `}
          </Typography>
          <Typography variant="subtitle2" component="span">
            {tokenList[tokenKeys[index]].symbol}
          </Typography>
        </span>
      </ListItemText>
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
  const inputStyles = useSearchInputStyles();
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

    if (
      filteredTokenKeys.findIndex(
        (el) => el === WRAPPED_PROTOCOL_TOKEN[currentNetwork.chainId](currentNetwork.chainId).address
      ) !== -1
    ) {
      remove(
        filteredTokenKeys,
        (token) => token === WRAPPED_PROTOCOL_TOKEN[currentNetwork.chainId](currentNetwork.chainId).address
      );
      filteredTokenKeys.unshift(WRAPPED_PROTOCOL_TOKEN[currentNetwork.chainId](currentNetwork.chainId).address);
    }

    if (filteredTokenKeys.findIndex((el) => el === PROTOCOL_TOKEN_ADDRESS) !== -1) {
      remove(filteredTokenKeys, (token) => token === PROTOCOL_TOKEN_ADDRESS);
      filteredTokenKeys.unshift(PROTOCOL_TOKEN_ADDRESS);
    }

    return filteredTokenKeys;
  }, [tokenKeys, search, usedTokens, ignoreValues, tokenKeysToUse, availableFrom, currentNetwork.chainId]);

  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
        <IconButton
          aria-label="close"
          size="small"
          onClick={handleOnClose}
          style={{ position: 'absolute', top: '32px', right: '32px' }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
        <Grid container spacing={1} direction="column" style={{ flexWrap: 'nowrap', overflow: 'scroll' }}>
          {shouldShowTokenLists ? (
            <TokenLists />
          ) : (
            <>
              <Grid item xs={12} style={{ flexBasis: 'auto' }}>
                <Typography variant="h6">
                  {isFrom ? (
                    <FormattedMessage description="You pay" defaultMessage="You pay" />
                  ) : (
                    <FormattedMessage description="You get" defaultMessage="You get" />
                  )}
                </Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isOnlyPairs}
                        onChange={() => setIsOnlyPairs(!isOnlyPairs)}
                        name="isOnlyPairs"
                        color="primary"
                      />
                    }
                    label="Only tokens with created pairs"
                  />
                </FormGroup>
              </Grid>
              <StyledGrid item xs={12} customSpacing={12} style={{ flexBasis: 'auto' }}>
                <InputBase
                  classes={inputStyles}
                  placeholder="Search by ETH, Ethereum or Ether"
                  startAdornment={<Search />}
                  fullWidth
                  onChange={(evt) => setSearch(evt.currentTarget.value)}
                />
              </StyledGrid>
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
              <StyledGrid item xs={12} customSpacing={12} style={{ flexGrow: 1 }}>
                <AutoSizer>
                  {({ height, width }) => (
                    <StyledList
                      height={height}
                      itemCount={memoizedTokenKeys.length}
                      itemSize={52}
                      width={width}
                      itemData={{ onClick: handleItemSelected, tokenList, tokenKeys: memoizedTokenKeys }}
                    >
                      {Row}
                    </StyledList>
                  )}
                </AutoSizer>
              </StyledGrid>
            </>
          )}
          <StyledGrid item xs={12} customSpacing={12} style={{ flexBasis: 'auto' }}>
            <StyledButton
              size="large"
              variant="contained"
              color="default"
              fullWidth
              onClick={() => setShouldShowTokenLists(!shouldShowTokenLists)}
            >
              <Typography variant="body1">
                {!shouldShowTokenLists ? (
                  <FormattedMessage description="manage token list" defaultMessage="Manage Token Lists" />
                ) : (
                  <FormattedMessage description="doneManagingTokenLists" defaultMessage="Done" />
                )}
              </Typography>
            </StyledButton>
          </StyledGrid>
        </Grid>
      </StyledOverlay>
    </Slide>
  );
};

export default TokenPicker;
