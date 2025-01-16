import React from 'react';
import styled from 'styled-components';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import usePushToHistory from '@hooks/usePushToHistory';
import useAnalytics from '@hooks/useAnalytics';
import useTransactionsHistory from '@hooks/useTransactionsHistory';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import {
  SetStateCallback,
  StrategyId,
  TokenWithIcon,
  TransactionEvent,
  TransactionEventTypes,
  TransactionStatus,
  UserStatus,
} from 'common-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Button,
  BackgroundPaper,
  VirtualizedList,
  ItemContent,
  Typography,
  ForegroundPaper,
  TransactionReceipt,
  Skeleton,
  YawningFaceEmoji,
  StyledBodySmallLabelTypography,
  StyledBodySmallRegularTypo2,
  Hidden,
  colors,
  HiddenNumber,
  ContainerBox,
  CircularProgress,
  StyledBodySmallSemiboldTypo2,
} from 'ui-library';
import {
  filterEventsByUnitIndexed,
  getTransactionInvolvedWallets,
  getTransactionTitle,
  getTransactionTokenValuePrice,
  getTransactionValue,
} from '@common/utils/transaction-history';
import { DateTime } from 'luxon';
import parseTransactionEventToTransactionReceipt from '@common/utils/transaction-history/transaction-receipt-parser';
import isUndefined from 'lodash/isUndefined';
import { useShowBalances, useThemeMode } from '@state/config/hooks';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import useUser from '@hooks/useUser';
import useWallets from '@hooks/useWallets';
import useIsSomeWalletIndexed from '@hooks/useIsSomeWalletIndexed';
import { WalletOptionValues, ALL_WALLETS } from '@common/components/wallet-selector/types';
import { formatUsdAmount } from '@common/utils/currency';
import { findHubAddressVersion } from '@common/utils/parsing';
import { HISTORY_ROUTE } from '@constants/routes';
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';

const StyledNoActivity = styled.div`
  ${({ theme: { spacing } }) => `
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing(2)};
  `}
`;
const StyledOperation = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: end;
`;

const StyledPaper = styled(BackgroundPaper)`
  display: flex;
  flex-direction: column;
  flex: 1;
  ${({ theme: { space } }) => `
    gap: ${space.s05};
    padding: ${space.s04};
  `}
`;

const StyledForegroundPaper = styled(ForegroundPaper)`
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  ${({ theme: { spacing, palette } }) => `
    padding: ${spacing(3)};
    gap: ${spacing(2)};
    transition: box-shadow 0.3s ease-in-out;
    border-radius: ${spacing(2)};
    border: 1px solid ${colors[palette.mode].border.border1};
    &:hover {
      background-color: ${colors[palette.mode].background.tertiary};
      box-shadow: ${colors[palette.mode].dropShadow.dropShadow100};
    }
  `}
`;

// const StyledChip = styled(Chip)`
//   height: auto;
//   MuiChip-label': { whiteSpace: 'normal', textAlign: 'center' } }}
// `;

interface Context {
  intl: ReturnType<typeof useIntl>;
  setShowReceipt: SetStateCallback<TransactionEvent>;
  showBalances?: boolean;
}

const formatTokenElement = (txEvent: TransactionEvent): React.ReactElement => {
  const protocolToken = getProtocolToken(txEvent.tx.chainId);
  const wrappedToken = getWrappedProtocolToken(txEvent.tx.chainId);

  switch (txEvent.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return <TokenIconWithNetwork token={txEvent.data.token} tokenSize={8} withShadow />;
    case TransactionEventTypes.EARN_CREATED:
    case TransactionEventTypes.EARN_INCREASE:
      const depositToken = txEvent.data.depositToken;
      let depositTokenToDisplay = depositToken;
      if (depositToken.address === wrappedToken.address) {
        depositTokenToDisplay = protocolToken as TokenWithIcon;
      }
      return <TokenIconWithNetwork token={depositTokenToDisplay} tokenSize={8} withShadow />;
    case TransactionEventTypes.EARN_WITHDRAW:
      const tokens = txEvent.data.withdrawn
        .filter((withdrawn) => withdrawn.amount.amount > 0)
        .map((withdrawn) => withdrawn.token);
      let withdrawTokensToDisplay = tokens;
      if (tokens.some((token) => token.address === wrappedToken.address)) {
        withdrawTokensToDisplay = tokens.map((token) =>
          token.address === wrappedToken.address ? protocolToken : token
        ) as TokenWithIcon[];
      }
      return (
        <ComposedTokenIcon
          tokens={withdrawTokensToDisplay}
          withNetwork
          withShadow
          size={8}
          marginRight={4}
          overlapRatio={tokens.length > 2 ? 0.4 : undefined}
        />
      );
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
      const specialWithdrawTokens = txEvent.data.tokens.map((token) => token.token);
      return <ComposedTokenIcon tokens={specialWithdrawTokens} withNetwork withShadow size={8} marginRight={4} />;
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      return <TokenIconWithNetwork token={txEvent.data.token} tokenSize={8} withShadow />;
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.DCA_CREATED:
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_TRANSFER:
    case TransactionEventTypes.DCA_TERMINATED:
      return (
        <ComposedTokenIcon
          marginRight={4}
          withNetwork
          withShadow
          tokens={[txEvent.data.fromToken, txEvent.data.toToken]}
          size={8}
        />
      );
    case TransactionEventTypes.SWAP:
      return (
        <ComposedTokenIcon
          withNetwork
          marginRight={4}
          withShadow
          tokens={[txEvent.data.tokenIn, txEvent.data.tokenOut]}
          size={8}
        />
      );
  }
};

