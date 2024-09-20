import Address from '@common/components/address';
import TokenIcon from '@common/components/token-icon';
import {
  emptyTokenWithDecimals,
  formatCurrencyAmount,
  formatUsdAmount,
  getNetworkCurrencyTokens,
} from '@common/utils/currency';
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
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, ContainerBox, DividerBorder2, Modal, Skeleton, Typography, colors } from 'ui-library';
import { Address as ViemAddress, formatUnits, parseUnits } from 'viem';
import useWalletService from '@hooks/useWalletService';
import useTransactionModal from '@hooks/useTransactionModal';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { useTransactionAdder } from '@state/transactions/hooks';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import useTrackEvent from '@hooks/useTrackEvent';
import useStoredContactList from '@hooks/useStoredContactList';
import { trimAddress } from '@common/utils/parsing';

interface ConfirmTransferModalModalProps {
  open: boolean;
  setOpen: SetStateCallback<boolean>;
  fee?: AmountsOfToken;
  isLoadingFee: boolean;
  network?: NetworkStruct;
  setShouldShowConfirmation: SetStateCallback<boolean>;
  setCurrentTxHash: SetStateCallback<string>;
}

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
  const intl = useIntl();
  const { amount, recipient, token } = useTransferState();
  const themeMode = useThemeMode();
  const tokenPrices = usePortfolioPrices(token ? [token] : []);
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const errorService = useErrorService();
  const trackEvent = useTrackEvent();
  const contacts = useStoredContactList();
  const isRecipientContact = contacts.find(({ address }) => address.toLowerCase() === (recipient || '').toLowerCase());

  if (!activeWallet || token === null || !network) {
    return null;
  }

  const parsedAmount = parseUnits(amount || '0', token?.decimals || 18);
  const parsedAmountsOfToken: AmountsOfToken = {
    amount: parsedAmount,
    amountInUnits: formatCurrencyAmount({ amount: parsedAmount, token, sigFigs: 2 }),
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
        amount: fee.amount,
        amountInUnits: formatCurrencyAmount({
          amount: fee.amount,
          token: nativeCurrencyToken,
          sigFigs: 2,
          intl,
        }),
        amountInUSD: fee.amountInUSD ? Number(fee.amountInUSD).toFixed(2) : undefined,
      }
    : undefined;

  const modalTitle = (
    <ContainerBox flexDirection="column" gap={2} style={{ textAlign: 'left' }}>
      <Typography variant="h4Bold" color={colors[themeMode].typography.typo1}>
        <FormattedMessage description="confirmYourTransfer" defaultMessage="Confirm Your Transfer" />
      </Typography>
      <Typography variant="bodyRegular">
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
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="transferring token"
              defaultMessage="Transferring {amount} {symbol} to {to}"
              values={{ amount, symbol: token.symbol, to: trimAddress(recipient) }}
            />
          </Typography>
        ),
      });

      const isProtocolToken = token.address === PROTOCOL_TOKEN_ADDRESS;
      const parsedToken: Token = { ...token, type: isProtocolToken ? TokenType.NATIVE : TokenType.ERC20_TOKEN };
      trackEvent('Transfer - Transfer submitting', {
        token: parsedToken,
        isRecipientContact,
      });

      const result = await walletService.transferToken({
        from: activeWallet.address,
        to: recipient as ViemAddress,
        token: parsedToken,
        amount: parsedAmount,
      });

      trackEvent('Transfer - Transfer submited', {
        token: parsedToken.symbol,
        isRecipientContact,
        amountInUsd: parsedAmountsOfToken.amountInUSD,
        amount: parsedAmountsOfToken.amountInUnits,
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
          error: e,
        });
        trackEvent('Transfer - Transfer error', {
          token,
          isRecipientContact,
        });
      } else {
        setModalClosed({});
      }
    }
  };

  const onGoBack = () => {
    trackEvent('Transfer - Go back on confirm modal', {
      token,
      isRecipientContact: contacts.find(({ address }) => address.toLowerCase() === recipient.toLowerCase()),
    });
    setOpen(false);
  };

  return (
    <Modal open={open} closeOnBackdrop title={modalTitle} onClose={() => setOpen(false)} maxWidth="sm">
      <ContainerBox flexDirection="column" gap={5} fullWidth style={{ textAlign: 'left' }}>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmallRegular">
            <FormattedMessage description="from" defaultMessage="From" />
          </Typography>
          <Typography variant="bodyBold">
            <Address address={activeWallet.address} />
          </Typography>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmallRegular">
            <FormattedMessage description="to" defaultMessage="To" />
          </Typography>
          <Typography variant="bodyBold">
            <Address address={recipient} />
          </Typography>
        </ContainerBox>
        <DividerBorder2 />
        <ContainerBox gap={4} justifyContent="space-between" flexWrap="wrap">
          <div>
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="amount" defaultMessage="Amount" />
            </Typography>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon token={token} />
              <Typography variant="bodyBold">
                {formatCurrencyAmount({ amount: parsedAmountsOfToken.amount, token, intl })} {token.symbol}
              </Typography>
            </ContainerBox>
            {parsedAmountsOfToken.amountInUSD && (
              <Typography variant="bodySmallRegular">{`≈ ${formatUsdAmount({
                amount: parsedAmountsOfToken.amountInUSD,
                intl,
              })} USD`}</Typography>
            )}
          </div>
          <div>
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="networkFee" defaultMessage="Network Fee" />
            </Typography>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon token={nativeCurrencyToken} />
              <Typography variant="bodyBold" display="inline-flex" gap={2}>
                {isLoadingFee ? (
                  <Skeleton variant="text" width="5ch" />
                ) : parsedFee ? (
                  formatCurrencyAmount({
                    amount: parsedFee.amount,
                    token: (network.nativeCurrency as Token) || emptyTokenWithDecimals(18),
                    intl,
                  })
                ) : (
                  '-'
                )}{' '}
                {network.nativeCurrency.symbol}
              </Typography>
            </ContainerBox>
            {isLoadingFee ? (
              <Skeleton variant="text" width="5ch" />
            ) : (
              parsedFee?.amountInUSD && (
                <Typography variant="bodySmallRegular">{`≈ ${formatUsdAmount({
                  amount: parsedFee.amountInUSD,
                  intl,
                })} USD`}</Typography>
              )
            )}
          </div>
          <div>
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="network" defaultMessage="Network" />
            </Typography>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon token={mainCurrencyToken} />
              <Typography variant="bodyBold">{network.name}</Typography>
            </ContainerBox>
          </div>
        </ContainerBox>
        <ContainerBox flexDirection="column" gap={3} fullWidth alignItems="center">
          <Button onClick={onTransfer} variant="contained" fullWidth size="large">
            <FormattedMessage description="transfer transferButton" defaultMessage="Transfer" />
          </Button>
          <Button variant="outlined" onClick={onGoBack} fullWidth size="large">
            <FormattedMessage description="goBackToEdit" defaultMessage="Go back to Edit" />
          </Button>
        </ContainerBox>
      </ContainerBox>
    </Modal>
  );
};

export default ConfirmTransferModal;
