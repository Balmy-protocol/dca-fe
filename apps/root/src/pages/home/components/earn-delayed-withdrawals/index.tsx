import React from 'react';
import Address from '@common/components/address';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatUsdAmount } from '@common/utils/currency';
import { getDelayedWithdrawals } from '@common/utils/earn/parsing';
import { DelayedWithdrawalPositions, DelayedWithdrawalStatus, EarnPosition } from 'common-types';
import {
  AnimatedChevronRightIcon,
  colors,
  ContainerBox,
  DividerBorder1,
  Grid,
  HiddenNumber,
  InfoCircleIcon,
  Skeleton,
  TickCircleIcon,
  TimerIcon,
  Tooltip,
  Typography,
} from 'ui-library';
import usePushToHistory from '@hooks/usePushToHistory';
import styled from 'styled-components';
import { useShowBalances } from '@state/config/hooks';

const StyledItemContainer = styled(ContainerBox).attrs({
  justifyContent: 'space-between',
  alignItems: 'center',
})`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(3)} ${spacing(2)};
    background: ${colors[palette.mode].background.secondary};
    border-radius: ${spacing(2)};
  `}
`;

const pendingSkeletonArray = Array.from(Array(4).keys());
const readySkeletonArray = Array.from(Array(2).keys());

const DelayedWithdrawalItemSkeleton = () => (
  <StyledItemContainer>
    <ContainerBox gap={2} alignItems="center" fullWidth>
      <Skeleton variant="circular" width={20} height={20} />
      <ContainerBox flexDirection="column" gap={0.5}>
        <Typography variant="bodySmallRegular">
          <Skeleton variant="text" width="10ch" height={20} />
        </Typography>
        <Typography variant="bodyExtraSmall">
          <Skeleton variant="text" width="10ch" height={20} />
        </Typography>
      </ContainerBox>
    </ContainerBox>
    <AnimatedChevronRightIcon sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
  </StyledItemContainer>
);

const DelayedWithdrawalItem = ({
  position,
  type,
}: {
  position: DelayedWithdrawalPositions;
  type: DelayedWithdrawalStatus;
}) => {
  const intl = useIntl();
  const [isHovered, setIsHovered] = React.useState(false);
  const pushToHistory = usePushToHistory();
  const showBalances = useShowBalances();

  return (
    <StyledItemContainer
      style={{ cursor: 'pointer' }}
      onClick={() => pushToHistory(`/earn/vaults/${position.strategy.network.chainId}/${position.strategy.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ContainerBox gap={2} alignItems="center" fullWidth>
        {type === DelayedWithdrawalStatus.PENDING ? (
          <TimerIcon sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
        ) : (
          <TickCircleIcon sx={({ palette }) => ({ color: colors[palette.mode].semantic.success.darker })} />
        )}
        <ContainerBox flexDirection="column" gap={0.5}>
          <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
            {position.strategy.farm.name}
          </Typography>
          <Typography variant="bodyExtraSmall">
            <Address address={position.owner} trimAddress />
            {showBalances ? (
              <>
                {' · $'}
                {formatUsdAmount({
                  amount: type === DelayedWithdrawalStatus.PENDING ? position.totalPendingUsd : position.totalReadyUsd,
                  intl,
                })}
              </>
            ) : (
              <HiddenNumber size="small" />
            )}
          </Typography>
        </ContainerBox>
      </ContainerBox>
      <AnimatedChevronRightIcon
        $hovered={isHovered}
        sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })}
      />
    </StyledItemContainer>
  );
};

const DelayedWithdrawalsItems = ({
  userPositions,
  type,
  title,
  tooltipTitle,
  isLoading,
}: {
  userPositions: EarnPosition[];
  type: DelayedWithdrawalStatus;
  title: React.ReactNode;
  tooltipTitle: React.ReactNode;
  isLoading: boolean;
}) => {
  const filteredDelayedWithdrawaPositions = React.useMemo(
    () =>
      getDelayedWithdrawals({
        userStrategies: userPositions,
        withdrawStatus: type,
      }),
    [userPositions, type]
  );

  if (filteredDelayedWithdrawaPositions.length === 0 && !isLoading) return null;

  const skeletonArray = type === DelayedWithdrawalStatus.PENDING ? pendingSkeletonArray : readySkeletonArray;
  return (
    <Grid item xs={12} lg={6}>
      <ContainerBox flexDirection="column" gap={3}>
        <ContainerBox gap={1} alignItems="center">
          <Typography variant="bodyBold" color={({ palette }) => colors[palette.mode].typography.typo1}>
            {title}
          </Typography>
          <Tooltip title={tooltipTitle}>
            <ContainerBox>
              <InfoCircleIcon
                fontSize="small"
                sx={({ palette }) => ({ color: colors[palette.mode].typography.typo4 })}
              />
            </ContainerBox>
          </Tooltip>
        </ContainerBox>
        <Grid container rowSpacing={1}>
          {isLoading
            ? skeletonArray.map((key) => (
                <Grid item xs={12} key={key}>
                  <DelayedWithdrawalItemSkeleton />
                </Grid>
              ))
            : filteredDelayedWithdrawaPositions.map((position) => (
                <Grid item xs={12} key={position.id}>
                  <DelayedWithdrawalItem position={position} type={type} />
                </Grid>
              ))}
        </Grid>
      </ContainerBox>
    </Grid>
  );
};

const DelayedWithdrawalsContainer = ({
  filteredPositions,
  isLoading,
}: {
  filteredPositions: EarnPosition[];
  isLoading: boolean;
}) => {
  const hasDelayedWithdraws = React.useMemo(
    () => getDelayedWithdrawals({ userStrategies: filteredPositions }).length > 0,
    [filteredPositions]
  );

  if (!hasDelayedWithdraws) return null;

  return (
    <>
      <DividerBorder1 />
      <Grid container spacing={8}>
        <DelayedWithdrawalsItems
          userPositions={filteredPositions}
          type={DelayedWithdrawalStatus.PENDING}
          title={
            <FormattedMessage
              defaultMessage="Pending for withdraw"
              description="home.earn.dashboard.title.pending-for-withdraw"
            />
          }
          tooltipTitle={
            <FormattedMessage
              defaultMessage="This withdrawals are being processed and will be available for withdraw soon"
              description="home.earn.dashboard.title.pending-for-withdraw.tooltip"
            />
          }
          isLoading={isLoading}
        />
        <DelayedWithdrawalsItems
          userPositions={filteredPositions}
          type={DelayedWithdrawalStatus.READY}
          title={
            <FormattedMessage
              defaultMessage="Ready for withdraw"
              description="home.earn.dashboard.title.ready-for-withdraw"
            />
          }
          tooltipTitle={
            <FormattedMessage
              defaultMessage="This withdrawals are ready to be claimed"
              description="home.earn.dashboard.title.ready-for-withdraw.tooltip"
            />
          }
          isLoading={isLoading}
        />
      </Grid>
    </>
  );
};

export default DelayedWithdrawalsContainer;
