import React, { useCallback, useMemo, useState } from 'react';
import {
  Chip,
  ContainerBox,
  ForegroundPaper,
  Grid,
  IconButton,
  InputAdornment,
  ItemContent,
  Modal,
  Skeleton,
  Switch,
  TextField,
  Tooltip,
  Typography,
  VirtualizedList,
  Zoom,
} from '..';
import { Token, TokenWithIcon, AmountsOfToken, AvailablePairs } from 'common-types';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { baseColors, colors } from '../../theme';
import styled from 'styled-components';
import { CloseIcon, ContentCopyIcon, ContentPasteIcon, SearchIcon } from '../../icons';
import { Address } from 'viem';
import { copyTextToClipboard, useSnackbar, useTheme } from '../..';
import orderBy from 'lodash/orderBy';
import omit from 'lodash/omit';
import { formatCurrencyAmount, formatUsdAmount } from '../../common/utils/currency';

const StyledTokenTextContainer = styled(ContainerBox).attrs({ gap: 5, aligItems: 'center' })``;

export interface TokenWithBalance {
  token: TokenWithIcon;
  balance?: AmountsOfToken;
  allowsYield?: boolean;
  isCustomToken?: boolean;
}

interface TokenPickerProps {
  shouldShow: boolean;
  onChange: (token: TokenWithBalance) => void;
  onClose: () => void;
  modalTitle: React.ReactNode;
  tokens: TokenWithBalance[];
  isLoadingTokens: boolean;
  isLoadingBalances: boolean;
  isLoadingPrices: boolean;
  allowedPairs?: AvailablePairs;
  onFetchCustomToken?: (tokenAddress: Address) => void;
  isLoadingCustomToken?: boolean;
  filterByPair?: boolean;
  otherSelected?: Token | null;
  // TODO: Remove this once we pass constants to another package
  protocolToken: Token;
  wrappedProtocolToken: Token;
  emptySearchMessage?: ReturnType<typeof defineMessage>;
}

interface RowData {
  onClick: (token: TokenWithBalance) => void;
  isLoadingTokenBalances: boolean;
  isLoadingTokenPrices: boolean;
  themeMode: 'light' | 'dark';
  intl: ReturnType<typeof useIntl>;
  snackbar: ReturnType<typeof useSnackbar>;
}

const StyledForegroundPaper = styled(ForegroundPaper)`
  display: flex;
  justify-content: center;
  flex: 1;
  cursor: pointer;
  box-shadow: none;
  flex-direction: column;
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
  }) => `
    gap: ${spacing(1)};
    padding: ${spacing(3)};
    border-radius: ${spacing(2)};
    border: 1px solid ${colors[mode].border.border2};
    backgroundColor: ${colors[mode].background.secondary};
    :hover {
      background-color: ${colors[mode].background.emphasis};
    }
  `}
`;

const StyledCopyIcon = styled(ContentCopyIcon)`
  cursor: pointer;
  color: ${({ theme: { palette } }) => colors[palette.mode].typography.typo5};
`;

const validAddressRegex = RegExp(/^0x[A-Fa-f0-9]{40}$/);

const LoadingRow: ItemContent<TokenWithBalance, RowData> = (index) => (
  <StyledForegroundPaper elevation={0} key={index}>
    <Skeleton variant="circular" width={32} height={32} animation="wave" />
    <ContainerBox flexDirection="column" flex="1" alignItems="flex-start">
      <Typography variant="bodyRegular">
        <Skeleton variant="text" animation="wave" width="15ch" />
      </Typography>
      <Typography variant="bodySmallRegular">
        <Skeleton variant="text" animation="wave" width="5ch" />
      </Typography>
    </ContainerBox>
    <Typography variant="bodySmallRegular">
      <Skeleton variant="text" animation="wave" width="5ch" height="2ch" />
    </Typography>
  </StyledForegroundPaper>
);

