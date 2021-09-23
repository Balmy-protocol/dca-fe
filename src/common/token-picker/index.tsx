import React, { CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import reverse from 'lodash/reverse';
import remove from 'lodash/remove';
import uniq from 'lodash/uniq';
import sortBy from 'lodash/sortBy';
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
import { useJupiterListItemStyles } from '@mui-treasury/styles/listItem/jupiter';
import InputBase from '@material-ui/core/InputBase';
import Search from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Chip from '@material-ui/core/Chip';
import TokenIcon from 'common/token-icon';
import { makeStyles } from '@material-ui/core/styles';
import { ContactSupportOutlined } from '@material-ui/icons';
import { ETH, WETH } from 'mocks/tokens';
import useAvailablePairs from 'hooks/useAvailablePairs';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { useTokenLists } from 'state/token-lists/hooks';
import useTokenList from 'hooks/useTokenList';

type SetFromToState = React.Dispatch<React.SetStateAction<Token>>;
interface PartialTheme {
  spacing: any;
  palette: any;
}
const searchStyles = ({ spacing, palette }: PartialTheme) => {
  // ATTENTION!
  // you can customize some important variables here!!
  const backgroundColor = palette.grey[100];
  const space = spacing(1); // default = 8;
  const borderRadius = 30;
  const iconColor = palette.grey[500];
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
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: white;
  padding: 32px;
  display: flex;
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

const StyledList = styled(List)`
  scrollbar-width: thin;
  scrollbar-color: var(--thumbBG) var(--scrollbarBG);
  --scrollbarBG: #ffffff;
  --thumbBG: #90a4ae;
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
  selected: Token;
  onChange: SetFromToState;
  onClose: () => void;
  isFrom: boolean;
  usedTokens: string[];
  ignoreValues: Token[];
}

const Row = ({ index, style, data: { onClick, tokenList, tokenKeys } }: RowProps) => {
  const classes = useJupiterListItemStyles();

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
  let tokenKeysToUse: string[] = [];
  const tokenKeys = React.useMemo(() => Object.keys(tokenList), [tokenList]);
  const inputStyles = useSearchInputStyles();
  const extendedIgnoredValues = isFrom ? ignoreValues : [...ignoreValues, ETH.address];
  const availablePairs = useAvailablePairs();
  const currentNetwork = useCurrentNetwork();

  const handleOnClose = () => {
    setSearch('');
    onClose();
  };

  const handleItemSelected = (item: string) => {
    onChange(tokenList[item]);
    handleOnClose();
  };

  const uniqTokensFromPairs = React.useMemo(
    () =>
      uniq(
        availablePairs.reduce(
          (accum, current) => [...accum, current.token0.address, current.token1.address],
          [...(isFrom ? [ETH.address] : [])]
        )
      ),
    [availablePairs]
  );

  tokenKeysToUse = !isOnlyPairs ? tokenKeys : uniqTokensFromPairs;

  const memoizedUsedTokens = React.useMemo(
    () => usedTokens.filter((el) => !extendedIgnoredValues.includes(el) && tokenKeysToUse.includes(el)),
    [usedTokens, extendedIgnoredValues, tokenKeysToUse]
  );

  const memoizedTokenKeys = React.useMemo(() => {
    // let orderedTokenKeys = sortBy(
    //   tokenKeysToUse.filter(
    //     (el) =>
    //       (tokenList[el].name.toLowerCase().includes(search.toLowerCase()) ||
    //         tokenList[el].symbol.toLowerCase().includes(search.toLowerCase()) ||
    //         tokenList[el].address.toLowerCase().includes(search.toLowerCase())) &&
    //       !usedTokens.includes(el) &&
    //       !extendedIgnoredValues.includes(el) &&
    //       tokenList[el].chainId === currentNetwork.chainId
    //   ),
    //   [(el) => tokenList[el].totalValueLockedUSD]
    // );

    let filteredTokenKeys = tokenKeysToUse.filter(
      (el) =>
        (tokenList[el].name.toLowerCase().includes(search.toLowerCase()) ||
          tokenList[el].symbol.toLowerCase().includes(search.toLowerCase()) ||
          tokenList[el].address.toLowerCase().includes(search.toLowerCase())) &&
        !usedTokens.includes(el) &&
        !extendedIgnoredValues.includes(el) &&
        tokenList[el].chainId === currentNetwork.chainId
    );

    // reverse(filteredTokenKeys);

    if (filteredTokenKeys.findIndex((el) => el === WETH(currentNetwork.chainId).address) !== -1) {
      remove(filteredTokenKeys, (token) => token === WETH(currentNetwork.chainId).address);
      filteredTokenKeys.unshift(WETH(currentNetwork.chainId).address);
    }

    if (filteredTokenKeys.findIndex((el) => el === ETH.address) !== -1) {
      remove(filteredTokenKeys, (token) => token === ETH.address);
      filteredTokenKeys.unshift(ETH.address);
    }

    return filteredTokenKeys;
  }, [tokenKeys, search, usedTokens, extendedIgnoredValues, tokenKeysToUse, availableFrom, currentNetwork.chainId]);

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
        <Grid container spacing={1} direction="column" style={{ flexWrap: 'nowrap' }}>
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
              placeholder={'Search by ETH, Ethereum or Ether'}
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
        </Grid>
      </StyledOverlay>
    </Slide>
  );
};

export default TokenPicker;
