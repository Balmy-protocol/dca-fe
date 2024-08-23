import React from 'react';
import { StrategyReturnPeriods } from '@common/utils/earn/parsing';
import { AmountsOfToken, DisplayStrategy } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, TokenAmounUsdInput, Typography } from 'ui-library';
import ExpectedReturnsChangesSummary from '../../components/expected-returns-changes-summary';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { useAppDispatch } from '@state/hooks';
import { setAssetAmount } from '@state/earn-management/actions';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import styled from 'styled-components';

const StyledExpectedReturn = styled(ContainerBox).attrs(() => ({ gap: 3, flexDirection: 'column' }))`
  padding: ${({ theme: { spacing } }) => spacing(3)};
`;

interface EarnAssetInputProps {
  balance?: AmountsOfToken;
  strategy?: DisplayStrategy;
}

const EarnAssetInput = ({ strategy, balance }: EarnAssetInputProps) => {
  const { assetAmount } = useEarnManagementState();
  const dispatch = useAppDispatch();

  const [fetchedTokenPrice] = useRawUsdPrice(strategy?.asset);

  const setTokenAmount = (amount: string) => {
    dispatch(setAssetAmount(amount));
  };

  return (
    <ContainerBox flexDirection="column" gap={1}>
      <TokenAmounUsdInput
        value={assetAmount}
        token={strategy?.asset}
        balance={balance}
        tokenPrice={fetchedTokenPrice}
        disabled={!strategy}
        onChange={setTokenAmount}
      />
      <StyledExpectedReturn>
        <Typography variant="bodySmallSemibold">
          <FormattedMessage
            description="earn.strategy-management.deposit.expected-returns"
            defaultMessage="Expected returns"
          />
        </Typography>
        <ExpectedReturnsChangesSummary
          hidePeriods={[StrategyReturnPeriods.DAY]}
          strategy={strategy}
          assetAmount={assetAmount}
        />
      </StyledExpectedReturn>
    </ContainerBox>
  );
};

export default EarnAssetInput;