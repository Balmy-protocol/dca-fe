import Address from '@common/components/address';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, getNetworkCurrencyTokens } from '@common/utils/currency';
import useActiveWallet from '@hooks/useActiveWallet';
import { usePortfolioPrices } from '@state/balances/hooks';
import { useThemeMode } from '@state/config/hooks';
import { useTransferState } from '@state/transfer/hooks';
import {
  NetworkStruct,
  SetStateCallback,
  Token,
  TokenType,
  TransactionTypes,
  TransferTokenTypeData,
  AmountsOfToken,
} from 'common-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Button, ContainerBox, Divider, Modal, Skeleton, Typography, colors } from 'ui-library';
import { Address as ViemAddress, formatUnits, parseUnits } from 'viem';
import useWalletService from '@hooks/useWalletService';
import useTransactionModal from '@hooks/useTransactionModal';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { useTransactionAdder } from '@state/transactions/hooks';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';

interface ConfirmTransferModalModalProps {
  open: boolean;
  setOpen: SetStateCallback<boolean>;
  fee?: AmountsOfToken;
  isLoadingFee: boolean;
  network?: NetworkStruct;
  setShouldShowConfirmation: SetStateCallback<boolean>;
  setCurrentTxHash: SetStateCallback<string>;
}

const StyledDivider = styled(Divider)`
  border-color: ${({ theme: { palette } }) => colors[palette.mode].border.border2};
`;

const ConfirmTransferModal = ({
  open,
  setOpen,
  fee,
  isLoadingFee,
  network,
  setShouldShowConfirmation,
  setCurrentTxHash,
}: ConfirmTransferModalModalProps) => {
  const activeWallet = useActiveWallet();
  const walletService = useWalletService();
  const { amount, recipient, token } = useTransferState();
  const themeMode = useThemeMode();
  const tokenPrices = usePortfolioPrices(token ? [token] : []);
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const errorService = useErrorService();

  if (!activeWallet || token === null || !network) {
    return null;
  }

  const parsedAmount = parseUnits(amount || '0', token?.decimals || 18);
  const parsedAmountsOfToken: AmountsOfToken = {
    amount: parsedAmount,
    amountInUnits: formatCurrencyAmount(parsedAmount, token, 2),
    amountInUSD: parseFloat(
      formatUnits(
        parsedAmount * parseUnits(tokenPrices[token.address].price?.toString() || '0', 18),
        token.decimals + 18
      )
    ).toFixed(2),
  };

  const { nativeCurrencyToken, mainCurrencyToken } = getNetworkCurrencyTokens(network);

  const parsedFee = fee
    ? {
        amountInUnits: formatCurrencyAmount(BigInt(fee.amount), nativeCurrencyToken, 2),
        amountInUSD: fee.amountInUSD ? Number(fee.amountInUSD).toFixed(2) : undefined,
      }
    : undefined;

  const modalTitle = (
    <ContainerBox flexDirection="column" gap={2} style={{ textAlign: 'left' }}>
      <Typography variant="h4" fontWeight="bold" color={colors[themeMode].typography.typo1}>
        <FormattedMessage description="confirmYourTransfer" defaultMessage="Confirm Your Transfer" />
      </Typography>
      <Typography variant="body">
        <FormattedMessage
          description="transactionReviewDetails"
          defaultMessage="Please review the details of your transaction before proceeding."
        />
      </Typography>
    </ContainerBox>
  );

  const onTransfer = async () => {
    setOpen(false);

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
        to: recipient as ViemAddress,
        token: parsedToken,
        amount: parsedAmount,
      });

      const transactionTypeData: TransferTokenTypeData = {
        type: TransactionTypes.transferToken,
        typeData: {
          token: parsedToken,
          to: recipient,
          amount: parsedAmount.toString(),
        },
      };

      addTransaction(result, transactionTypeData);

      setModalClosed({ content: '' });
      setCurrentTxHash(result.hash);
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

  return (
    <Modal open={open} closeOnBackdrop title={modalTitle} onClose={() => setOpen(false)} maxWidth="sm">
      <ContainerBox flexDirection="column" gap={5} fullWidth style={{ textAlign: 'left' }}>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmall">
            <FormattedMessage description="from" defaultMessage="From" />
          </Typography>
          <Typography variant="body" fontWeight="bold">
            <Address address={activeWallet.address} ens={activeWallet.ens} />
          </Typography>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmall">
            <FormattedMessage description="to" defaultMessage="To" />
          </Typography>
          <Typography variant="body" fontWeight="bold">
            <Address address={recipient} />
          </Typography>
        </ContainerBox>
        <StyledDivider />
        <ContainerBox gap={4} justifyContent="space-between">
          <div>
            <Typography variant="bodySmall">
              <FormattedMessage description="amount" defaultMessage="Amount" />
            </Typography>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon token={token} />
              <Typography variant="body" fontWeight="bold">
                {parsedAmountsOfToken.amountInUnits} {token.symbol}
              </Typography>
            </ContainerBox>
            {parsedAmountsOfToken.amountInUSD && (
              <Typography variant="bodySmall">{`≈ ${parsedAmountsOfToken.amountInUSD} USD`}</Typography>
            )}
          </div>
          <div>
            <Typography variant="bodySmall">
              <FormattedMessage description="networkFee" defaultMessage="Network Fee" />
            </Typography>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon token={nativeCurrencyToken} />
              <Typography variant="body" fontWeight="bold" display="inline-flex" gap={2}>
                {isLoadingFee ? <Skeleton variant="text" width="5ch" /> : parsedFee ? parsedFee.amountInUnits : '-'}{' '}
                {network.nativeCurrency.symbol}
              </Typography>
            </ContainerBox>
            {isLoadingFee ? (
              <Skeleton variant="text" width="5ch" />
            ) : (
              parsedFee?.amountInUSD && <Typography variant="bodySmall">{`≈ ${parsedFee.amountInUSD} USD`}</Typography>
            )}
          </div>
          <div>
            <Typography variant="bodySmall">
              <FormattedMessage description="network" defaultMessage="Network" />
            </Typography>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon token={mainCurrencyToken} />
              <Typography variant="body" fontWeight="bold">
                {network.name}
              </Typography>
            </ContainerBox>
          </div>
        </ContainerBox>
        <ContainerBox flexDirection="column" gap={3} fullWidth alignItems="center">
          <Button onClick={onTransfer} variant="contained" fullWidth>
            <FormattedMessage description="transfer transferButton" defaultMessage="Transfer" />
          </Button>
          <Button variant="outlined" onClick={() => setOpen(false)} fullWidth>
            <FormattedMessage description="goBackToEdit" defaultMessage="Go back to Edit" />
          </Button>
        </ContainerBox>
      </ContainerBox>
    </Modal>
  );
};

export default ConfirmTransferModal;
