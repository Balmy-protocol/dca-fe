import React from 'react';
import styled from 'styled-components';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';
import useTransactionsHistory from '@hooks/useTransactionsHistory';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { SetStateCallback, TransactionEvent, TransactionEventTypes, TransactionStatus, UserStatus } from 'common-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  KeyboardArrowRightIcon,
  Button,
  BackgroundPaper,
  VirtualizedList,
  ItemContent,
  Typography,
  ForegroundPaper,
  TransactionReceipt,
  Skeleton,
  Chip,
  YawningFaceEmoji,
  HourglassNotDoneEmoji,
  StyledBodySmallLabelTypography,
  StyledBodySmallRegularTypo2,
  Hidden,
} from 'ui-library';
import {
  getTransactionInvolvedWallets,
  getTransactionTitle,
  getTransactionTokenValuePrice,
  getTransactionValue,
} from '@common/utils/transaction-history';
import { DateTime } from 'luxon';
import parseTransactionEventToTransactionReceipt from '@common/utils/transaction-history/transaction-receipt-parser';
import isUndefined from 'lodash/isUndefined';
import { useThemeMode } from '@state/config/hooks';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import useUser from '@hooks/useUser';
import useWallets from '@hooks/useWallets';
import useIsSomeWalletIndexed from '@hooks/useIsSomeWalletIndexed';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import { formatUsdAmount } from '@common/utils/currency';

const StyledNoActivity = styled.div`
  ${({ theme: { spacing } }) => `
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing(2)}
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
  ${({ theme: { spacing } }) => `
    gap: ${spacing(3)};
    padding: ${spacing(4)};
  `}
`;

const StyledForegroundPaper = styled(ForegroundPaper)`
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  ${({ theme: { spacing } }) => `
    padding: ${spacing(3)};
    gap: ${spacing(2)};
  `}
`;

interface Context {
  intl: ReturnType<typeof useIntl>;
  wallets: string[];
  setShowReceipt: SetStateCallback<TransactionEvent>;
}

const formatTokenElement = (txEvent: TransactionEvent): React.ReactElement => {
  switch (txEvent.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return <TokenIconWithNetwork token={txEvent.data.token} />;
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.DCA_CREATED:
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_TRANSFER:
    case TransactionEventTypes.DCA_TERMINATED:
      return <ComposedTokenIcon withNetwork tokenBottom={txEvent.data.fromToken} tokenTop={txEvent.data.toToken} />;
    case TransactionEventTypes.SWAP:
      return <ComposedTokenIcon withNetwork tokenBottom={txEvent.data.tokenIn} tokenTop={txEvent.data.tokenOut} />;
  }
};

// eslint-disable-next-line @typescript-eslint/ban-types
const ActivityContent: ItemContent<TransactionEvent, Context> = (
  index: number,
  event,
  { intl, wallets, setShowReceipt }
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

  const txTokenFlow: string | null = getTransactionValue(event, wallets, intl);
  const txValuePrice: number | undefined = getTransactionTokenValuePrice(event);

  return (
    <StyledForegroundPaper
      elevation={0}
      key={txHash}
      onClick={() => status === TransactionStatus.DONE && setShowReceipt(event)}
    >
      {formatTokenElement(event)}
      <StyledOperation>
        <StyledBodySmallRegularTypo2 noWrap={false}>{operation}</StyledBodySmallRegularTypo2>
        <StyledBodySmallLabelTypography noWrap={false}>{formattedDate}</StyledBodySmallLabelTypography>
      </StyledOperation>
      <StyledValue>
        <StyledBodySmallRegularTypo2 noWrap={false}>{txTokenFlow}</StyledBodySmallRegularTypo2>
        {status === TransactionStatus.PENDING ? (
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={<FormattedMessage defaultMessage="Waiting on confirmation" description="waiting-on-confirmation" />}
          />
        ) : txValuePrice ? (
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
  const trackEvent = useTrackEvent();
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const { fetchMore, events, isLoading } = useTransactionsHistory();
  const intl = useIntl();
  const wallets = useWallets();
  const themeMode = useThemeMode();
  const user = useUser();
  const [showReceipt, setShowReceipt] = React.useState<TransactionEvent | undefined>();
  const walletAddresses = wallets.map((wallet) => wallet.address);
  const { isSomeWalletIndexed, hasLoadedEvents } = useIsSomeWalletIndexed(
    selectedWalletOption !== ALL_WALLETS ? selectedWalletOption : undefined
  );
  const parsedReceipt = React.useMemo(() => parseTransactionEventToTransactionReceipt(showReceipt), [showReceipt]);

  const onSeeAllHistory = () => {
    dispatch(changeRoute('history'));
    pushToHistory('/history');
    trackEvent('Home - Go to see all history');
  };

  const noActivityYet = React.useMemo(
    () => (
      <StyledNoActivity>
        <YawningFaceEmoji />
        <Typography variant="h5" fontWeight="bold">
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

  const indexingHistory = React.useMemo(
    () => (
      <StyledNoActivity>
        <HourglassNotDoneEmoji />
        <Typography variant="h5" fontWeight="bold">
          <FormattedMessage description="indexingTitle" defaultMessage="Gathering Your History" />
        </Typography>
        <Typography variant="bodyRegular" textAlign="center">
          <FormattedMessage
            description="indexingParagraph"
            defaultMessage="Indexing your past transactions. This will take just a moment. Your crypto history is on its way!"
          />
        </Typography>
      </StyledNoActivity>
    ),
    [themeMode]
  );

  const filteredEvents = React.useMemo<typeof events>(() => {
    if (selectedWalletOption === ALL_WALLETS) {
      return events;
    } else {
      return events.filter((event) => getTransactionInvolvedWallets(event).includes(selectedWalletOption));
    }
  }, [selectedWalletOption, events]);

  const onOpenReceipt = (tx: TransactionEvent) => {
    setShowReceipt(tx);
    trackEvent('Home - View activity receipt', { type: tx.type });
  };

  return (
    <>
      <TransactionReceipt
        transaction={parsedReceipt}
        open={!isUndefined(showReceipt)}
        onClose={() => setShowReceipt(undefined)}
      />
      <StyledPaper variant="outlined">
        {!isLoading && !isSomeWalletIndexed && !!wallets.length && hasLoadedEvents ? (
          indexingHistory
        ) : !isLoading && (!wallets.length || !filteredEvents.length) ? (
          noActivityYet
        ) : (
          <VirtualizedList
            data={isLoadingWithoutEvents ? skeletonRows : filteredEvents}
            fetchMore={fetchMore}
            itemContent={isLoadingWithoutEvents ? ActivityBodySkeleton : ActivityContent}
            context={{ intl, wallets: walletAddresses, setShowReceipt: onOpenReceipt }}
          />
        )}
        <Hidden mdDown>
          <Button
            variant="text"
            onClick={onSeeAllHistory}
            fullWidth
            disabled={(!isLoading && events.length === 0) || !isSomeWalletIndexed}
          >
            <FormattedMessage description="seeAll" defaultMessage="See all" />
            <KeyboardArrowRightIcon fontSize="inherit" />
          </Button>
        </Hidden>
      </StyledPaper>
    </>
  );
};

export default Activity;
