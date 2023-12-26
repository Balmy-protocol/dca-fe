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
  Typography,
  colors,
} from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import useTransactionsHistory from '@hooks/useTransactionsHistory';
import { DateTime } from 'luxon';
import useTokenListByChainId from '@hooks/useTokenListByChainId';
import { NETWORKS } from '@constants';
import { Address as AddressType, Token, TokenType, TransactionEvent, TransactionEventTypes } from '@types';
import { getProtocolToken } from '@common/mocks/tokens';
import { useThemeMode } from '@state/config/hooks';
import { compact, find } from 'lodash';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, toSignificantFromBigDecimal, toToken } from '@common/utils/currency';
import { formatUnits } from 'viem';
import Address from '@common/components/address';
import { totalSupplyThreshold } from '@common/utils/parsing';
import useWallets from '@hooks/useWallets';
import { useAllPendingTransactions } from '@state/transactions/hooks';
import { parseTxToTxEventHistory } from '@common/utils/transactions';
import { CircleIcon } from 'ui-library/src/icons';

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

interface EventHistoryRow {
  txHash: AddressType;
  dateTime: {
    date: string;
    time: string;
  };
  operation: string;
  asset: Token;
  chainName: string;
  amount: bigint;
  amountUsd: number | undefined;
  sourceWallet: AddressType;
  type: TransactionEventTypes;
  to?: AddressType;
  isPending?: boolean;
}

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

const formatAmountElement = (rowData: EventHistoryRow, wallets: AddressType[]): React.ReactElement => {
  if (
    rowData.amount > totalSupplyThreshold(rowData.asset.decimals) &&
    rowData.type === TransactionEventTypes.ERC20_APPROVAL
  ) {
    return (
      <StyledCellTypography>
        <FormattedMessage description="unlimited" defaultMessage="Unlimited" />
      </StyledCellTypography>
    );
  }

  if (
    (rowData.type === TransactionEventTypes.ERC20_TRANSFER || rowData.type == TransactionEventTypes.NATIVE_TRANSFER) &&
    rowData.to
  ) {
    const isReceivingFunds = wallets.includes(rowData.to);
    return (
      <Typography variant="body" noWrap color={isReceivingFunds ? 'success.main' : 'error'} maxWidth={'16ch'}>
        {`${isReceivingFunds ? '+' : '-'}${formatCurrencyAmount(rowData.amount, rowData.asset, 2)} ${
          rowData.asset.symbol
        }`}
      </Typography>
    );
  }

  return (
    <StyledCellTypography noWrap maxWidth={'16ch'}>{`${formatCurrencyAmount(rowData.amount, rowData.asset, 2)} ${
      rowData.asset.symbol
    }`}</StyledCellTypography>
  );
};