// eslint-disable-next-line @typescript-eslint/ban-types
const ActivityContent: ItemContent<TransactionEvent, Context> = (
  index: number,
  event,
  { intl, setShowReceipt, showBalances }
) => {
  const operation = intl.formatMessage(getTransactionTitle(event));
  const {
    tx: { txHash },
    data: { status },
  } = event;

  let formattedDate;
  if (status === TransactionStatus.DONE) {
    const {
      tx: { timestamp },
    } = event;
    const txDate = DateTime.fromSeconds(timestamp);
    formattedDate = txDate.startOf('day').equals(DateTime.now().startOf('day')) ? (
      <FormattedMessage defaultMessage="Today" description="today" />
    ) : txDate.startOf('day').equals(DateTime.now().minus({ days: 1 }).startOf('day')) ? (
      <FormattedMessage defaultMessage="Yesterday" description="yesterday" />
    ) : (
      <>{txDate.toLocaleString({ ...DateTime.DATETIME_MED, year: undefined })}</>
    );
  } else {
    formattedDate = <FormattedMessage defaultMessage="Just now" description="just-now" />;
  }

  const txTokenFlow: string | null = getTransactionValue(event, intl);
  const txValuePrice: number | undefined = getTransactionTokenValuePrice(event);

  return (
    <StyledForegroundPaper
      elevation={0}
      key={txHash}
      onClick={() => status === TransactionStatus.DONE && setShowReceipt(event)}
      sx={{ margin: (theme) => `0px ${theme.spacing(0.5)}` }}
    >
      {formatTokenElement(event)}
      <StyledOperation>
        <StyledBodySmallSemiboldTypo2 noWrap={false}>{operation}</StyledBodySmallSemiboldTypo2>
        <StyledBodySmallLabelTypography noWrap={false}>{formattedDate}</StyledBodySmallLabelTypography>
      </StyledOperation>
      <StyledValue>
        <StyledBodySmallRegularTypo2 noWrap={false}>
          {showBalances ? txTokenFlow : <HiddenNumber size="small" />}
        </StyledBodySmallRegularTypo2>
        {status === TransactionStatus.PENDING ? (
          <ContainerBox gap={1} alignItems="center">
            <CircularProgress size={12} color="warning" />
            <Typography variant="labelRegular">
              <FormattedMessage defaultMessage="Pending" description="home.activity.pending-status" />
            </Typography>
          </ContainerBox>
        ) : txValuePrice && showBalances ? (
          <StyledBodySmallLabelTypography noWrap={false}>
            ≈{` `}${formatUsdAmount({ amount: txValuePrice, intl })}
          </StyledBodySmallLabelTypography>
        ) : (
          <StyledBodySmallLabelTypography noWrap={false}>-</StyledBodySmallLabelTypography>
        )}
      </StyledValue>
    </StyledForegroundPaper>
  );
};

const ActivityBodySkeleton: ItemContent<TransactionEvent, Context> = (index: number) => {
  return (
    <StyledForegroundPaper elevation={0} key={index}>
      <Skeleton variant="circular" width={32} height={32} animation="wave" />
      <StyledOperation>
        <Typography variant="bodyRegular">
          <Skeleton variant="text" animation="wave" />
        </Typography>
        <Typography variant="bodySmallRegular">
          <Skeleton variant="text" animation="wave" />
        </Typography>
      </StyledOperation>
      <StyledValue>
        <Typography variant="bodyRegular">
          <Skeleton variant="text" animation="wave" />
        </Typography>
        <Typography variant="bodySmallRegular">
          <Skeleton variant="text" animation="wave" />
        </Typography>
      </StyledValue>
    </StyledForegroundPaper>
  );
};

