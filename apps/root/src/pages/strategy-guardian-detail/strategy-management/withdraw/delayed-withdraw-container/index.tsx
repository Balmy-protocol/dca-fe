import Address from '@common/components/address';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { getDelayedWithdrawals } from '@common/utils/earn/parsing';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import useEarnClaimDelayedWithdrawAction from '@hooks/earn/useEarnClaimDelayedWithdrawAction';
import useEarnPositions from '@hooks/earn/useEarnPositions';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useAnalytics from '@hooks/useAnalytics';
import useWallet from '@hooks/useWallet';
import { WalletActionType } from '@services/accountService';
import { useShowBalances } from '@state/config/hooks';
import { DelayedWithdrawalPositions, DelayedWithdrawalStatus, DisplayStrategy, WalletStatus } from 'common-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  Button,
  colors,
  ContainerBox,
  OpenInNewIcon,
  DividerBorder1,
  Link,
  TablePagination,
  TickCircleIcon,
  TimerIcon,
  Typography,
  HiddenNumber,
} from 'ui-library';

interface DelayedWithdrawItemProps {
  position: DelayedWithdrawalPositions;
  delayed: DelayedWithdrawalPositions['delayed'][number];
  type: DelayedWithdrawalStatus;
  setPage: (page: number) => void;
}

const StyledIconContainer = styled(ContainerBox)`
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
  }) => `
    background-color: ${colors[mode].background.emphasis};
    border-radius: 100px;
    padding: ${spacing(1.5)};
  `}
`;

const DelayedWithdrawItem = ({ delayed, type, position, setPage }: DelayedWithdrawItemProps) => {
  const intl = useIntl();
  const { trackEvent } = useAnalytics();
  const openConnectModal = useOpenConnectModal();
  const onClaimDelayedWithdraw = useEarnClaimDelayedWithdrawAction();
  const showBalances = useShowBalances();

  const ownerWallet = useWallet(position.owner);

  const isWalletConnected = ownerWallet?.status === WalletStatus.connected;

  const onReconnectWallet = () => {
    trackEvent('Earn - Strategy Management - Ready delayed Withdrawal - Reconnect wallet');
    openConnectModal(WalletActionType.reconnect);
  };

  const onClick = isWalletConnected ? () => onClaimDelayedWithdraw(position) : onReconnectWallet;

  const handleClick = () => {
    onClick();
    setPage(0);
  };

  return (
    <ContainerBox gap={4} flexDirection="column" alignItems="flex-start">
      <ContainerBox gap={3} flexDirection="column">
        <Typography
          variant="bodySmallSemibold"
          color={({ palette: { mode } }) => ({ color: colors[mode].typography.typo1 })}
        >
          {type === DelayedWithdrawalStatus.READY ? (
            <FormattedMessage
              description="earn.strategy-management.withdraw.delayed-withdraw.item.ready.title"
              defaultMessage="Ready for withdraw"
            />
          ) : (
            <FormattedMessage
              description="earn.strategy-management.withdraw.delayed-withdraw.item.pending.title"
              defaultMessage="Pending amount"
            />
          )}
        </Typography>
        <ContainerBox gap={3} alignItems="center">
          <StyledIconContainer>
            {type === DelayedWithdrawalStatus.READY ? (
              <TickCircleIcon
                fontSize="medium"
                sx={({ palette: { mode } }) => ({ color: colors[mode].semantic.success.darker })}
              />
            ) : (
              <TimerIcon fontSize="medium" sx={({ palette: { mode } }) => ({ color: colors[mode].typography.typo3 })} />
            )}
          </StyledIconContainer>
          <ContainerBox gap={6}>
            {/* Amount information */}
            <ContainerBox gap={1} flexDirection="column">
              <Typography
                variant="bodySmallRegular"
                color={({ palette: { mode } }) => ({ color: colors[mode].typography.typo3 })}
              >
                {type === DelayedWithdrawalStatus.READY ? (
                  <FormattedMessage
                    description="earn.strategy-management.withdraw.delayed-withdraw.item.amount.ready"
                    defaultMessage="Amount"
                  />
                ) : (
                  <FormattedMessage
                    description="earn.strategy-management.withdraw.delayed-withdraw.item.amount.pending"
                    defaultMessage="Pending"
                  />
                )}
              </Typography>
              <ContainerBox gap={2} alignItems="center">
                <TokenIcon token={delayed.token} size={6} />
                <ContainerBox gap={1} alignItems="center">
                  {showBalances ? (
                    <>
                      <Typography variant="bodyBold">
                        {`${formatCurrencyAmount({
                          amount:
                            type === DelayedWithdrawalStatus.READY ? delayed.ready.amount : delayed.pending.amount,
                          token: delayed.token,
                          intl,
                        })} ${delayed.token.symbol}`}
                      </Typography>
                      <Typography variant="bodyBold" color={({ palette: { mode } }) => colors[mode].typography.typo4}>
                        $(
                        {type === DelayedWithdrawalStatus.READY
                          ? formatUsdAmount({ amount: delayed.ready.amountInUSD, intl })
                          : formatUsdAmount({ amount: delayed.pending.amountInUSD, intl })}
                        )
                      </Typography>
                    </>
                  ) : (
                    <HiddenNumber size="small" />
                  )}
                </ContainerBox>
              </ContainerBox>
            </ContainerBox>
            <ContainerBox gap={1} flexDirection="column">
              <Typography
                variant="bodySmallRegular"
                color={({ palette: { mode } }) => ({ color: colors[mode].typography.typo3 })}
              >
                <FormattedMessage
                  description="earn.strategy-management.withdraw.delayed-withdraw.item.wallet"
                  defaultMessage="Wallet"
                />
              </Typography>
              <Typography
                variant="bodyBold"
                color={({ palette: { mode } }) =>
                  isWalletConnected ? colors[mode].typography.typo2 : colors[mode].accentPrimary
                }
              >
                <Address address={position.owner} trimAddress />
              </Typography>
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
      </ContainerBox>
      {type === DelayedWithdrawalStatus.READY &&
        (!!position.pendingTransaction ? (
          <Button variant="outlined">
            <Link
              href={buildEtherscanTransaction(position.pendingTransaction, position.strategy.network.chainId)}
              target="_blank"
              rel="noreferrer"
              underline="none"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Typography variant="bodySmallRegular" component="span">
                <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
              </Typography>
              <OpenInNewIcon style={{ fontSize: '1rem' }} />
            </Link>
          </Button>
        ) : (
          <Button variant="outlined" onClick={handleClick}>
            {isWalletConnected ? (
              <FormattedMessage
                description="earn.strategy-management.withdraw.delayed-withdraw.item.withdraw-now"
                defaultMessage="Withdraw now"
              />
            ) : (
              <FormattedMessage
                defaultMessage="Switch"
                description="earn.strategy-management.withdraw.delayed-withdraw.item.switch-wallet"
              />
            )}
          </Button>
        ))}
    </ContainerBox>
  );
};