const HistoryTable = () => {
  const { history, isLoading, fetchMore } = useTransactionsHistory();
  const tokenListByChainId = useTokenListByChainId();
  const pendingTransactions = useAllPendingTransactions();
  const wallets = useWallets().map((wallet) => wallet.address);
  const lastRenderedTxEventRef = React.useRef(null);
  const intl = useIntl();
  const themeMode = useThemeMode();

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          void fetchMore();
        }
      });
    });

    if (lastRenderedTxEventRef.current) {
      observer.observe(lastRenderedTxEventRef.current);
    }

    return () => {
      if (lastRenderedTxEventRef.current) {
        observer.unobserve(lastRenderedTxEventRef.current);
      }
    };
  }, [lastRenderedTxEventRef]);

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

  const createEventHistoryRow = React.useCallback(
    (txEvent: TransactionEvent): EventHistoryRow => {
      const amount = BigInt(txEvent.amount);
      const chainName = find(NETWORKS, { chainId: txEvent.chainId })?.name || '-';

      const txDate = DateTime.fromSeconds(txEvent.timestamp).startOf('day');
      const formattedDate = txDate.equals(DateTime.now().startOf('day'))
        ? intl.formatMessage(defineMessage({ defaultMessage: 'Today', description: 'today' }))
        : txDate.equals(DateTime.now().minus({ days: 1 }).startOf('day'))
        ? intl.formatMessage(defineMessage({ defaultMessage: 'Yesterday', description: 'yesterday' }))
        : txDate.toFormat('MM/dd/yyyy');
      const dateTime = {
        date: formattedDate,
        time: txDate.toFormat('hh:mm ZZZZ'),
      };

      let operation: string,
        sourceWallet: AddressType,
        asset: Token,
        to: AddressType | undefined,
        amountUsd: number | undefined;

      switch (txEvent.type) {
        case TransactionEventTypes.ERC20_APPROVAL:
          operation = intl.formatMessage(defineMessage({ defaultMessage: 'Approval', description: 'approval' }));
          asset =
            tokenListByChainId[txEvent.chainId][txEvent.token] ??
            toToken({ address: txEvent.token, chainId: txEvent.chainId, decimals: 18, type: TokenType.ERC20_TOKEN });
          sourceWallet = txEvent.owner;
          break;
        case TransactionEventTypes.ERC20_TRANSFER:
          operation = intl.formatMessage(defineMessage({ defaultMessage: 'Transfer', description: 'transfer' }));
          asset =
            tokenListByChainId[txEvent.chainId][txEvent.token] ??
            toToken({ address: txEvent.token, chainId: txEvent.chainId, decimals: 18, type: TokenType.ERC20_TOKEN });
          sourceWallet = txEvent.from;
          amountUsd = parseFloat(formatUnits(BigInt(txEvent.amount), asset.decimals)) * txEvent.tokenPrice;
          to = txEvent.to;
          break;
        case TransactionEventTypes.NATIVE_TRANSFER:
          operation = intl.formatMessage(defineMessage({ defaultMessage: 'Transfer', description: 'transfer' }));
          asset = getProtocolToken(txEvent.chainId);
          sourceWallet = txEvent.from;
          amountUsd = parseFloat(formatUnits(BigInt(txEvent.amount), asset.decimals)) * txEvent.nativePrice;
          to = txEvent.to;
          break;
      }

      return {
        txHash: txEvent.txHash,
        dateTime,
        operation,
        sourceWallet,
        asset,
        chainName,
        amount,
        amountUsd,
        type: txEvent.type,
        to,
      };
    },
    [tokenListByChainId, intl]
  );

  const rows = React.useMemo(() => {
    const pendingTxs = compact<EventHistoryRow>(
      Object.values(pendingTransactions).map((tx) => {
        const parsedTxEvent = parseTxToTxEventHistory(tx);
        return parsedTxEvent && { ...createEventHistoryRow(parsedTxEvent), isPending: true };
      })
    );

    const txHistory = (history?.events || []).map((txEvent) => createEventHistoryRow(txEvent));

    return [...pendingTxs, ...txHistory];
  }, [history, pendingTransactions]);

  return (
    <>
      {!isLoading && (!history || rows.length === 0) ? (
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
              {rows.map((rowData, index) => (
                <TableRow
                  sx={{ height: '100%' }}
                  key={rowData.txHash}
                  ref={index === rows.length - 1 ? lastRenderedTxEventRef : null}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <StyledCellTypography>{rowData.dateTime.date}</StyledCellTypography>
                      <StyledCellTypographySmall>{rowData.dateTime.time}</StyledCellTypographySmall>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <StyledCellTypography>{rowData.operation}</StyledCellTypography>
                      {rowData.isPending && (
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
                    <TokenIcon token={rowData.asset} size="32px" />
                    <Box display="flex" flexDirection="column">
                      <StyledCellTypography noWrap maxWidth={'6ch'}>
                        {rowData.asset.symbol || '-'}
                      </StyledCellTypography>
                      <StyledCellTypographySmall noWrap maxWidth={'12ch'}>
                        {rowData.asset.name || '-'}
                      </StyledCellTypographySmall>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StyledCellTypography>{rowData.chainName}</StyledCellTypography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {formatAmountElement(rowData, wallets)}
                      {rowData.amountUsd && (
                        <StyledCellTypographySmall>
                          ${toSignificantFromBigDecimal(rowData.amountUsd.toString(), 2)}
                        </StyledCellTypographySmall>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StyledCellTypography noWrap maxWidth={'12ch'}>
                      <Address address={rowData.sourceWallet} showDetailsOnHover trimAddress trimSize={4} />
                    </StyledCellTypography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: colors[themeMode].accentPrimary,
                      }}
                    >
                      <ReceiptIcon />
                      <Typography variant="bodyExtraSmall" noWrap>
                        <FormattedMessage description="viewMore" defaultMessage="View more" />
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && <HistoryTableBodySkeleton />}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default HistoryTable;