const EmptyRow = ({
  intl,
  message,
}: {
  intl: ReturnType<typeof useIntl>;
  message?: ReturnType<typeof defineMessage>;
}) => (
  <StyledTokenTextContainer>
    <Typography variant="bodyRegular" sx={{ textAlign: 'center' }}>
      {message ? (
        intl.formatMessage(message)
      ) : (
        <FormattedMessage
          description="noTokenFound"
          defaultMessage="We could not find any token with those search parameters. Paste the token address to add it to your list. Once added, we'll always track your balance and its price."
        />
      )}
    </Typography>
  </StyledTokenTextContainer>
);

const ErrorRow = () => (
  <StyledTokenTextContainer>
    <Typography variant="bodyRegular" sx={{ textAlign: 'center' }}>
      <FormattedMessage
        description="customTokenError"
        defaultMessage="We could not find a token at the provided address. Please double-check and try again."
      />
    </Typography>
  </StyledTokenTextContainer>
);

const Row: ItemContent<TokenWithBalance, RowData> = (
  index: number,
  tokenWithBalance,
  { isLoadingTokenBalances, onClick, isLoadingTokenPrices, themeMode, intl, snackbar }
) => {
  const { token, balance, allowsYield, isCustomToken } = tokenWithBalance;
  const balanceUsd = balance?.amountInUSD;
  const balanceUnits = balance?.amountInUnits;

  const onCopyAddress = (evt: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    evt.stopPropagation();
    if (token) {
      copyTextToClipboard(token.address);
      snackbar.enqueueSnackbar(
        intl.formatMessage(
          defineMessage({ description: 'copiedSuccesfully', defaultMessage: 'Address copied to clipboard' })
        ),
        {
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          TransitionComponent: Zoom,
        }
      );
    }
  };

  return (
    <StyledForegroundPaper key={`${token.chainId}-${token.address}`} onClick={() => onClick(tokenWithBalance)}>
      <ContainerBox flex="1" alignItems="center" gap={3}>
        {token.icon}
        <ContainerBox flexDirection="column" flex="1" alignItems="flex-start" gap={0.5}>
          <Typography variant="bodyBold" color={colors[themeMode].typography.typo2} lineHeight={1}>
            {token.name}
          </Typography>
          {!isLoadingTokenBalances && !balanceUnits && (
            <Typography variant="bodySmallRegular" color={colors[themeMode].typography.typo3}>
              {token.symbol}
            </Typography>
          )}
          {(isLoadingTokenBalances || balanceUnits) && (
            <Typography variant="bodySmallRegular" color={colors[themeMode].typography.typo3}>
              {isLoadingTokenBalances && !balanceUnits ? (
                <Skeleton variant="text" animation="wave" width="5ch" />
              ) : (
                <>
                  {formatCurrencyAmount({ amount: balance?.amount, token, intl })}
                  {` `}
                  {token.symbol}
                </>
              )}
            </Typography>
          )}
        </ContainerBox>
        <ContainerBox gap={2} alignItems="center">
          {allowsYield && (
            <Typography variant="bodyExtraSmall" color="success.dark">
              {intl.formatMessage(
                defineMessage({
                  defaultMessage: 'Supports yield',
                  description: 'supportsYield',
                })
              )}
            </Typography>
          )}
          {(isLoadingTokenPrices || balanceUsd) && (
            <Typography variant="bodyBold" color={baseColors.disabledText}>
              {isLoadingTokenPrices && !balanceUsd ? (
                <Skeleton variant="text" animation="wave" width="5ch" height="2ch" />
              ) : (
                <Chip color="primary" size="medium" label={`$${formatUsdAmount({ amount: balanceUsd, intl })}`} />
              )}
            </Typography>
          )}
        </ContainerBox>
        <Typography variant="h5Bold" component="span" sx={{ display: 'flex' }}>
          <Tooltip title={token.address} arrow placement="top">
            <StyledCopyIcon fontSize="inherit" onClick={onCopyAddress} />
          </Tooltip>
        </Typography>
      </ContainerBox>
      {isCustomToken && (
        <Typography variant="bodyBold" color={baseColors.disabledText}>
          <Chip
            color="warning"
            size="medium"
            label={intl.formatMessage(
              defineMessage({
                description: 'customTokenWarning',
                defaultMessage: 'This is a custom token you are importing, trade at your own risk.',
              })
            )}
          />
        </Typography>
      )}
    </StyledForegroundPaper>
  );
};