const skeletonRows = Array.from(Array(10).keys()) as unknown as TransactionEvent[];

interface ActivityProps {
  selectedWalletOption: WalletOptionValues;
}

const Activity = ({ selectedWalletOption }: ActivityProps) => {
  const { trackEvent } = useAnalytics();
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const showBalances = useShowBalances();
  const { fetchMore, events, isLoading } = useTransactionsHistory();
  const intl = useIntl();
  const wallets = useWallets();
  const themeMode = useThemeMode();
  const user = useUser();
  const [showReceipt, setShowReceipt] = React.useState<TransactionEvent | undefined>();
  const walletAddresses = wallets.map((wallet) => wallet.address);
  const { unitsByChainPercentages } = useIsSomeWalletIndexed(
    selectedWalletOption !== ALL_WALLETS ? selectedWalletOption : undefined
  );
  const parsedReceipt = React.useMemo(() => parseTransactionEventToTransactionReceipt(showReceipt), [showReceipt]);

  const onSeeAllHistory = () => {
    dispatch(changeRoute(HISTORY_ROUTE.key));
    pushToHistory(`/${HISTORY_ROUTE.key}`);
    trackEvent('Home - Go to see all history');
  };

  const noActivityYet = React.useMemo(
    () => (
      <StyledNoActivity>
        <YawningFaceEmoji />
        <Typography variant="h5Bold">
          <FormattedMessage description="noActivityTitle" defaultMessage="No Activity Yet" />
        </Typography>
        <Typography variant="bodyRegular" textAlign="center">
          <FormattedMessage
            description="noActivityParagraph"
            defaultMessage="Once you start making transactions, you'll see all your activity here"
          />
        </Typography>
      </StyledNoActivity>
    ),
    [themeMode]
  );

  const isLoadingWithoutEvents = (isLoading && events.length === 0) || user?.status !== UserStatus.loggedIn;

  const filteredEvents = React.useMemo<typeof events>(() => {
    if (selectedWalletOption === ALL_WALLETS) {
      return filterEventsByUnitIndexed(events, unitsByChainPercentages);
    } else {
      return filterEventsByUnitIndexed(
        events.filter((event) => getTransactionInvolvedWallets(event).includes(selectedWalletOption)),
        unitsByChainPercentages
      );
    }
  }, [selectedWalletOption, events, unitsByChainPercentages]);

  const onOpenReceipt = (tx: TransactionEvent) => {
    setShowReceipt(tx);
    trackEvent('Home - View activity receipt', { type: tx.type });
  };

  const onGoToPosition = React.useCallback(
    ({ chainId, positionId, hub }: { chainId: number; hub: string; positionId: number }) => {
      const version = findHubAddressVersion(hub);
      pushToHistory(`/invest/positions/${chainId}/${version}/${positionId}`);
      trackEvent('Home - Tx Receipt - View position');
    },
    [pushToHistory, trackEvent]
  );

  const onGoToEarnPosition = React.useCallback(
    ({ chainId, strategyId }: { chainId: number; strategyId: StrategyId }) => {
      pushToHistory(`/earn/vaults/${chainId}/${strategyId}`);
      trackEvent('Home - Tx Receipt - View earn position');
    },
    [pushToHistory, trackEvent]
  );

  const context = React.useMemo(
    () => ({ intl, setShowReceipt: onOpenReceipt, showBalances }),
    [intl, walletAddresses, onOpenReceipt, showBalances]
  );

  return (
    <>
      <TransactionReceipt
        transaction={parsedReceipt}
        open={!isUndefined(showReceipt)}
        onClose={() => setShowReceipt(undefined)}
        onClickPositionId={onGoToPosition}
        onClickEarnPositionId={onGoToEarnPosition}
        showBalances={showBalances}
      />
      <StyledPaper variant="outlined">
        {!isLoading && (!wallets.length || !filteredEvents.length) ? (
          noActivityYet
        ) : (
          <VirtualizedList
            data={isLoadingWithoutEvents ? skeletonRows : filteredEvents}
            fetchMore={fetchMore}
            itemContent={isLoadingWithoutEvents ? ActivityBodySkeleton : ActivityContent}
            context={context}
          />
        )}
        <Hidden mdDown>
          <Button
            variant="text"
            onClick={onSeeAllHistory}
            fullWidth
            size="small"
            disabled={!isLoading && events.length === 0}
          >
            <Typography variant="linkRegular" textAlign="center">
              <FormattedMessage description="seeAll" defaultMessage="See all" />
            </Typography>
          </Button>
        </Hidden>
      </StyledPaper>
    </>
  );
};

export default Activity;
