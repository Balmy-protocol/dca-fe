import React, { CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import remove from 'lodash/remove';
import uniq from 'lodash/uniq';
import AutoSizer from 'react-virtualized-auto-sizer';
import Slide from '@mui/material/Slide';
import { Token, TokenList, YieldOptions } from 'types';
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
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import useTokenList from 'hooks/useTokenList';
import TokenLists from 'common/token-lists';
import useTokenBalance from 'hooks/useTokenBalance';
import { formatCurrencyAmount } from 'utils/currency';
import FilledInput from '@mui/material/FilledInput';
import { createStyles } from '@mui/material';
import useUsdPrice from 'hooks/useUsdPrice';
import useAllowedPairs from 'hooks/useAllowedPairs';
import Switch from '@mui/material/Switch';

type SetFromToState = React.Dispatch<React.SetStateAction<Token>>;

const StyledSwitchGrid = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.5) !important;
  flex: 0;
`;

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

const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 0px;
  margin-right: 7px;
`;

const StyledListItem = styled(ListItem)`
  padding-left: 0px;
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
  align-items: flex-end;
`;

const StyledTokenTextContainer = styled.div`
  display: flex;
  gap: 5px;
`;

interface RowData {
  tokenList: TokenList;
  tokenKeys: string[];
  onClick: (token: string) => void;
  yieldOptions: YieldOptions;
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
  otherSelected?: Token | null;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
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
const Row = ({ index, style, data: { onClick, tokenList, tokenKeys, yieldOptions } }: RowProps) => {
  const classes = useListItemStyles();
  const token = tokenList[tokenKeys[index]];

  const tokenBalance = useTokenBalance(token);
  const [tokenValue] = useUsdPrice(token, tokenBalance);

  const availableYieldOptions = yieldOptions.filter((yieldOption) =>
    yieldOption.enabledTokens.includes(token?.address)
  );

  return (
    <StyledListItem classes={classes} onClick={() => onClick(tokenKeys[index])} style={style}>
      <StyledListItemIcon>
        <TokenIcon size="24px" token={token} />
      </StyledListItemIcon>
      <ListItemText disableTypography>
        <StyledTokenTextContainer>
          <Typography variant="body1" component="span" color="#FFFFFF">
            {token.name}
          </Typography>
          <Typography variant="body1" component="span" color="rgba(255, 255, 255, 0.5)">
            {` (${token.symbol})`}
          </Typography>
        </StyledTokenTextContainer>
        {!!availableYieldOptions.length && (
          <StyledTokenTextContainer>
            <Typography variant="caption" component="span" color="#007E36">
              <FormattedMessage description="supportsYield" defaultMessage="Supports yield" />
            </Typography>
          </StyledTokenTextContainer>
        )}
      </ListItemText>
      <StyledBalanceContainer>
        {tokenBalance && (
          <Typography variant="body1" color="#FFFFFF">
            {formatCurrencyAmount(tokenBalance, token, 6)}
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
  otherSelected,
  yieldOptions,
  isLoadingYieldOptions,
}: TokenPickerProps) => {
  const tokenList = useTokenList();
  const [search, setSearch] = React.useState('');
  const [shouldShowTokenLists, setShouldShowTokenLists] = React.useState(false);
  const tokenKeys = React.useMemo(() => Object.keys(tokenList), [tokenList]);
  const currentNetwork = useCurrentNetwork();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [isOnlyAllowedPairs, setIsOnlyAllowedPairs] = React.useState(false);
  const allowedPairs = useAllowedPairs();
  let tokenKeysToUse: string[] = [];
  const otherToCheck = otherSelected?.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : otherSelected;

  const uniqTokensFromPairs = React.useMemo(
    () =>
      uniq(
        allowedPairs.reduce((accum, current) => {
          if (current.tokenA.address !== otherToCheck?.address && current.tokenB.address !== otherToCheck?.address) {
            return accum;
          }
          const tokensToAdd = [current.tokenA.address, current.tokenB.address];

          if (
            current.tokenA.address === wrappedProtocolToken.address ||
            current.tokenB.address === wrappedProtocolToken.address
          ) {
            tokensToAdd.push(PROTOCOL_TOKEN_ADDRESS);
          }

          return [...accum, ...tokensToAdd];
        }, [])
      ),
    [allowedPairs, otherToCheck]
  );

  tokenKeysToUse = isOnlyAllowedPairs && !!otherSelected ? uniqTokensFromPairs : tokenKeys;

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

  const memoizedUsedTokens = React.useMemo(
    () => usedTokens.filter((el) => !ignoreValues.includes(el) && tokenKeysToUse.includes(el)),
    [usedTokens, ignoreValues, tokenKeysToUse]
  );

  const otherIsProtocol =
    otherSelected?.address === PROTOCOL_TOKEN_ADDRESS || otherSelected?.address === wrappedProtocolToken.address;
  const memoizedTokenKeys = React.useMemo(() => {
    const filteredTokenKeys = tokenKeysToUse
      .filter(
        (el) =>
          tokenList[el] &&
          (tokenList[el].name.toLowerCase().includes(search.toLowerCase()) ||
            tokenList[el].symbol.toLowerCase().includes(search.toLowerCase()) ||
            tokenList[el].address.toLowerCase().includes(search.toLowerCase())) &&
          !usedTokens.includes(el) &&
          !ignoreValues.includes(el) &&
          tokenList[el].chainId === currentNetwork.chainId &&
          (!otherIsProtocol ||
            (otherIsProtocol && el !== wrappedProtocolToken.address && el !== PROTOCOL_TOKEN_ADDRESS))
      )
      .sort();

    if (filteredTokenKeys.findIndex((el) => el === getWrappedProtocolToken(currentNetwork.chainId).address) !== -1) {
      remove(filteredTokenKeys, (token) => token === getWrappedProtocolToken(currentNetwork.chainId).address);
      filteredTokenKeys.unshift(getWrappedProtocolToken(currentNetwork.chainId).address);
    }

    if (filteredTokenKeys.findIndex((el) => el === PROTOCOL_TOKEN_ADDRESS) !== -1) {
      remove(filteredTokenKeys, (token) => token === PROTOCOL_TOKEN_ADDRESS);
      filteredTokenKeys.unshift(PROTOCOL_TOKEN_ADDRESS);
    }

    return filteredTokenKeys;
  }, [
    tokenKeysToUse,
    search,
    usedTokens,
    ignoreValues,
    tokenKeys,
    availableFrom,
    otherIsProtocol,
    currentNetwork.chainId,
  ]);

  const itemData = React.useMemo(
    () => ({
      onClick: handleItemSelected,
      tokenList,
      tokenKeys: memoizedTokenKeys,
      yieldOptions: isLoadingYieldOptions ? [] : yieldOptions,
    }),
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
              {otherSelected && (
                <StyledSwitchGrid item xs={12}>
                  <FormattedMessage
                    description="createdPairsSwitchToken"
                    defaultMessage="Only tokens compatible with {token}"
                    values={{ token: otherSelected?.symbol }}
                  />
                  <Switch
                    checked={isOnlyAllowedPairs}
                    onChange={() => setIsOnlyAllowedPairs(!isOnlyAllowedPairs)}
                    name="isOnlyAllowedPairs"
                    color="primary"
                  />
                </StyledSwitchGrid>
              )}
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
                  {/* <IconButton aria-label="close" onClick={() => setShouldShowTokenLists(!shouldShowTokenLists)}>
                    <StyledTuneIcon />
                  </IconButton> */}
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
