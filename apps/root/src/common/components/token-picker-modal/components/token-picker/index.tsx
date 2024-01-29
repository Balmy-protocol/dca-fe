import React, { CSSProperties, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import remove from 'lodash/remove';
import uniq from 'lodash/uniq';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Token, TokenList, YieldOptions } from '@types';
import {
  Grid,
  Typography,
  Tooltip,
  FilledInput,
  IconButton,
  Switch,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  SearchIcon,
  CloseIcon,
  ContentCopyIcon,
  ContentPasteIcon,
  createStyles,
  colors,
  baseColors,
} from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';

import TokenIcon from '@common/components/token-icon';
import { makeStyles, withStyles } from 'tss-react/mui';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useTokenList from '@hooks/useTokenList';
import TokenLists from '@common/components/token-lists';
import { formatCurrencyAmount } from '@common/utils/currency';

import { formatUnits } from 'viem';
import useCustomToken from '@hooks/useCustomToken';
import useAllowedPairs from '@hooks/useAllowedPairs';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { useCustomTokens } from '@state/token-lists/hooks';
import { memoWithDeepComparison } from '@common/utils/react';
import { copyTextToClipboard } from '@common/utils/clipboard';
import { TokenBalances, useWalletBalances } from '@state/balances/hooks';
import { Address } from 'common-types';

type SetTokenState = React.Dispatch<React.SetStateAction<Token>>;

