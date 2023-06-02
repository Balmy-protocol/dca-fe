import React, { CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
// import remove from 'lodash/remove';
import uniq from 'lodash/uniq';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Token, TokenList, YieldOptions } from '@types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import ListItem from '@mui/material/ListItem';
// import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Search from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Button from '@common/components/button';
import MinimalComposedTokenIcon from '@common/components/minimal-composed-token-icon';

// import Chip from '@mui/material/Chip';
import { makeStyles, withStyles } from '@mui/styles';
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useTokenList from '@hooks/useTokenList';
import TokenLists from '@common/components/token-lists';
import { formatCurrencyAmount, toToken } from '@common/utils/currency';
import FilledInput from '@mui/material/FilledInput';
import { createStyles, Skeleton, Tooltip } from '@mui/material';
import { BigNumber } from 'ethers';
import { formatUnits } from '@ethersproject/units';
import Switch from '@mui/material/Switch';
import useCustomToken from '@hooks/useCustomToken';
import useAllowedPairs from '@hooks/useAllowedPairs';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { useCustomTokens } from '@state/token-lists/hooks';
import useMultichainBalances from '@hooks/useMultichainBalances';
import { SUPPORTED_NETWORKS_DCA, getGhTokenListLogoUrl } from '@constants';
import { useAppDispatch } from '@state/hooks';
import { changeMainTab, changeSubTab } from '@state/tabs/actions';
import usePushToHistory from '@hooks/usePushToHistory';

type SetFromToState = React.Dispatch<React.SetStateAction<Token>>;

const StyledSwitchGrid = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.5) !important;
  flex: 0;
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

// const StyledChip = styled(Chip)`
//   margin-right: 5px;
// `;

const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 0px;
  margin-right: 7px;
  cursor: pointer;
`;

const StyledPasteIcon = styled(ContentPasteIcon)`
  cursor: pointer;
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
  align-items: center;
`;

const StyledEndAdormentContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledCopyIcon = styled(ContentCopyIcon)`
  cursor: pointer;
