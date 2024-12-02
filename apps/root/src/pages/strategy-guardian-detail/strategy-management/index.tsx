import useStrategyDetails from '@hooks/earn/useStrategyDetails';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BackgroundPaper, Badge, ContainerBox, Skeleton, Tab, Typography, UnderlinedTabs } from 'ui-library';
import DepositForm from './deposit/form';
import { useAppDispatch } from '@hooks/state';
import { setAsset } from '@state/earn-management/actions';
import WithdrawForm from './withdraw/form';
import DelayWithdrawWarning from './components/delay-withdraw-warning';
import { WithdrawType } from 'common-types';
import { getDelayedWithdrawals } from '@common/utils/earn/parsing';

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
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const dispatch = useAppDispatch();

  const delayedWithdrawalsCount = React.useMemo(
    () =>
      (strategy &&
        strategy.userPositions &&
        getDelayedWithdrawals({ userStrategies: strategy.userPositions }).length) ||
      0,
    [strategy?.userPositions]
  );

  React.useEffect(() => {
    if (strategy?.asset) dispatch(setAsset(strategy.asset));
  }, [strategy?.asset]);

  const hasAssetDelayedWithdrawal = strategy?.asset.withdrawTypes.includes(WithdrawType.DELAYED);

  const formProps = React.useMemo(
    () => ({
      strategy,
      setHeight,
      shouldShowConfirmation,
      setShouldShowConfirmation,
      shouldShowSteps,
      setShouldShowSteps,
    }),
    [strategy, setHeight, shouldShowConfirmation, setShouldShowConfirmation, shouldShowSteps, setShouldShowSteps]
  );

  return (
    <StyledBackgroundPaper sx={{ height: height }}>
      {!shouldShowSteps && !shouldShowConfirmation && (
        <>
          <Typography variant="h4Bold">{strategy?.farm.name || <Skeleton width="6ch" variant="text" />}</Typography>
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
        </>
      )}
      {tab === 0 && <DepositForm {...formProps} />}
      {tab === 1 && <WithdrawForm {...formProps} />}
    </StyledBackgroundPaper>
  );
};

export default StrategyManagement;
