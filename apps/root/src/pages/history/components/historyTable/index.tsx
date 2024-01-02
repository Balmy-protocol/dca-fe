import React from 'react';
import {
  Box,
  ReceiptIcon,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TransactionReceipt,
  Typography,
  colors,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import useTransactionsHistory from '@hooks/useTransactionsHistory';
import { DateTime } from 'luxon';
import { Address as AddressType, TransactionEvent, TransactionEventTypes } from '@types';
import { useThemeMode } from '@state/config/hooks';
import Address from '@common/components/address';
import { totalSupplyThreshold } from '@common/utils/parsing';
import useWallets from '@hooks/useWallets';
import { CircleIcon } from 'ui-library/src/icons';
import useInfiniteLoading from '@hooks/useInfiniteLoading';
import { toSignificantFromBigDecimal } from '@common/utils/currency';
import { isUndefined } from 'lodash';

const StyledCellTypography = styled(Typography).attrs({
  variant: 'body',
  noWrap: true,
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
  `}
`;

const StyledCellTypographySmall = styled(Typography).attrs({
  variant: 'bodySmall',
  noWrap: true,
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo3};

  `}
`;

type TxEventRowData = TransactionEvent & {
  dateTime: {
    date: React.ReactElement;
    time: string;
  };
  operation: React.ReactElement;
  sourceWallet: AddressType;
  isPending?: boolean;
};

const HistoryTableBodySkeleton = () => {
  const skeletonRows = Array.from(Array(8).keys());
  return (
    <>
      {skeletonRows.map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Box display="flex" flexDirection="column" gap={1}>
              <StyledCellTypography>
                <Skeleton variant="text" animation="wave" />
              </StyledCellTypography>
              <StyledCellTypographySmall>
                <Skeleton variant="text" animation="wave" />
              </StyledCellTypographySmall>
            </Box>
          </TableCell>
          <TableCell>
            <StyledCellTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledCellTypography>
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems={'center'} gap={3}>
              <Skeleton variant="circular" width={32} height={32} animation="wave" />
              <Box display="flex" alignItems={'stretch'} flexDirection="column" flexGrow={1} gap={1}>
                <StyledCellTypography>
                  <Skeleton variant="text" animation="wave" />
                </StyledCellTypography>
                <StyledCellTypographySmall>
                  <Skeleton variant="text" animation="wave" />
                </StyledCellTypographySmall>
              </Box>
            </Box>
          </TableCell>
          <TableCell>
            <StyledCellTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledCellTypography>
          </TableCell>
          <TableCell>
            <StyledCellTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledCellTypography>
          </TableCell>
          <TableCell>
            <StyledCellTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledCellTypography>
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems={'center'} flexDirection="column" gap={1}>
              <Skeleton variant="rounded" width={20} height={20} animation="wave" />
              <StyledCellTypographySmall alignSelf="stretch">
                <Skeleton variant="text" animation="wave" />
              </StyledCellTypographySmall>
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

const formatAmountElement = (txEvent: TransactionEvent, wallets: AddressType[]): React.ReactElement => {
  if (
    BigInt(txEvent.amount.amount) > totalSupplyThreshold(txEvent.token.decimals) &&
    txEvent.type === TransactionEventTypes.ERC20_APPROVAL
  ) {
    return (
      <StyledCellTypography>
        <FormattedMessage description="unlimited" defaultMessage="Unlimited" />
      </StyledCellTypography>
    );
  }

  if (
    (txEvent.type === TransactionEventTypes.ERC20_TRANSFER || txEvent.type == TransactionEventTypes.NATIVE_TRANSFER) &&
    txEvent.to
  ) {
    const isReceivingFunds = wallets.includes(txEvent.to);
    return (
      <Typography variant="body" noWrap color={isReceivingFunds ? 'success.main' : 'error'} maxWidth="16ch">
        {`${isReceivingFunds ? '+' : '-'}${txEvent.amount.amountInUnits} ${txEvent.token.symbol}`}
      </Typography>
    );
  }

  return (
    <StyledCellTypography
      noWrap
      maxWidth={'16ch'}
    >{`${txEvent.amount.amountInUnits} ${txEvent.token.symbol}`}</StyledCellTypography>
  );
};

const getTxEventRowData = (txEvent: TransactionEvent): TxEventRowData => {
  const txDate = DateTime.fromSeconds(txEvent.timestamp).startOf('day');
  const formattedDate = txDate.equals(DateTime.now().startOf('day')) ? (
    <FormattedMessage defaultMessage="Today" description="today" />
  ) : txDate.equals(DateTime.now().minus({ days: 1 }).startOf('day')) ? (
    <FormattedMessage defaultMessage="Yesterday" description="yesterday" />
  ) : (
    <>{txDate.toLocaleString(DateTime.DATE_SHORT)}</>
  );
  const dateTime = {
    date: formattedDate,
    time: txDate.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET),
  };

  let operation: React.ReactElement, sourceWallet: AddressType;

  switch (txEvent.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      operation = <FormattedMessage defaultMessage="Approval" description="approval" />;
      sourceWallet = txEvent.owner;
      break;
    case TransactionEventTypes.ERC20_TRANSFER:
      operation = <FormattedMessage defaultMessage="Transfer" description="transfer" />;
      sourceWallet = txEvent.from;
      break;
    case TransactionEventTypes.NATIVE_TRANSFER:
      operation = <FormattedMessage defaultMessage="Transfer" description="transfer" />;
      sourceWallet = txEvent.from;
      break;
  }

  return {
    ...txEvent,
    dateTime,
    operation,
    sourceWallet,
  };
};

const HistoryTable = () => {
  const { events, isLoading, fetchMore } = useTransactionsHistory();
  const wallets = useWallets().map((wallet) => wallet.address);
  const [showReceipt, setShowReceipt] = React.useState<TransactionEvent | undefined>();
  const themeMode = useThemeMode();

  const lastElementRef = useInfiniteLoading(fetchMore);

  const noActivityYet = React.useMemo(
    () => (
      <Box display="flex" flexDirection={'column'} gap={2} alignItems="center">
        <Typography variant="h5">🥱</Typography>
        <Typography variant="h5" fontWeight="bold" color={colors[themeMode].typography.typo3}>
          <FormattedMessage description="noActivityTitle" defaultMessage="No Activity Yet" />
        </Typography>
        <Typography variant="body" textAlign="center" color={colors[themeMode].typography.typo3}>
          <FormattedMessage
            description="noActivityParagraph"
            defaultMessage="Once you start making transactions, you'll see all your activity here"
          />
        </Typography>
      </Box>
    ),
    [themeMode]
  );

  return (
    <>
      {!isLoading && events.length === 0 ? (
        noActivityYet
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <StyledCellTypographySmall>
                    <FormattedMessage description="date" defaultMessage="Date" />
                  </StyledCellTypographySmall>
                </TableCell>
                <TableCell>
                  <StyledCellTypographySmall>
                    <FormattedMessage description="operation" defaultMessage="Operation" />
                  </StyledCellTypographySmall>
                </TableCell>
                <TableCell>
                  <StyledCellTypographySmall>
                    <FormattedMessage description="asset" defaultMessage="Asset" />
                  </StyledCellTypographySmall>
                </TableCell>
                <TableCell>
                  <StyledCellTypographySmall>
                    <FormattedMessage description="chain" defaultMessage="Chain" />
                  </StyledCellTypographySmall>
                </TableCell>
                <TableCell>
                  <StyledCellTypographySmall>
                    <FormattedMessage description="amount" defaultMessage="Amount" />
                  </StyledCellTypographySmall>
                </TableCell>
                <TableCell>
                  <StyledCellTypographySmall>
                    <FormattedMessage description="sourceWallet" defaultMessage="Source Wallet" />
                  </StyledCellTypographySmall>
                </TableCell>
                <TableCell>
                  <StyledCellTypographySmall>
                    <FormattedMessage description="details" defaultMessage="Details" />
                  </StyledCellTypographySmall>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((txEvent, index) => {
                const { dateTime, operation, sourceWallet, ...transaction } = getTxEventRowData(txEvent);
                return (
                  <TableRow
                    sx={{ height: '100%' }}
                    key={transaction.txHash}
                    ref={index === events.length - 1 ? lastElementRef : null}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <StyledCellTypography>{dateTime.date}</StyledCellTypography>
                        <StyledCellTypographySmall>{dateTime.time}</StyledCellTypographySmall>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <StyledCellTypography>{operation}</StyledCellTypography>
                        {transaction.isPending && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <CircleIcon sx={{ fontSize: '8px' }} color="warning" />
                            <StyledCellTypographySmall>
                              <FormattedMessage description="inProgress" defaultMessage="In progress" />
                            </StyledCellTypographySmall>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {transaction.token.icon}
                      <Box display="flex" flexDirection="column">
                        <StyledCellTypography noWrap maxWidth={'6ch'}>
                          {transaction.token.symbol || '-'}
                        </StyledCellTypography>
                        <StyledCellTypographySmall noWrap maxWidth={'12ch'}>
                          {transaction.token.name || '-'}
                        </StyledCellTypographySmall>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StyledCellTypography>{transaction.network.name}</StyledCellTypography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {formatAmountElement(transaction, wallets)}
                        {transaction.amount.amountInUSD && (
                          <StyledCellTypographySmall>
                            ${toSignificantFromBigDecimal(transaction.amount.amountInUSD.toString(), 2)}
                          </StyledCellTypographySmall>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StyledCellTypography noWrap maxWidth={'12ch'}>
                        <Address address={sourceWallet} showDetailsOnHover trimAddress trimSize={4} />
                      </StyledCellTypography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          color: colors[themeMode].accentPrimary,
                          cursor: 'pointer',
                        }}
                        onClick={() => setShowReceipt(transaction)}
                      >
                        <ReceiptIcon />
                        <Typography variant="bodyExtraSmall" noWrap>
                          <FormattedMessage description="viewMore" defaultMessage="View more" />
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {isLoading && <HistoryTableBodySkeleton />}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TransactionReceipt
        transaction={showReceipt}
        open={!isUndefined(showReceipt)}
        onClose={() => setShowReceipt(undefined)}
      />
    </>
  );
};

export default HistoryTable;