const StyledSwitchGrid = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 0;
`;

const StyledFilledInput = withStyles(FilledInput, () =>
  createStyles({
    root: {
      borderRadius: '8px',
    },
    input: {
      paddingTop: '8px',
    },
  })
);

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
    --scrollbarBG: ${colors[theme.palette.mode].aqua.aqua200};
    --thumbBG: ${colors[theme.palette.mode].aqua.aqua800};
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
  tokenBalances: TokenBalances;
  customToken: { token: Token; balance: bigint; balanceUsd: bigint } | undefined;
  isLoadingTokenBalances: boolean;
  isLoadingTokenPrices: boolean;
  customTokens: TokenList;
  customTokenError?: string;
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
  isOpen?: boolean;
  onChange: SetTokenState;
  onClose: () => void;
  onAddToken?: (token: Token) => void;
  modalTitle: React.ReactNode;
  account?: string;
  ignoreValues?: string[];
  otherSelected?: Token | null;
  yieldOptions?: YieldOptions;
  isLoadingYieldOptions: boolean;
  allowAllTokens?: boolean;
  allowCustomTokens?: boolean;
  showWrappedAndProtocol?: boolean;
}

const useListItemStyles = makeStyles()(() => ({
  root: {
    borderRadius: 6,
    cursor: 'pointer',
  },
  selected: {
    '&.Mui-selected': {
      fontWeight: 500,
    },
  },
}));

const LoadingRow = ({ style }: EmptyRowProps) => {
  const { classes } = useListItemStyles();

  return (
    <StyledListItem classes={classes} style={style}>
      <StyledListItemIcon>
        <Skeleton variant="circular" width={24} height={24} animation="wave" />
      </StyledListItemIcon>
      <ListItemText disableTypography>
        <StyledTokenTextContainer>
          <Typography variant="body" sx={{ width: '50%' }}>
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
    <Typography variant="body" sx={{ textAlign: 'center' }}>
      <FormattedMessage
        description="noTokenFound"
        defaultMessage="We could not find any token with those search parameters"
      />
    </Typography>
  </StyledTokenTextContainer>
);

const ErrorRow = () => (
  <StyledTokenTextContainer>
    <Typography variant="body" sx={{ textAlign: 'center' }}>
      <FormattedMessage
        description="customTokenError"
        defaultMessage="We could not find a token at the provided address. Please double-check and try again."
      />
    </Typography>
  </StyledTokenTextContainer>
);

const RawRow = ({
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
    isLoadingTokenPrices,
    customTokenError,
  },
}: RowProps) => {
  const { classes } = useListItemStyles();
  const isImportedToken = !!customTokens[tokenKeys[index]];
  const isCustomToken = (!!customToken && tokenKeys[index] === customToken.token.address) || isImportedToken;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const token = React.useMemo(
    () => (!isCustomToken || isImportedToken ? tokenList[tokenKeys[index]] : customToken!.token),
    [customToken, index, isCustomToken, isImportedToken, tokenKeys, tokenList]
  );

  const onCopyAddress = React.useCallback(
    (evt: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      evt.stopPropagation();
      if (token) {
        copyTextToClipboard(token.address);
      }
    },
    [token]
  );

  if (index === 0 && tokenKeys.length === 1 && tokenKeys[0] === 'loading') {
    return <LoadingRow style={style} />;
  }

  if (customTokenError && customTokenError !== 'Invalid address') {
    return <ErrorRow />;
  }

  if (index === 0 && !tokenKeys.length && !token) {
    return <EmptyRow />;
  }

  if (!token) {
    return null;
  }

  const tokenBalance =
    !isCustomToken || isImportedToken
      ? (tokenBalances && tokenBalances[token.address] && tokenBalances[token.address].balance) || 0n
      : customToken?.balance ?? 0n;
  const tokenValue =
    !isCustomToken || isImportedToken
      ? (tokenBalances &&
          tokenBalances[token.address] &&
          tokenBalances[token.address].balanceUsd &&
          parseFloat(formatUnits(tokenBalances[token.address].balanceUsd || 0n, token.decimals + 18))) ||
        0
      : (customToken?.balanceUsd && parseFloat(formatUnits(customToken?.balanceUsd, token.decimals + 18))) || 0;

  const availableYieldOptions = yieldOptions.filter((yieldOption) =>
    yieldOption.enabledTokens.includes(token?.address)
  );

  const tokenBalanceElement = React.useMemo(
    () =>
      isLoadingTokenBalances && !tokenBalances[token.address]?.balance ? (
        <CenteredLoadingIndicator size={10} />
      ) : (
        <Typography variant="body" color={baseColors.white}>
          {formatCurrencyAmount(tokenBalance, token, 6)}
        </Typography>
      ),
    [isLoadingTokenBalances, tokenBalances[token.address]]
  );

  const tokenBalanceUsdElement = React.useMemo(
    () =>
      isLoadingTokenPrices && !tokenBalances[token.address]?.balanceUsd ? (
        <CenteredLoadingIndicator size={8} />
      ) : (
        <Typography variant="bodySmall" color={baseColors.disabledText}>
          ${tokenValue.toFixed(2)}
        </Typography>
      ),
    [isLoadingTokenPrices, tokenBalances[token.address]]
  );

  return (
    <StyledListItem classes={classes} onClick={() => onClick(token, isCustomToken)} style={style}>
      <StyledListItemIcon>
        <TokenIcon size="24px" token={token} />
      </StyledListItemIcon>
      <ListItemText disableTypography>
        <StyledTokenTextContainer>
          <Typography variant="body" component="span">
            {token.name}
          </Typography>
          <Typography variant="body" component="span">
            {` (${token.symbol})`}
          </Typography>
          <Typography variant="body" component="span" sx={{ display: 'flex' }}>
            <Tooltip title={token.address} arrow placement="top">
              <StyledCopyIcon fontSize="inherit" onClick={onCopyAddress} />
            </Tooltip>
          </Typography>
        </StyledTokenTextContainer>
        {!!isCustomToken && (
          <StyledTokenTextContainer>
            <Typography variant="caption" component="span">
              <FormattedMessage
                description="customTokenWarning"
                defaultMessage="This is a custom token you are importing, trade at your own risk."
              />
            </Typography>
          </StyledTokenTextContainer>
        )}
        {!!availableYieldOptions.length && (
          <StyledTokenTextContainer>
            <Typography variant="caption" component="span">
              <FormattedMessage description="supportsYield" defaultMessage="Supports yield" />
            </Typography>
          </StyledTokenTextContainer>
        )}
      </ListItemText>
      <StyledBalanceContainer>
        {tokenBalanceElement}
        {tokenBalance !== 0n && tokenBalanceUsdElement}
      </StyledBalanceContainer>
    </StyledListItem>
  );
};

const Row = memoWithDeepComparison(RawRow);

const SizeList = memoWithDeepComparison(
  ({
    height,
    itemCount,
    itemSize,
    width,
    itemData,
  }: {
    height: number;
    itemCount: number;
    width: number;
    itemSize: number;
    itemData: RowData;
  }) => (
    <StyledList height={height} itemCount={itemCount} itemSize={itemSize} width={width} itemData={itemData}>
      {Row}
    </StyledList>
  )
);

const TokenPicker = ({
  modalTitle,
  onClose,
  onChange,
  ignoreValues = [],
  isOpen,
  otherSelected,
  yieldOptions = [],
  isLoadingYieldOptions,
  allowAllTokens,
  allowCustomTokens,
  showWrappedAndProtocol,
  onAddToken,
  account,
}: TokenPickerProps) => {
  const tokenList = useTokenList({ allowAllTokens });
  const searchInputRef = React.useRef<HTMLElement>();
  const [search, setSearch] = React.useState('');
  const [shouldShowTokenLists, setShouldShowTokenLists] = React.useState(false);
  const tokenKeys = React.useMemo(() => Object.keys(tokenList), [tokenList]);
  const currentNetwork = useSelectedNetwork();
  const intl = useIntl();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [isOnlyAllowedPairs, setIsOnlyAllowedPairs] = React.useState(false);
  const allowedPairs = useAllowedPairs();
  let tokenKeysToUse: string[] = useMemo(() => [], []);
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
    [allowedPairs, otherToCheck?.address, wrappedProtocolToken.address]
  );

  tokenKeysToUse = React.useMemo(
    () => (isOnlyAllowedPairs && !!otherSelected ? uniqTokensFromPairs : tokenKeys),
    [isOnlyAllowedPairs, otherSelected, uniqTokensFromPairs, tokenKeys]
  );

  const handleOnClose = React.useCallback(() => {
    if (shouldShowTokenLists) {
      setShouldShowTokenLists(false);
    } else {
      setSearch('');
      onClose();
    }
  }, [onClose, shouldShowTokenLists]);

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
    tokenList,
    search,
    ignoreValues,
    currentNetwork.chainId,
    otherSelected?.address,
    otherIsProtocol,
    wrappedProtocolToken.address,
  ]);

  const { balances, isLoadingBalances, isLoadingPrices } = useWalletBalances(
    account as Address,
    currentNetwork.chainId
  );

  const [customToken, isLoadingCustomToken, customTokenError] = useCustomToken(
    search,
    !allowCustomTokens || memoizedUnorderedTokenKeys.includes(search.toLowerCase())
  );

  const memoizedTokenKeys = React.useMemo(
    () => [
      ...(customToken ? [customToken.token.address] : []),
      ...memoizedUnorderedTokenKeys.sort((tokenKeyA, tokenKeyB) => {
        if (!Object.keys(balances).length) return tokenKeyA < tokenKeyB ? -1 : 1;

        const ABalanceToUse =
          (balances[tokenKeyA] && (balances[tokenKeyA].balanceUsd || balances[tokenKeyA].balance)) || 0n;
        const BBalanceToUse =
          (balances[tokenKeyB] && (balances[tokenKeyB].balanceUsd || balances[tokenKeyB].balance)) || 0n;

        const tokenABalance =
          (balances[tokenKeyA] &&
            parseFloat(
              formatUnits(ABalanceToUse, tokenList[tokenKeyA].decimals + (balances[tokenKeyA].balanceUsd ? 18 : 0))
            )) ||
          0;
        const tokenBBalance =
          (balances[tokenKeyB] &&
            parseFloat(
              formatUnits(BBalanceToUse, tokenList[tokenKeyB].decimals + (balances[tokenKeyB].balanceUsd ? 18 : 0))
            )) ||
          0;

        if (tokenABalance || tokenBBalance) {
          return tokenABalance > tokenBBalance ? -1 : 1;
        }

        const key = search.toLowerCase();
        const isGoodMatchA = tokenList[tokenKeyA].symbol.toLowerCase().startsWith(key);
        const isGoodMatchB = tokenList[tokenKeyB].symbol.toLowerCase().startsWith(key);

        if (isGoodMatchA !== isGoodMatchB) {
          // XOR
          return isGoodMatchA ? -1 : 1;
        }

        return tokenList[tokenKeyA].symbol.localeCompare(tokenList[tokenKeyB].symbol);
      }),
    ],
    [balances, memoizedUnorderedTokenKeys, tokenList, customToken, search]
  );

  const handleItemSelected = React.useCallback(
    (token: Token, isCustomToken: boolean) => {
      onChange(token);
      if (onAddToken && isCustomToken) {
        onAddToken(token);
      }
      setSearch('');
      handleOnClose();
    },
    [handleOnClose, onAddToken, onChange]
  );

  const onPasteAddress = async () => {
    const value = await navigator.clipboard.readText();

    setSearch(value);
  };

  const itemData: RowData = React.useMemo(
    () => ({
      onClick: handleItemSelected,
      tokenList,
      tokenKeys: !memoizedTokenKeys.length && isLoadingCustomToken ? ['loading'] : memoizedTokenKeys,
      yieldOptions: isLoadingYieldOptions ? [] : yieldOptions,
      tokenBalances: isLoadingBalances && (!balances || !Object.keys(balances).length) ? {} : balances || {},
      customToken: allowCustomTokens ? customToken : undefined,
      isLoadingTokenBalances: isLoadingBalances,
      isLoadingTokenPrices: isLoadingPrices,
      customTokens: allowCustomTokens ? customTokens : {},
      customTokenError,
    }),
    [
      memoizedTokenKeys,
      tokenList,
      balances,
      yieldOptions,
      customToken,
      isLoadingBalances,
      currentNetwork.chainId,
      isLoadingCustomToken,
      customTokenError,
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
          <TokenLists allowAllTokens />
        ) : (
          <>
            <Grid item xs={12} style={{ flexBasis: 'auto' }}>
              <Typography variant="body1" fontWeight={600} fontSize="1.2rem">
                {modalTitle}
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
                    <SearchIcon />
                  </StyledEndAdormentContainer>
                }
                type="text"
                margin="none"
              />
            </StyledGrid>
            {otherSelected && !allowAllTokens && (
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
                <Typography variant="body" fontWeight={600} fontSize="1.2rem">
                  <FormattedMessage description="token list" defaultMessage="Token list" />
                </Typography>
                {/* <IconButton aria-label="close" onClick={() => setShouldShowTokenLists(!shouldShowTokenLists)}>
                  <StyledTuneIcon />
                </IconButton> */}
              </StyledDialogTitle>
            </StyledGrid>
            <StyledGrid item xs={12} style={{ flexGrow: 1 }}>
              <AutoSizer>
                {/* eslint-disable-next-line react/no-unused-prop-types */}
                {({ height, width }: { width: number; height: number }) => (
                  <SizeList
                    height={height}
                    width={width}
                    itemCount={itemData.tokenKeys.length || 1}
                    itemSize={52}
                    itemData={itemData}
                  />
                )}
              </AutoSizer>
            </StyledGrid>
          </>
        )}
      </Grid>
    </>
  );
};

export default memoWithDeepComparison(TokenPicker);