const StyledDelayedWithdrawItemContainer = styled(ContainerBox).attrs(() => ({ flexDirection: 'column' }))<{
  $type: DelayedWithdrawalStatus;
}>`
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
    $type,
  }) => `
    padding: ${spacing(4)};
    background-color: ${colors[mode].background.tertiary};
    border: 1.5px solid ${
      $type === DelayedWithdrawalStatus.PENDING
        ? colors[mode].semantic.warning.darker
        : colors[mode].semantic.success.darker
    };
    border-radius: ${spacing(3)};
  `}
`;

interface DelayedWithdrawItemContainerProps {
  positions: DelayedWithdrawalPositions[];
  type: DelayedWithdrawalStatus;
}

const DelayedWithdrawItemContainer = ({ positions, type }: DelayedWithdrawItemContainerProps) => {
  const [page, setPage] = React.useState(0);

  const flattedDelayedWithdraws = positions.reduce<
    { position: DelayedWithdrawalPositions; delayed: DelayedWithdrawalPositions['delayed'][number] }[]
  >((acc, position) => {
    return acc.concat(position.delayed.map((delayed) => ({ position, delayed })));
  }, []);

  return (
    <StyledDelayedWithdrawItemContainer $type={type}>
      <DelayedWithdrawItem
        position={flattedDelayedWithdraws[page].position}
        delayed={flattedDelayedWithdraws[page].delayed}
        type={type}
        setPage={setPage}
      />
      {flattedDelayedWithdraws.length > 1 && (
        <TablePagination
          count={flattedDelayedWithdraws.length}
          rowsPerPage={1}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
        />
      )}
    </StyledDelayedWithdrawItemContainer>
  );
};

interface DelayedWithdrawContainerProps {
  strategy?: DisplayStrategy;
}

const DelayedWithdrawContainer = ({ strategy }: DelayedWithdrawContainerProps) => {
  const { userStrategies } = useEarnPositions();
  const delayedWithdraws = React.useMemo(
    () => getDelayedWithdrawals({ userStrategies, strategyGuardianId: strategy?.id }),
    [userStrategies, strategy?.id]
  );

  if (!strategy || !delayedWithdraws.length) {
    return null;
  }

  const pendingDelayedWithdraws = delayedWithdraws.filter((withdraw) => withdraw.totalPendingUsd > 0);
  const completedDelayedWithdraws = delayedWithdraws.filter((withdraw) => withdraw.totalReadyUsd > 0);

  return (
    <ContainerBox gap={6} flexDirection="column" justifyContent="stretch">
      <ContainerBox gap={3} flexDirection="column">
        {completedDelayedWithdraws.length > 0 && (
          <DelayedWithdrawItemContainer positions={completedDelayedWithdraws} type={DelayedWithdrawalStatus.READY} />
        )}
        {pendingDelayedWithdraws.length > 0 && (
          <DelayedWithdrawItemContainer positions={pendingDelayedWithdraws} type={DelayedWithdrawalStatus.PENDING} />
        )}
      </ContainerBox>
      <DividerBorder1 />
    </ContainerBox>
  );
};

export default DelayedWithdrawContainer;
