import React from 'react';
import { Typography, ContainerBox } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { Token, TokenListId } from '@types';
import HistoryTable from '@pages/history/components/historyTable';
import { getAllChains } from '@balmy/sdk';
import useTransactionService from '@hooks/useTransactionService';
import { useTheme } from 'styled-components';

interface HistoryTableProps {
  token: Token;
}

const TokenHistory = ({ token }: HistoryTableProps) => {
  const { spacing } = useTheme();
  const transactionService = useTransactionService();
  const tokenListIds = React.useMemo(() => {
    const chains = getAllChains().map((chain) => chain.chainId);
    const ids = token.chainAddresses
      .filter((chainAddress) => chains.includes(chainAddress.chainId))
      .map((chainAddress) => `${chainAddress.chainId}-${chainAddress.address}` as TokenListId);

    return ids.length > 0 ? ids : [`${token.chainId}-${token.address}` as TokenListId];
  }, [token.chainAddresses]);

  React.useEffect(() => {
    transactionService.clearTokenHistoryTimestamp();
  }, []);

  return (
    <ContainerBox flexDirection="column" gap={6}>
      <Typography variant="h2Bold">
        <FormattedMessage defaultMessage="History" description="token-profile.history.title" />
      </Typography>
      <HistoryTable tokens={tokenListIds} height={spacing(125)} />
    </ContainerBox>
  );
};

export default TokenHistory;
