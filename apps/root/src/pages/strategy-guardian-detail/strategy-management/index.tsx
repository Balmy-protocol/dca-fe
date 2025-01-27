import useStrategyDetails from '@hooks/earn/useStrategyDetails';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BackgroundPaper, Badge, ContainerBox, Skeleton, Tab, Typography, UnderlinedTabs } from 'ui-library';
import DepositForm from './deposit/form';
import { useAppDispatch } from '@hooks/state';
import { fullyResetEarnForm, setAsset } from '@state/earn-management/actions';
import WithdrawForm from './withdraw/form';
import DelayWithdrawWarning from './components/delay-withdraw-warning';
import { WithdrawType } from 'common-types';
import { getDelayedWithdrawals } from '@common/utils/earn/parsing';
import LockedDeposit from './components/locked-deposit';
import useTierLevel from '@hooks/tiers/useTierLevel';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { emptyTokenWithAddress } from '@common/utils/currency';
import TokenIcon from '@common/components/token-icon';
import { PLATFORM_NAMES_FOR_TOKENS } from '@constants/yield';

const StyledBackgroundPaper = styled(BackgroundPaper).attrs({ variant: 'outlined', elevation: 0 })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(8)};
    display: flex;
    flex-direction: column;
    gap: ${spacing(6)};
    position: relative;
    overflow: hidden;
    transition: height 100ms ease;
  `}
`;

const StyledBadge = styled(Badge)`
  & .MuiBadge-badge {
    z-index: 0;
    right: ${({ theme: { spacing } }) => spacing(-3)};
    top: ${({ theme: { spacing } }) => spacing(-1)};
  },
`;

interface StrategyManagementProps {
  chainId?: number;
  strategyGuardianId?: string;
}

const StrategyManagement = ({ chainId, strategyGuardianId }: StrategyManagementProps) => {
  const [tab, setTab] = React.useState(0);
  const strategy = useStrategyDetails({ chainId, strategyGuardianId });
  const [height, setHeight] = React.useState<number | undefined>(undefined);
  const dispatch = useAppDispatch();
  const { tierLevel } = useTierLevel();

  const needsTier = strategy?.needsTier;
  const { asset } = useEarnManagementState();

  const delayedWithdrawalsCount = React.useMemo(
    () =>
      (strategy &&
        strategy.userPositions &&
        getDelayedWithdrawals({ userStrategies: strategy.userPositions }).length) ||
      0,
    [strategy?.userPositions]
  );

  React.useEffect(() => {
    if (strategy?.asset && asset && strategy.asset.address !== asset.address) {
      dispatch(fullyResetEarnForm());
    }
    if (strategy?.asset && !asset) dispatch(setAsset(strategy.asset));
  }, [strategy?.asset?.address, asset]);

  const hasAssetDelayedWithdrawal = strategy?.asset.withdrawTypes.includes(WithdrawType.DELAYED);

  const hasToWithdraw = strategy?.userPositions?.some((position) =>
    position.balances.some((balance) => balance.amount.amount > 0)
  );

  const isLocked = needsTier && needsTier > (tierLevel ?? 0);

  return (
    <StyledBackgroundPaper sx={{ height: height }}>
      {isLocked && !hasToWithdraw ? (
        <LockedDeposit strategy={strategy} needsTier={needsTier} />
      ) : (
        <>
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon token={emptyTokenWithAddress(PLATFORM_NAMES_FOR_TOKENS[strategy?.farm.protocol ?? ''])} />
            <Typography variant="h4Bold">
              {`${strategy?.farm.protocol} - ${strategy?.farm.name}` || <Skeleton width="6ch" variant="text" />}
            </Typography>
          </ContainerBox>
          <ContainerBox>
            <UnderlinedTabs value={tab} onChange={(_, val: number) => setTab(val)}>
              <Tab
                label={
                  <Typography variant="bodyRegular" color="inherit">
                    {<FormattedMessage description="earn.strategy-management.tabs.deposit" defaultMessage="Deposit" />}
                  </Typography>
                }
              />
              <Tab
                label={
                  <StyledBadge badgeContent={delayedWithdrawalsCount} color="primary">
                    <Typography variant="bodyRegular" color="inherit">
                      <FormattedMessage
                        description="earn.strategy-management.tabs.withdraw"
                        defaultMessage="Withdraw"
                      />
                    </Typography>
                  </StyledBadge>
                }
              />
            </UnderlinedTabs>
            {hasAssetDelayedWithdrawal && <DelayWithdrawWarning />}
          </ContainerBox>
          {tab === 0 && <DepositForm strategy={strategy} setHeight={setHeight} />}
          {tab === 1 && <WithdrawForm strategy={strategy} setHeight={setHeight} />}
        </>
      )}
    </StyledBackgroundPaper>
  );
};

export default StrategyManagement;
