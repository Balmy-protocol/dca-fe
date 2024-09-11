import useStrategyDetails from '@hooks/earn/useStrategyDetails';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BackgroundPaper, Skeleton, Tab, Typography, UnderlinedTabs } from 'ui-library';
import DepositForm from './deposit/form';
import { useAppDispatch } from '@hooks/state';
import { setAsset } from '@state/earn-management/actions';
import WithdrawForm from './withdraw/form';

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

interface StrategyManagementProps {
  chainId?: number;
  strategyGuardianId?: string;
}

const StrategyManagement = ({ chainId, strategyGuardianId }: StrategyManagementProps) => {
  const [tab, setTab] = React.useState(0);
  const strategy = useStrategyDetails({ chainId, strategyGuardianId });
  const [height, setHeight] = React.useState<number | undefined>(undefined);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (strategy?.asset) dispatch(setAsset(strategy.asset));
  }, [strategy?.asset]);

  return (
    <StyledBackgroundPaper sx={{ height: height }}>
      <Typography variant="h5Bold">{strategy?.farm.name || <Skeleton width="6ch" variant="text" />}</Typography>
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
            <Typography variant="bodyRegular" color="inherit">
              <FormattedMessage description="earn.strategy-management.tabs.withdraw" defaultMessage="Withdraw" />
            </Typography>
          }
        />
      </UnderlinedTabs>
      {tab === 0 && <DepositForm strategy={strategy} setHeight={setHeight} />}
      {tab === 1 && <WithdrawForm strategy={strategy} setHeight={setHeight} />}
    </StyledBackgroundPaper>
  );
};

export default StrategyManagement;