`;

interface RowData {
  tokenList: TokenList;
  tokens: Token[];
  onClick: (token: Token, isCustomToken: boolean) => void;
  yieldOptions: YieldOptions;
  tokenBalances: Record<number, Record<string, { balance: BigNumber; balanceUsd?: BigNumber }>>;
  customToken: { token: Token; balance: BigNumber; balanceUsd: BigNumber } | undefined;
  isLoadingTokenBalances: boolean;
  customTokens: TokenList;
  balancesChainId?: number;
  multichain?: boolean;
}

interface RowProps {
  index: number;
  style: CSSProperties;
  data: RowData;
}

interface EmptyRowProps {
  style: CSSProperties;
}

interface TokenPickerProps {
  availableFrom?: string[];
  isOpen?: boolean;
  onChange: SetFromToState;
  onClose: () => void;
  onAddToken?: (token: Token) => void;
  isFrom: boolean;
  ignoreValues: string[];
  otherSelected?: Token | null;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  isAggregator?: boolean;
  showWrappedAndProtocol?: boolean;
  multichain?: boolean;
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

const LoadingRow = ({ style }: EmptyRowProps) => {
  const classes = useListItemStyles();

  return (
    <StyledListItem classes={classes} style={style}>
      <StyledListItemIcon>
        <Skeleton variant="circular" width={24} height={24} animation="wave" />
      </StyledListItemIcon>
      <ListItemText disableTypography>
        <StyledTokenTextContainer>
          <Typography variant="body1" sx={{ width: '50%' }}>
            <Skeleton variant="text" animation="wave" />
          </Typography>
        </StyledTokenTextContainer>
      </ListItemText>
      <StyledBalanceContainer>
        <Skeleton variant="text" width={12} />
      </StyledBalanceContainer>
    </StyledListItem>
  );
};

const AggregatorRow = ({ style }: EmptyRowProps) => {
  const classes = useListItemStyles();
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();

  const onClick = () => {
    dispatch(changeMainTab(1));
    dispatch(changeSubTab(0));
    pushToHistory(`/swap`);
  };
  return (
    <StyledListItem classes={classes} style={style}>
      <StyledListItemIcon />
      <ListItemText disableTypography>
        <StyledTokenTextContainer>
          <Typography variant="body1">Want to fund with another token that is not in your wallet?</Typography>
        </StyledTokenTextContainer>
      </ListItemText>
      <StyledBalanceContainer>
        <Button variant="contained" color="secondary" onClick={onClick}>
          Get token
        </Button>
      </StyledBalanceContainer>
    </StyledListItem>
  );
};

const EmptyRow = () => (
  <StyledTokenTextContainer>
    <Typography variant="body1" sx={{ textAlign: 'center' }}>
      <FormattedMessage
        description="noTokenFound"
        defaultMessage="We could not find any token with those search parameters"
      />
    </Typography>
  </StyledTokenTextContainer>
);

const Row = ({
  index,
  style,
  data: { onClick, tokens, yieldOptions, tokenBalances, customToken, customTokens, isLoadingTokenBalances, multichain },
}: RowProps) => {
  const classes = useListItemStyles();
  const isImportedToken = tokens[index] && !!customTokens[tokens[index].address];
  const isCustomToken =
    (!!customToken && tokens[index] && tokens[index].address === customToken.token.address) || isImportedToken;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const token = !isCustomToken || isImportedToken ? tokens[index] : customToken!.token;

  if (index === 0 && tokens.length === (multichain ? 2 : 1) && tokens[0].address === 'loading') {
    return <LoadingRow style={style} />;
  }

  if (index === tokens.length - 1 && multichain) {
    return <AggregatorRow style={style} />;
  }

  if (index === 0 && !tokens.length && !token) {
    return <EmptyRow />;
  }

  if (!token) {
    return null;
  }

  const tokenBalance =
    !isCustomToken || isImportedToken
      ? (tokenBalances &&
          tokenBalances[token.chainId] &&
          tokenBalances[token.chainId][token.address] &&
          tokenBalances[token.chainId][token.address].balance) ||
        BigNumber.from(0)
      : customToken?.balance ?? BigNumber.from(0);
  const tokenValue =
    !isCustomToken || isImportedToken
      ? (tokenBalances &&
          tokenBalances[token.chainId] &&
          tokenBalances[token.chainId][token.address] &&
          tokenBalances[token.chainId][token.address].balanceUsd &&
          parseFloat(
            formatUnits(
              tokenBalances[token.chainId][token.address].balanceUsd || BigNumber.from(0),
              token.decimals + 18
            )
          )) ||
        0
      : (customToken?.balanceUsd && parseFloat(formatUnits(customToken?.balanceUsd, token.decimals + 18))) || 0;

  const availableYieldOptions = yieldOptions.filter((yieldOption) =>
    yieldOption.enabledTokens.includes(token?.address)
  );

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  };

  const copyTextToClipboard = (text: string) => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigator.clipboard.writeText(text);
  };

  const onCopyAddress = (evt: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    evt.stopPropagation();
    if (token) {
      copyTextToClipboard(token.address);
    }
  };

  return (
    <StyledListItem classes={classes} onClick={() => onClick(token, isCustomToken)} style={style}>
      <StyledListItemIcon>
        <MinimalComposedTokenIcon
          size="24px"
          tokenBottom={token}
          tokenTop={
            multichain
              ? toToken({
                  chainId: token.chainId,
                  logoURI: getGhTokenListLogoUrl(token.chainId, 'logo'),
                })
              : undefined
          }
        />
      </StyledListItemIcon>
      <ListItemText disableTypography>
        <StyledTokenTextContainer>
          <Typography variant="body1" component="span" color="#FFFFFF">
            {token.name}
          </Typography>
          <Typography variant="body1" component="span" color="rgba(255, 255, 255, 0.5)">
            {` (${token.symbol})`}
          </Typography>
          <Typography variant="body1" component="span" color="rgba(255, 255, 255, 0.5)" sx={{ display: 'flex' }}>
            <Tooltip title={token.address} arrow placement="top">
              <StyledCopyIcon fontSize="inherit" onClick={onCopyAddress} />
            </Tooltip>
          </Typography>
        </StyledTokenTextContainer>
        {!!isCustomToken && (
          <StyledTokenTextContainer>
            <Typography variant="caption" component="span" color="rgb(245, 124, 0)">
              <FormattedMessage
                description="customTokenWarning"
                defaultMessage="This is a custom token you are importing, trade at your own risk."
              />
            </Typography>
          </StyledTokenTextContainer>
        )}
        {!!availableYieldOptions.length && (
          <StyledTokenTextContainer>
            <Typography variant="caption" component="span" color="#2CC941">
              <FormattedMessage description="supportsYield" defaultMessage="Supports yield" />
            </Typography>
          </StyledTokenTextContainer>
        )}
      </ListItemText>
      <StyledBalanceContainer>
        {!Object.keys(tokenBalances).length && isLoadingTokenBalances && <CenteredLoadingIndicator size={10} />}
        {tokenBalances && !!Object.keys(tokenBalances).length && (
          <>
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
          </>
        )}
      </StyledBalanceContainer>
    </StyledListItem>
  );
};

const TokenPicker = ({
  isFrom,
  availableFrom = [],
  onClose,
  onChange,
  ignoreValues,
  isOpen,
  otherSelected,
  yieldOptions,
  isLoadingYieldOptions,
  isAggregator,
  showWrappedAndProtocol,
  onAddToken,
  multichain,
}: TokenPickerProps) => {
  const tokenList = useTokenList(isAggregator, true, multichain);
  const searchInputRef = React.useRef<HTMLElement>();
  const [search, setSearch] = React.useState('');
  const [shouldShowTokenLists, setShouldShowTokenLists] = React.useState(false);
  const tokens = React.useMemo(
    () => [...Object.values(tokenList), ...SUPPORTED_NETWORKS_DCA.map((chainId) => getProtocolToken(chainId))],
    [tokenList]
  );
  const currentNetwork = useSelectedNetwork();
  const intl = useIntl();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [isOnlyAllowedPairs, setIsOnlyAllowedPairs] = React.useState(false);
  const allowedPairs = useAllowedPairs();
  let tokensToUse: Token[] = [];
  const customTokens = useCustomTokens();
  const otherToCheck = otherSelected?.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : otherSelected;

  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const uniqTokensFromPairs = React.useMemo(
    () =>
      uniq(
        allowedPairs.reduce((accum, current) => {
          if (current.tokenA.address !== otherToCheck?.address && current.tokenB.address !== otherToCheck?.address) {
            return accum;
          }
          const tokensToAdd = [current.tokenA, current.tokenB];

          if (
            current.tokenA.address === wrappedProtocolToken.address ||
            current.tokenB.address === wrappedProtocolToken.address
          ) {
            tokensToAdd.push(toToken({ address: PROTOCOL_TOKEN_ADDRESS }));
          }

          return [...accum, ...tokensToAdd];
        }, [])
      ),
    [allowedPairs, otherToCheck]
  );

  tokensToUse = React.useMemo(
    () => (isOnlyAllowedPairs && !!otherSelected ? uniqTokensFromPairs : tokens),
    [isOnlyAllowedPairs, otherSelected, uniqTokensFromPairs, tokens]
  );

  const handleOnClose = () => {
    if (shouldShowTokenLists) {
      setShouldShowTokenLists(false);
    } else {
      setSearch('');
      onClose();
    }
  };

  const otherIsProtocol =
    !showWrappedAndProtocol &&
    (otherSelected?.address === PROTOCOL_TOKEN_ADDRESS || otherSelected?.address === wrappedProtocolToken.address);

  const memoizedUnorderedTokens = React.useMemo(() => {
    const filteredTokens = tokensToUse
      .filter(
        (token) =>
          (token.name.toLowerCase().includes(search.toLowerCase()) ||
            token.symbol.toLowerCase().includes(search.toLowerCase()) ||
            token.address.toLowerCase().includes(search.toLowerCase())) &&
          !ignoreValues.includes(token.address) &&
          (multichain || token.chainId === currentNetwork.chainId) &&
          token.address !== otherSelected?.address &&
          (!otherIsProtocol ||
            (otherIsProtocol &&
              token.address !== wrappedProtocolToken.address &&
              token.address !== PROTOCOL_TOKEN_ADDRESS))
      )
      .sort();

    // if (filteredTokenKeys.findIndex((el) => el === getWrappedProtocolToken(currentNetwork.chainId).address) !== -1) {
    //   remove(filteredTokenKeys, (token) => token === getWrappedProtocolToken(currentNetwork.chainId).address);
    //   filteredTokenKeys.unshift(getWrappedProtocolToken(currentNetwork.chainId).address);
    // }

    // if (filteredTokenKeys.findIndex((el) => el === PROTOCOL_TOKEN_ADDRESS) !== -1) {
    //   remove(filteredTokenKeys, (token) => token === PROTOCOL_TOKEN_ADDRESS);
    //   filteredTokenKeys.unshift(PROTOCOL_TOKEN_ADDRESS);
    // }

    return filteredTokens;
  }, [tokensToUse, search, ignoreValues, availableFrom, otherIsProtocol, currentNetwork.chainId, otherSelected]);

  const rawMemoTokensToUse = React.useMemo(() => tokensToUse.sort(), [tokensToUse]);

  const [tokenBalances, isLoadingTokenBalances] = useMultichainBalances([
    ...rawMemoTokensToUse,
    ...SUPPORTED_NETWORKS_DCA.map((chainId) => toToken({ chainId, address: PROTOCOL_TOKEN_ADDRESS })),
  ]);

  const [customToken, isLoadingCustomToken] = useCustomToken(search, !isAggregator);

  const balances = React.useMemo(
    () => ({
      ...(tokenBalances?.balances || {}),
    }),
    [tokenBalances]
  );

  const memoizedTokens = React.useMemo(
    () => [
      ...(customToken ? [customToken.token] : []),
      ...memoizedUnorderedTokens
        .sort((tokenA, tokenB) => {
          if (!balances) return tokenA.address < tokenB.address ? -1 : 1;

          const ABalanceToUse =
            (balances[tokenA.chainId] &&
              balances[tokenA.chainId][tokenA.address] &&
              (balances[tokenA.chainId][tokenA.address].balanceUsd ||
                balances[tokenA.chainId][tokenA.address].balance)) ||
            BigNumber.from(0);
          const BBalanceToUse =
            (balances[tokenB.chainId] &&
              balances[tokenB.chainId][tokenB.address] &&
              (balances[tokenB.chainId][tokenB.address].balanceUsd ||
                balances[tokenB.chainId][tokenB.address].balance)) ||
            BigNumber.from(0);

          const tokenABalance =
            (balances[tokenA.chainId] &&
              balances[tokenA.chainId][tokenA.address] &&
              parseFloat(
                formatUnits(
                  ABalanceToUse,
                  tokenA.decimals + (balances[tokenA.chainId][tokenA.address].balanceUsd ? 18 : 0)
                )
              )) ||
            0;
          const tokenBBalance =
            (balances[tokenB.chainId] &&
              balances[tokenB.chainId][tokenB.address] &&
              parseFloat(
                formatUnits(
                  BBalanceToUse,
                  tokenB.decimals + (balances[tokenB.chainId][tokenB.address].balanceUsd ? 18 : 0)
                )
              )) ||
            0;

          if (tokenABalance || tokenBBalance) {
            return tokenABalance > tokenBBalance ? -1 : 1;
          }

          const key = search.toLowerCase();
          const isGoodMatchA = tokenA.symbol.toLowerCase().startsWith(key);
          const isGoodMatchB = tokenB.symbol.toLowerCase().startsWith(key);

          if (isGoodMatchA !== isGoodMatchB) {
            // XOR
            return isGoodMatchA ? -1 : 1;
          }

          return tokenA.symbol.localeCompare(tokenB.symbol);
        })
        .filter(
          (token) =>
            !multichain ||
            (balances &&
              balances[token.chainId] &&
              balances[token.chainId][token.address] &&
              balances[token.chainId][token.address].balance.gt(BigNumber.from(0)))
        ),
    ],
    [balances, memoizedUnorderedTokens, tokenList, customToken, search]
  );

  const handleItemSelected = (token: Token, isCustomToken: boolean) => {
    onChange(token);
    if (onAddToken && isCustomToken) {
      onAddToken(token);
    }
    setSearch('');
    handleOnClose();
  };

  const onPasteAddress = async () => {
    const value = await navigator.clipboard.readText();

    setSearch(value);
  };

  const isLoadingBalances = isLoadingTokenBalances;

  const itemData: RowData = React.useMemo(
    () => ({
      onClick: handleItemSelected,
      tokenList,
      tokens: !memoizedTokens.length && isLoadingCustomToken ? [toToken({ address: 'loading' })] : memoizedTokens,
      yieldOptions: isLoadingYieldOptions ? [] : yieldOptions,
      tokenBalances: isLoadingBalances && (!balances || !Object.keys(balances).length) ? {} : balances || {},
      balancesChainId: tokenBalances?.chainId,
      customToken: isAggregator ? customToken : undefined,
      isLoadingTokenBalances: isLoadingBalances,
      customTokens: isAggregator ? customTokens : {},
      multichain,
    }),
    [
      memoizedTokens,
      tokenList,
      balances,
      yieldOptions,
      customToken,
      isLoadingBalances,
      currentNetwork.chainId,
      isLoadingCustomToken,
      multichain,
    ]
  );

  return (
    <>
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
          <TokenLists isAggregator />
        ) : (
          <>
            <Grid item xs={12} style={{ flexBasis: 'auto' }}>
              <Typography variant="body1" fontWeight={600} fontSize="1.2rem">
                {/* eslint-disable-next-line no-nested-ternary */}
                {isFrom ? (
                  <FormattedMessage description="You sell" defaultMessage="You sell" />
                ) : multichain ? (
                  <FormattedMessage description="Fund with" defaultMessage="Fund with" />
                ) : (
                  <FormattedMessage description="You receive" defaultMessage="You receive" />
                )}
              </Typography>
            </Grid>
            <StyledGrid item xs={12} customSpacing={12} style={{ flexBasis: 'auto' }}>
              <StyledFilledInput
                placeholder={intl.formatMessage(
                  defineMessage({
                    defaultMessage: 'Search your token by symbol, name or address',
                    description: 'tokenPickerSearch',
                  })
                )}
                value={search}
                onChange={(evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                  setSearch(evt.currentTarget.value)
                }
                fullWidth
                inputRef={searchInputRef}
                disableUnderline
                endAdornment={
                  <StyledEndAdormentContainer>
                    <Tooltip
                      title={
                        <FormattedMessage
                          description="tokenPickerPasteAddress"
                          defaultMessage="Paste address from clipboard"
                        />
                      }
                      arrow
                      placement="top"
                    >
                      <StyledPasteIcon onClick={onPasteAddress} />
                    </Tooltip>
                    <Search />
                  </StyledEndAdormentContainer>
                }
                type="text"
                margin="none"
              />
            </StyledGrid>
            {otherSelected && !isAggregator && (
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
            <StyledGrid item xs={12} customSpacing={10} style={{ flexBasis: 'auto' }}>
              <StyledDialogTitle>
                <Typography variant="body1" fontWeight={600} fontSize="1.2rem">
                  {multichain ? (
                    <FormattedMessage description="token list" defaultMessage="Tokens in your wallet" />
                  ) : (
                    <FormattedMessage description="token list" defaultMessage="Token list" />
                  )}
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
                    itemCount={(itemData.tokens.length || 1) + (multichain ? 1 : 0)}
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
    </>
  );
};

export default TokenPicker;