interface TokenSearchProps {
  search: string;
  onChange: (newSearch: string) => void;
}

const TokenSearch = ({ search, onChange }: TokenSearchProps) => {
  const intl = useIntl();

  const onPasteAddress = async () => {
    const value = await navigator.clipboard.readText();

    onChange(value);
  };

  return (
    <TextField
      placeholder={intl.formatMessage(
        defineMessage({
          defaultMessage: 'Search your token by symbol, name or address',
          description: 'tokenPickerSearch',
        })
      )}
      fullWidth
      value={search}
      onChange={(evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => onChange(evt.currentTarget.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <Tooltip
            title={
              <FormattedMessage description="tokenPickerPasteAddress" defaultMessage="Paste address from clipboard" />
            }
            arrow
            placement="top"
          >
            <ContentPasteIcon onClick={() => void onPasteAddress()} />
          </Tooltip>
        ),
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Escape') {
          // Prevents autoselecting item while typing (default Select behaviour)
          e.stopPropagation();
        }
      }}
    />
  );
};

const skeletonRows = Array.from(Array(10).keys()) as unknown as TokenWithBalance[];

const removeIcon = (token: Token | TokenWithIcon): Token => {
  // This breaks one of immers pitfalls and we store that into a redux state it slows everything down
  const tokenWithoutReactComponents = omit(token, 'icon');

  const underlying = tokenWithoutReactComponents.underlyingTokens?.map((underlyingToken) =>
    removeIcon(underlyingToken)
  );

  tokenWithoutReactComponents.underlyingTokens = underlying;

  return tokenWithoutReactComponents;
};

const removeIconFromTokenWithBalance = (tokenWithBalance: TokenWithBalance): TokenWithBalance => {
  // This breaks one of immers pitfalls and we store that into a redux state it slows everything down
  const tokenWithoutReactComponents = omit(tokenWithBalance.token, 'icon');

  const underlying = tokenWithoutReactComponents.underlyingTokens?.map((underlyingToken) =>
    removeIcon(underlyingToken)
  );

  tokenWithoutReactComponents.underlyingTokens = underlying;

  return {
    ...tokenWithBalance,
    token: tokenWithoutReactComponents as TokenWithIcon,
  };
};

