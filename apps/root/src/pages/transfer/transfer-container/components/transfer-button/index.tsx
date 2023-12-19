import React from 'react';
import { shouldTrackError } from '@common/utils/errors';
import { Address, parseUnits } from 'viem';
import { useAppDispatch } from '@state/hooks';
import useActiveWallet from '@hooks/useActiveWallet';
import useErrorService from '@hooks/useErrorService';
import useTransactionModal from '@hooks/useTransactionModal';
import useWalletService from '@hooks/useWalletService';
import { useTransactionAdder } from '@state/transactions/hooks';
import { useTransferState } from '@state/transfer/hooks';
import { Token, TokenType, TransactionTypes, TransferTokenTypeData } from '@types';
import { FormattedMessage } from 'react-intl';
import { Button, Typography } from 'ui-library';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { resetForm } from '@state/transfer/actions';
import TransactionConfirmation from '../transaction-confirmation';

const TransferButton = () => {
  const dispatch = useAppDispatch();
  const { token, amount, recipient } = useTransferState();
  const walletService = useWalletService();
  const activeWallet = useActiveWallet();
  const errorService = useErrorService();
  const addTransaction = useTransactionAdder();
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState<boolean>(false);
  const [currentTransaction, setCurrentTransaction] = React.useState<string>('');
  const parsedAmount = parseUnits(amount || '0', token?.decimals || 18);
  const disableTransfer = !recipient || !token || parsedAmount <= 0n || !activeWallet;

  const onTransfer = async () => {
    if (disableTransfer) {
      return;
    }

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="transfering token"
              defaultMessage="Transfering {amount} {symbol} to {to}"
              values={{ amount, symbol: token.symbol, to: recipient }}
            />
          </Typography>
        ),
      });

      const isProtocolToken = token.address === PROTOCOL_TOKEN_ADDRESS;
      const parsedToken: Token = { ...token, type: isProtocolToken ? TokenType.NATIVE : TokenType.ERC20_TOKEN };

      const result = await walletService.transferToken({
        from: activeWallet.address,
        to: recipient as Address,
        token: parsedToken,
        amount: parsedAmount,
      });

      const transactionTypeData: TransferTokenTypeData = {
        type: TransactionTypes.transferToken,
        typeData: {
          token: parsedToken,
          to: recipient,
          amount,
        },
      };

      addTransaction(result, transactionTypeData);

      setModalClosed({ content: '' });
      setCurrentTransaction(result.hash);
      setShouldShowConfirmation(true);
    } catch (e) {
      if (shouldTrackError(e as Error)) {
        void errorService.logError('Error transfering token', JSON.stringify(e), {
          from: activeWallet.address,
          to: recipient,
          amount,
          token,
        });
        setModalError({
          content: 'Error transfering token',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          error: { code: e.code, message: e.message, data: e.data },
        });
      } else {
        setModalClosed({});
      }
    }
  };

  const handleTransactionConfirmationClose = React.useCallback(() => {
    dispatch(resetForm());
    setShouldShowConfirmation(false);
  }, [dispatch, setShouldShowConfirmation]);

  return (
    <>
      <TransactionConfirmation
        from={token}
        shouldShow={shouldShowConfirmation}
        transaction={currentTransaction}
        handleClose={handleTransactionConfirmationClose}
      />
      <Button variant="outlined" fullWidth onClick={onTransfer} disabled={disableTransfer}>
        <Typography variant="body1">
          <FormattedMessage description="transfer transferButton" defaultMessage="Transfer" />
        </Typography>
      </Button>
    </>
  );
};

export default TransferButton;
