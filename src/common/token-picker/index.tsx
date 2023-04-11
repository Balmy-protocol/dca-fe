import React, { CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import remove from 'lodash/remove';
import uniq from 'lodash/uniq';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Token, TokenList, YieldOptions } from 'types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import ListItem from '@mui/material/ListItem';
// import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Search from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// import Chip from '@mui/material/Chip';
import TokenIcon from 'common/token-icon';
import { makeStyles, withStyles } from '@mui/styles';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from 'mocks/tokens';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import useSelectedNetwork from 'hooks/useSelectedNetwork';
import useTokenList from 'hooks/useTokenList';
import TokenLists from 'common/token-lists';
import { formatCurrencyAmount } from 'utils/currency';
import FilledInput from '@mui/material/FilledInput';
import { createStyles, Skeleton, Tooltip } from '@mui/material';
import useMulticallBalances from 'hooks/useMulticallBalances';
import { BigNumber } from 'ethers';
import { formatUnits } from '@ethersproject/units';
import Switch from '@mui/material/Switch';
import useCustomToken from 'hooks/useCustomToken';
import useAllowedPairs from 'hooks/useAllowedPairs';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { useCustomTokens } from 'state/token-lists/hooks';
import use1InchBalances from 'hooks/use1InchBalances';
import useCurrentNetwork from 'hooks/useCurrentNetwork';

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
  tokenKeys: string[];
  onClick: (token: Token, isCustomToken: boolean) => void;
  yieldOptions: YieldOptions;
  tokenBalances: Record<string, { balance: BigNumber; balanceUsd: BigNumber }>;
  customToken: { token: Token; balance: BigNumber; balanceUsd: BigNumber } | undefined;
  isLoadingTokenBalances: boolean;
  customTokens: TokenList;
  balancesChainId?: number;
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
  usedTokens: string[];
  ignoreValues: string[];
  otherSelected?: Token | null;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  isAggregator?: boolean;
  showWrappedAndProtocol?: boolean;
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
  data: {
    onClick,
    tokenList,
    tokenKeys,
    yieldOptions,
    tokenBalances,
    customToken,
    customTokens,
    isLoadingTokenBalances,
    balancesChainId,
  },
}: RowProps) => {
  const classes = useListItemStyles();
  const isImportedToken = !!customTokens[tokenKeys[index]];
  const isCustomToken = (!!customToken && tokenKeys[index] === customToken.token.address) || isImportedToken;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const token = !isCustomToken || isImportedToken ? tokenList[tokenKeys[index]] : customToken!.token;

  if (index === 0 && tokenKeys.length === 1 && tokenKeys[0] === 'loading') {
    return <LoadingRow style={style} />;
  }

  if (index === 0 && !tokenKeys.length && !token) {
    return <EmptyRow />;
  }

  if (!token) {
    return null;
  }

  const tokenBalance =
    !isCustomToken || isImportedToken
      ? (tokenBalances && tokenBalances[token.address] && tokenBalances[token.address].balance) || BigNumber.from(0)
      : customToken?.balance ?? BigNumber.from(0);
  const tokenValue =
    !isCustomToken || isImportedToken
      ? (tokenBalances &&
          tokenBalances[token.address] &&
          tokenBalances[token.address].balanceUsd &&
          parseFloat(formatUnits(tokenBalances[token.address].balanceUsd, token.decimals + 18))) ||
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
        {(!Object.keys(tokenBalances).length || balancesChainId !== token.chainId) && isLoadingTokenBalances && (
          <CenteredLoadingIndicator size={10} />
        )}
        {tokenBalances && !!Object.keys(tokenBalances).length && balancesChainId === token.chainId && (
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  usedTokens,
  otherSelected,
  yieldOptions,
  isLoadingYieldOptions,
  isAggregator,
  showWrappedAndProtocol,
  onAddToken,
}: TokenPickerProps) => {
  const tokenList = useTokenList(isAggregator);
  const searchInputRef = React.useRef<HTMLElement>();
  const [search, setSearch] = React.useState('');
  const [shouldShowTokenLists, setShouldShowTokenLists] = React.useState(false);
  const tokenKeys = React.useMemo(() => Object.keys(tokenList), [tokenList]);
  const currentNetwork = useSelectedNetwork();
  const actualCurrentNetwork = useCurrentNetwork();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [isOnlyAllowedPairs, setIsOnlyAllowedPairs] = React.useState(false);
  const allowedPairs = useAllowedPairs();
  let tokenKeysToUse: string[] = [];
  const customTokens = useCustomTokens();
  const [inchBalances, isLoadingInchBalances] = use1InchBalances();
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

  tokenKeysToUse = React.useMemo(
    () => (isOnlyAllowedPairs && !!otherSelected ? uniqTokensFromPairs : tokenKeys),
    [isOnlyAllowedPairs, otherSelected, uniqTokensFromPairs, tokenKeys]
  );

  const handleOnClose = () => {
    if (shouldShowTokenLists) {
      setShouldShowTokenLists(false);
    } else {
      setSearch('');
      onClose();
    }
  };

  // const memoizedUsedTokens = React.useMemo(
  //   () => usedTokens.filter((el) => !ignoreValues.includes(el) && tokenKeysToUse.includes(el)),
  //   [usedTokens, ignoreValues, tokenKeysToUse]
  // );

  const otherIsProtocol =
    !showWrappedAndProtocol &&
    (otherSelected?.address === PROTOCOL_TOKEN_ADDRESS || otherSelected?.address === wrappedProtocolToken.address);

  const memoizedUnorderedTokenKeys = React.useMemo(() => {
    const filteredTokenKeys = tokenKeysToUse
      .filter(
        (el) =>
          tokenList[el] &&
          (tokenList[el].name.toLowerCase().includes(search.toLowerCase()) ||
            tokenList[el].symbol.toLowerCase().includes(search.toLowerCase()) ||
            tokenList[el].address.toLowerCase().includes(search.toLowerCase())) &&
          // !usedTokens.includes(el) &&
          !ignoreValues.includes(el) &&
          tokenList[el].chainId === currentNetwork.chainId &&
          el !== otherSelected?.address &&
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
    // usedTokens,
    ignoreValues,
    tokenKeys,
    availableFrom,
    otherIsProtocol,
    currentNetwork.chainId,
    otherSelected,
  ]);

  const rawMemoTokenKeysToUse = React.useMemo(() => tokenKeysToUse.sort(), [tokenKeysToUse]);

  const [tokenBalances, isLoadingTokenBalances] = useMulticallBalances(rawMemoTokenKeysToUse);

  const [customToken, isLoadingCustomToken] = useCustomToken(
    search,
    !isAggregator || memoizedUnorderedTokenKeys.includes(search.toLowerCase())
  );

  const balances = React.useMemo(
    () => ({
      ...(inchBalances || {}),
      ...(tokenBalances?.balances || {}),
    }),
    [tokenBalances, inchBalances]
  );

  const memoizedTokenKeys = React.useMemo(
    () => [
      ...(customToken ? [customToken.token.address] : []),
      ...memoizedUnorderedTokenKeys.sort((tokenKeyA, tokenKeyB) => {
        if (!balances) return tokenKeyA < tokenKeyB ? -1 : 1;

        const tokenABalance =
          (balances[tokenKeyA] &&
            parseFloat(formatUnits(balances[tokenKeyA].balanceUsd, tokenList[tokenKeyA].decimals + 18))) ||
          0;
        const tokenBBalance =
          (balances[tokenKeyB] &&
            parseFloat(formatUnits(balances[tokenKeyB].balanceUsd, tokenList[tokenKeyB].decimals + 18))) ||
          0;

        return tokenABalance > tokenBBalance ? -1 : 1;
      }),
    ],
    [balances, memoizedUnorderedTokenKeys, tokenList, customToken]
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

  const isLoadingBalances = isLoadingInchBalances || isLoadingTokenBalances;

  const itemData: RowData = React.useMemo(
    () => ({
      onClick: handleItemSelected,
      tokenList,
      tokenKeys: !memoizedTokenKeys.length && isLoadingCustomToken ? ['loading'] : memoizedTokenKeys,
      yieldOptions: isLoadingYieldOptions ? [] : yieldOptions,
      tokenBalances:
        (isLoadingBalances && (!balances || !Object.keys(balances).length)) ||
        currentNetwork.chainId !== actualCurrentNetwork.chainId
          ? {}
          : balances || {},
      balancesChainId: tokenBalances?.chainId,
      customToken: isAggregator ? customToken : undefined,
      isLoadingTokenBalances: isLoadingBalances,
      customTokens: isAggregator ? customTokens : {},
    }),
    [
      memoizedTokenKeys,
      tokenList,
      balances,
      yieldOptions,
      customToken,
      isLoadingBalances,
      currentNetwork.chainId,
      actualCurrentNetwork.chainId,
      isLoadingCustomToken,
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
                {isFrom ? (
                  <FormattedMessage description="You sell" defaultMessage="You sell" />
                ) : (
                  <FormattedMessage description="You receive" defaultMessage="You receive" />
                )}
              </Typography>
            </Grid>
            <StyledGrid item xs={12} customSpacing={12} style={{ flexBasis: 'auto' }}>
              <StyledFilledInput
                placeholder="Search your token by symbol, name or address"
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
                    itemCount={itemData.tokenKeys.length || 1}
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
