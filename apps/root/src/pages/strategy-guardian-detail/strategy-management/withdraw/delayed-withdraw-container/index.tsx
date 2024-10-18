import Address from '@common/components/address';
import TokenIcon from '@common/components/token-icon';
import { formatUsdAmount } from '@common/utils/currency';
import useDelayedWithdrawalPositions from '@hooks/earn/useDelayedWithdrawalPositions';
import { DelayedWithdrawalPositions, DelayedWithdrawalStatus, DisplayStrategy } from 'common-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  Button,
  colors,
  ContainerBox,
  DividerBorder1,
  TablePagination,
  TickCircleIcon,
  TimerIcon,
  Typography,
} from 'ui-library';

interface DelayedWithdrawItemProps {
  position: DelayedWithdrawalPositions;
  delayed: DelayedWithdrawalPositions['delayed'][number];
  type: DelayedWithdrawalStatus;
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

const DelayedWithdrawItem = ({ delayed, type, position }: DelayedWithdrawItemProps) => {
  const intl = useIntl();
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
                <ContainerBox gap={1}>
                  <Typography variant="bodyBold">
                    {`${
                      type === DelayedWithdrawalStatus.READY
                        ? delayed.ready.amountInUnits
                        : delayed.pending.amountInUnits
                    } ${delayed.token.symbol}`}
                  </Typography>
                  <Typography variant="bodyBold" color={({ palette: { mode } }) => colors[mode].typography.typo4}>
                    $(
                    {type === DelayedWithdrawalStatus.READY
                      ? formatUsdAmount({ amount: delayed.ready.amountInUSD, intl })
                      : formatUsdAmount({ amount: delayed.pending.amountInUSD, intl })}
                    )
                  </Typography>
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
              <Typography variant="bodyBold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
                <Address address={position.owner} trimAddress />
              </Typography>
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
      </ContainerBox>
      {type === DelayedWithdrawalStatus.READY && (
        <Button variant="outlined">
          <FormattedMessage
            description="earn.strategy-management.withdraw.delayed-withdraw.item.withdraw-now"
            defaultMessage="Withdraw now"
          />
        </Button>
      )}
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
    border: 1.5px solid ${$type === DelayedWithdrawalStatus.PENDING ? colors[mode].semantic.warning.darker : colors[mode].semantic.success.darker};
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
  const delayedWithdraws = useDelayedWithdrawalPositions({ strategyGuardianId: strategy?.id });

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
