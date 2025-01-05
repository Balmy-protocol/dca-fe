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
import { ContainerBox, DividerBorder2, Modal, Skeleton, Typography } from 'ui-library';
import { Address as ViemAddress, formatUnits, parseUnits, Hash } from 'viem';
import useWalletService from '@hooks/useWalletService';
import useTransactionModal from '@hooks/useTransactionModal';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { useTransactionAdder } from '@state/transactions/hooks';
import { deserializeError, shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import useAnalytics from '@hooks/useAnalytics';
import useStoredContactList from '@hooks/useStoredContactList';
import { trimAddress } from '@common/utils/parsing';

interface ConfirmTransferModalModalProps {
  open: boolean;
  setOpen: SetStateCallback<boolean>;
  fee?: AmountsOfToken;
  isLoadingFee: boolean;
  network?: NetworkStruct;
  setShouldShowConfirmation: SetStateCallback<boolean>;
  setCurrentTransaction: SetStateCallback<{ hash: Hash; chainId: number } | undefined>;
}

const ConfirmTransferModal = ({
  open,
  setOpen,
  fee,
  isLoadingFee,
  network,
  setShouldShowConfirmation,
  setCurrentTransaction,
}: ConfirmTransferModalModalProps) => {
  const activeWallet = useActiveWallet();
  const walletService = useWalletService();
  const intl = useIntl();
  const { amount, recipient, token } = useTransferState();
  const tokenPrices = usePortfolioPrices(token ? [token] : []);
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const errorService = useErrorService();
  const { trackEvent, setPeopleProperty, unionProperty, incrementProperty } = useAnalytics();
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
      setPeopleProperty({
        general: {
          last_product_used: 'transfer',
          last_network_used: network.name,
        },
      });
      incrementProperty({
        general: {
          total_volume_all_time_usd: parsedAmountsOfToken.amountInUSD,
        },
        transfer: {
          total_volume_usd: parsedAmountsOfToken.amountInUSD,
          count: 1,
        },
      });
      unionProperty({
        general: {
          networks_used: network.name,
          products_used: 'transfer',
          tokens_used: [parsedToken.symbol],
        },
        transfer: {
          networks_used: network.name,
          tokens_used: [parsedToken.symbol],
        },
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
      setCurrentTransaction({
        hash: result.hash,
        chainId: result.chainId,
      });
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
          error: deserializeError(e),
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
    <Modal
      open={open}
      closeOnBackdrop
      title={<FormattedMessage description="confirmYourTransfer" defaultMessage="Confirm Your Transfer" />}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      actionsAlignment="horizontal"
      subtitle={
        <FormattedMessage
          description="transactionReviewDetails"
          defaultMessage="Please review the details of your transaction before proceeding."
        />
      }
      actions={[
        {
          label: <FormattedMessage description="goBackToEdit" defaultMessage="Go back to Edit" />,
          color: 'primary',
          variant: 'outlined',
          onClick: onGoBack,
        },
        {
          label: <FormattedMessage description="transfer transferButton" defaultMessage="Transfer" />,
          color: 'primary',
          variant: 'contained',
          onClick: onTransfer,
        },
      ]}
    >
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
          <Address address={recipient} trimAddress={false} />
        </Typography>
      </ContainerBox>
      <DividerBorder2 />
      <ContainerBox gap={4} justifyContent="space-between" flexWrap="wrap">
        <div>
          <Typography variant="bodySmallRegular">
            <FormattedMessage description="amount" defaultMessage="Amount" />
          </Typography>
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon token={token} size={5} />
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
            <TokenIcon token={nativeCurrencyToken} size={5} />
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
            <TokenIcon token={mainCurrencyToken} size={5} />
            <Typography variant="bodyBold">{network.name}</Typography>
          </ContainerBox>
        </div>
      </ContainerBox>
    </Modal>
  );
};

export default ConfirmTransferModal;
