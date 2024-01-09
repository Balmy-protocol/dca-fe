import React from 'react';
import styled from 'styled-components';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';
import useTransactionsHistory from '@hooks/useTransactionsHistory';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { SetStateCallback, TransactionEvent, TransactionStatus } from 'common-types';
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
} from 'ui-library';
import {
  getTransactionPriceColor,
  getTransactionTitle,
  getTransactionTokenValuePrice,
  getTransactionValue,
} from '@common/utils/transaction-history';
import { DateTime } from 'luxon';
import parseTransactionEventToTransactionReceipt from '@common/utils/transaction-receipt-parser';
import isUndefined from 'lodash/isUndefined';
import useWalletsAddresses from '@hooks/useWalletsAddresses';
import { useThemeMode } from '@state/config/hooks';

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
`;

const StyledPaper = styled(BackgroundPaper)`
  display: flex;
  flex-direction: column;
  flex: 1;
  ${({ theme: { spacing } }) => `
    gap: ${spacing(2)};
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
    gap: ${spacing(3)};
  `}
`;

interface Context {
  intl: ReturnType<typeof useIntl>;
  wallets: string[];
  setShowReceipt: SetStateCallback<TransactionEvent>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
const ActivityContent: ItemContent<TransactionEvent, Context> = (
  index: number,
  event,
  { intl, wallets, setShowReceipt }
) => {
  const operation = intl.formatMessage(getTransactionTitle(event));
  const { token, txHash, status } = event;

  let formattedDate;
  if (status === TransactionStatus.DONE) {
    const { timestamp } = event;
    const txDate = DateTime.fromSeconds(timestamp);
    formattedDate = txDate.startOf('day').equals(DateTime.now().startOf('day')) ? (
      <FormattedMessage defaultMessage="Today" description="today" />
    ) : txDate.startOf('day').equals(DateTime.now().minus({ days: 1 }).startOf('day')) ? (
      <FormattedMessage defaultMessage="Yesterday" description="yesterday" />
    ) : (
      <>{txDate.toLocaleString(DateTime.DATETIME_MED)}</>
    );
  } else {
    formattedDate = <FormattedMessage defaultMessage="Just now" description="just-now" />;
  }

  const txTokenFlow: string | null = getTransactionValue(event, wallets, intl);
  const txValuePrice: number | undefined = getTransactionTokenValuePrice(event);
  const color = getTransactionPriceColor(event);

  return (
    <StyledForegroundPaper
      elevation={0}
      key={txHash}
      onClick={() => status === TransactionStatus.DONE && setShowReceipt(event)}
    >
      <TokenIconWithNetwork token={token} />
      <StyledOperation>
        <Typography variant="body">{operation}</Typography>
        <Typography variant="bodySmall">{formattedDate}</Typography>
      </StyledOperation>
      <StyledValue>
        <Typography variant="body" color={color}>
          {txTokenFlow}
        </Typography>
        {status === TransactionStatus.PENDING ? (
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={<FormattedMessage defaultMessage="Waiting on confirmation" description="waiting-on-confirmation" />}
          />
        ) : txValuePrice ? (
          <Typography variant="bodySmall">
            ≈{` `}
            {txValuePrice.toFixed(2)}$
          </Typography>
        ) : (
          <Typography variant="bodySmall">-</Typography>
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
        <Typography variant="body">
          <Skeleton variant="text" animation="wave" />
        </Typography>
        <Typography variant="bodySmall">
          <Skeleton variant="text" animation="wave" />
        </Typography>
      </StyledOperation>
      <StyledValue>
        <Typography variant="body">
          <Skeleton variant="text" animation="wave" />
        </Typography>
        <Typography variant="bodySmall">
          <Skeleton variant="text" animation="wave" />
        </Typography>
      </StyledValue>
    </StyledForegroundPaper>
  );
};

const skeletonRows = Array.from(Array(10).keys()) as unknown as TransactionEvent[];

const Activity = () => {
  const trackEvent = useTrackEvent();
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const { fetchMore, events, isLoading } = useTransactionsHistory();
  const intl = useIntl();
  const wallets = useWalletsAddresses();
  const themeMode = useThemeMode();
  const [showReceipt, setShowReceipt] = React.useState<TransactionEvent | undefined>();

  const parsedReceipt = React.useMemo(() => parseTransactionEventToTransactionReceipt(showReceipt), [showReceipt]);

  const onSeeAllHistory = () => {
    dispatch(changeRoute('history'));
    pushToHistory('/history');
    trackEvent('Home - Go to see all history');
  };

  const noActivityYet = React.useMemo(
    () => (
      <StyledNoActivity>
        <Typography variant="h5">🥱</Typography>
        <Typography variant="h5" fontWeight="bold">
          <FormattedMessage description="noActivityTitle" defaultMessage="No Activity Yet" />
        </Typography>
        <Typography variant="body" textAlign="center">
          <FormattedMessage
            description="noActivityParagraph"
            defaultMessage="Once you start making transactions, you'll see all your activity here"
          />
        </Typography>
      </StyledNoActivity>
    ),
    [themeMode]
  );

  console.log(isLoading, events.length);
  const isLoadingWithoutEvents = isLoading && events.length === 0;

  return (
    <>
      <TransactionReceipt
        transaction={parsedReceipt}
        open={!isUndefined(showReceipt)}
        onClose={() => setShowReceipt(undefined)}
      />
      <StyledPaper sx={{ flex: '1', display: 'flex' }}>
        {!isLoading && events.length === 0 ? (
          noActivityYet
        ) : (
          <VirtualizedList
            data={isLoadingWithoutEvents ? skeletonRows : events}
            fetchMore={fetchMore}
            itemContent={isLoadingWithoutEvents ? ActivityBodySkeleton : ActivityContent}
            context={{ intl, wallets, setShowReceipt }}
          />
        )}
        <Button variant="text" color="primary" onClick={onSeeAllHistory} fullWidth>
          <FormattedMessage description="seeAll" defaultMessage="See all" />
          <KeyboardArrowRightIcon fontSize="inherit" />
        </Button>
      </StyledPaper>
    </>
  );
};

export default Activity;