const TokenPicker = ({
  shouldShow,
  onChange,
  onClose,
  modalTitle,
  isLoadingCustomToken,
  tokens,
  onFetchCustomToken,
  allowedPairs,
  otherSelected,
  isLoadingTokens,
  filterByPair,
  isLoadingBalances,
  isLoadingPrices,
  protocolToken,
  wrappedProtocolToken,
  emptySearchMessage,
}: TokenPickerProps) => {
  const [search, setSearch] = useState('');
  const [isOnlyAllowedPairs, setIsOnlyAllowedPairs] = useState(false);
  const intl = useIntl();
  const {
    palette: { mode },
    spacing,
  } = useTheme();
  const snackbar = useSnackbar();

  const handleOnClose = useCallback(() => {
    setSearch('');
    onClose();
  }, [onClose]);

  const handleItemSelected = useCallback(
    (token: TokenWithBalance) => {
      onChange(removeIconFromTokenWithBalance(token));
      setSearch('');
      handleOnClose();
    },
    [handleOnClose, onChange]
  );

  const itemData: RowData = useMemo(
    () => ({
      onClick: handleItemSelected,
      isLoadingTokenBalances: isLoadingBalances,
      isLoadingTokenPrices: isLoadingPrices,
      themeMode: mode,
      intl,
      snackbar,
    }),
    [isLoadingBalances, isLoadingPrices, handleItemSelected, mode, snackbar]
  );

  const filteredTokens = useMemo(() => {
    const tokensMatchingSearch = orderBy(
      tokens.filter(({ token }) => {
        const tokenAddressForPair = (
          token.address === protocolToken.address ? wrappedProtocolToken.address : token.address
        ).toLowerCase();
        const otherTokenAddressForPair =
          otherSelected?.address === protocolToken.address
            ? wrappedProtocolToken.address
            : otherSelected?.address.toLowerCase();

        const foundInPair =
          allowedPairs &&
          tokenAddressForPair !== otherTokenAddressForPair &&
          !!allowedPairs.find(
            ({ token0, token1 }) =>
              (tokenAddressForPair === token0.toLowerCase() || tokenAddressForPair === token1.toLowerCase()) &&
              (otherTokenAddressForPair === token0.toLowerCase() || otherTokenAddressForPair === token1.toLowerCase())
          );

        return (
          (token.name.toLowerCase().includes(search.toLowerCase()) ||
            token.symbol.toLowerCase().includes(search.toLowerCase()) ||
            token.address.toLowerCase().includes(search.toLowerCase())) &&
          (!filterByPair || !isOnlyAllowedPairs || foundInPair) &&
          token.address !== otherSelected?.address
        );
      }),
      [
        ({ balance }) => parseFloat(balance?.amountInUSD || '0'),
        ({ balance }) => BigInt(balance?.amount || 0),
        'token.symbol',
      ],
      ['desc', 'desc', 'desc']
    );
    return tokensMatchingSearch;
  }, [tokens, search, allowedPairs, filterByPair, isOnlyAllowedPairs]);

  const onSearchChange = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);
      if (newSearch && validAddressRegex.test(newSearch) && onFetchCustomToken) {
        onFetchCustomToken(newSearch.toLowerCase() as Address);
      }
    },
    [onFetchCustomToken]
  );

  const isLoading = isLoadingBalances || isLoadingCustomToken || isLoadingPrices || isLoadingTokens;

  let itemContentToRender;
  let dataToRender;

  if (isLoadingTokens || (isLoadingCustomToken && filteredTokens.length === 0)) {
    itemContentToRender = LoadingRow;
  } else {
    itemContentToRender = Row;
  }

  if (isLoadingTokens) {
    dataToRender = skeletonRows;
  } else if (isLoadingCustomToken && filteredTokens.length === 0) {
    dataToRender = Array.from(Array(1).keys()) as unknown as TokenWithBalance[];
  } else {
    dataToRender = filteredTokens;
  }

  return (
    <Modal open={shouldShow} onClose={handleOnClose} closeOnBackdrop maxWidth="sm" keepMounted fullHeight>
      <ContainerBox alignSelf="stretch" flex={1}>
        <IconButton
          aria-label="close"
          size="small"
          onClick={handleOnClose}
          style={{ position: 'absolute', top: spacing(6), right: spacing(8) }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
        <Grid container rowSpacing={6} direction="column" style={{ flexWrap: 'nowrap' }}>
          <Grid item xs={12} style={{ flexBasis: 'auto', alignSelf: 'flex-start' }}>
            <Typography variant="h5Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
              {modalTitle}
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ flexBasis: 'auto' }}>
            <TokenSearch search={search} onChange={onSearchChange} />
          </Grid>
          {otherSelected && filterByPair && (
            <Grid
              item
              xs={12}
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                flex: '0 !important',
                alignSelf: 'flex-start',
              }}
            >
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
            </Grid>
          )}
          <Grid item xs={12} style={{ flexGrow: 1 }}>
            {!isLoading && search && filteredTokens.length === 0 && validAddressRegex.test(search) && <ErrorRow />}
            {!isLoading && search && filteredTokens.length === 0 && !validAddressRegex.test(search) && (
              <EmptyRow message={emptySearchMessage} intl={intl} />
            )}
            <VirtualizedList gap={1} context={itemData} data={dataToRender} itemContent={itemContentToRender} />
          </Grid>
        </Grid>
      </ContainerBox>
    </Modal>
  );
};

export { TokenPicker, TokenPickerProps };
