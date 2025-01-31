import React from 'react';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { DisplayStrategy } from 'common-types';
import {
  BackgroundPaper,
  Checkbox,
  ContainerBox,
  FormControlLabel,
  FormGroup,
  TokenAmounUsdInput,
  Typography,
} from 'ui-library';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { useAppDispatch } from '@state/hooks';
import { setWithdrawAmount, setWithdrawRewards } from '@state/earn-management/actions';
import { isSameToken } from '@common/utils/currency';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import useActiveWallet from '@hooks/useActiveWallet';
import useHasFetchedUserStrategies from '@hooks/earn/useHasFetchedUserStrategies';
import { formatUnits, maxUint256, parseUnits } from 'viem';

interface WithdrawAssetInputProps {
  strategy?: DisplayStrategy;
}

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme }) => `
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(5)};
    padding: ${theme.spacing(5)};
`}
`;

const WithdrawAssetInput = ({ strategy }: WithdrawAssetInputProps) => {
  const activeWallet = useActiveWallet();
  const { withdrawAmount, withdrawRewards } = useEarnManagementState();
  const dispatch = useAppDispatch();
  const hasFetchedUserStrategies = useHasFetchedUserStrategies();

  const strategyHasRewards = !!strategy?.rewards.tokens.length;

  const [fetchedTokenPrice] = useRawUsdPrice(strategy?.asset);

  const depositedBalances = React.useMemo(() => {
    const strategyBalances = strategy?.userPositions?.find(
      (position) => position.owner === activeWallet?.address
    )?.balances;

    const depositedAsset = strategyBalances?.find(
      (balance) => strategy && isSameToken(balance.token, strategy.asset)
    )?.amount;
    const hasRewardsBalance = strategyBalances?.some(
      (balance) => strategy && !isSameToken(balance.token, strategy.asset) && balance.amount.amount > 0n
    );

    return {
      asset: depositedAsset,
      hasRewardsBalance: !!hasRewardsBalance,
    };
  }, [strategy, activeWallet?.address]);

  const setWithdrawRewardsCheckbox = (newChecked: boolean) => {
    dispatch(setWithdrawRewards(newChecked));
  };

  const setTokenAmount = React.useCallback(
    (amount: string) => {
      const isWithdrawingMax =
        parseUnits(amount, strategy?.asset.decimals || 18) !== 0n &&
        parseUnits(amount, strategy?.asset.decimals || 18) === depositedBalances.asset?.amount;

      if (!withdrawRewards && isWithdrawingMax && depositedBalances.hasRewardsBalance) {
        // Withdraw rewards
        setWithdrawRewardsCheckbox(true);
      }

      dispatch(setWithdrawAmount(amount));
    },
    [depositedBalances, withdrawRewards, strategy]
  );

  const onMaxCallback = () => {
    setTokenAmount(maxUint256.toString());
  };

  React.useEffect(() => {
    if (hasFetchedUserStrategies && depositedBalances.hasRewardsBalance) {
      dispatch(setWithdrawRewards(true));
    }
  }, [hasFetchedUserStrategies, depositedBalances.hasRewardsBalance]);

  const baseDisableWithdraw = !strategy || !hasFetchedUserStrategies;

  const parsedWithdrawAmount = parseUnits(withdrawAmount || '0', strategy?.asset.decimals || 18);
  const isWithdrawingMax = parsedWithdrawAmount !== 0n && parsedWithdrawAmount === depositedBalances.asset?.amount;

  return (
    <StyledBackgroundPaper variant="outlined">
      <ContainerBox flexDirection="column" gap={1}>
        <Typography variant="bodySmallBold">
          <FormattedMessage
            description="earn.strategy-management.withdraw.withdraw-amount.title"
            defaultMessage="Withdraw Your Investments"
          />
        </Typography>
        <Typography variant="bodySmallRegular">
          <FormattedMessage
            description="earn.strategy-management.withdraw.withdraw-amount.description"
            defaultMessage="Keep in mind that withdrawing will affect your total expected returns."
          />
        </Typography>
      </ContainerBox>
      <ContainerBox flexDirection="column" gap={4}>
        <TokenAmounUsdInput
          value={
            withdrawAmount === maxUint256.toString()
              ? formatUnits(depositedBalances.asset?.amount || 0n, strategy?.asset.decimals || 18)
              : withdrawAmount
          }
          token={strategy?.asset}
          balance={depositedBalances.asset}
          tokenPrice={fetchedTokenPrice}
          disabled={baseDisableWithdraw || !depositedBalances.asset || depositedBalances.asset.amount === 0n}
          onChange={setTokenAmount}
          onMaxCallback={onMaxCallback}
        />
        {strategyHasRewards && (
          <FormGroup sx={{ alignItems: 'start' }}>
            <FormControlLabel
              disabled={baseDisableWithdraw || !depositedBalances.hasRewardsBalance || isWithdrawingMax}
              control={
                <Checkbox
                  onChange={(event) => setWithdrawRewardsCheckbox(event.target.checked)}
                  checked={withdrawRewards}
                />
              }
              label={
                <FormattedMessage
                  defaultMessage="Withdraw rewards"
                  description="earn.strategy-management.withdraw.withdraw-rewards"
                />
              }
            />
          </FormGroup>
        )}
      </ContainerBox>
    </StyledBackgroundPaper>
  );
};

export default WithdrawAssetInput;
