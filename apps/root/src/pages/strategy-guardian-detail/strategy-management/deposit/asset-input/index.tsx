import React from 'react';
import { AmountsOfToken, DisplayStrategy } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { colors, ContainerBox, TokenAmounUsdInput, Typography } from 'ui-library';
import ExpectedReturnsChangesSummary, { EarnOperationVariant } from '../../components/expected-returns-changes-summary';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { useAppDispatch } from '@state/hooks';
import { setDepositAmount } from '@state/earn-management/actions';
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
  const { depositAmount } = useEarnManagementState();
  const dispatch = useAppDispatch();

  const [fetchedTokenPrice] = useRawUsdPrice(strategy?.asset);

  const setTokenAmount = (amount: string) => {
    dispatch(setDepositAmount(amount));
  };

  return (
    <ContainerBox flexDirection="column" gap={1}>
      <TokenAmounUsdInput
        value={depositAmount}
        token={strategy?.asset}
        balance={balance}
        tokenPrice={fetchedTokenPrice}
        disabled={!strategy}
        onChange={setTokenAmount}
      />
      <StyledExpectedReturn>
        <Typography variant="labelLarge" color={({ palette }) => colors[palette.mode].typography.typo1}>
          <FormattedMessage
            description="earn.strategy-management.deposit.expected-returns"
            defaultMessage="Expected Returns"
          />
        </Typography>
        <ExpectedReturnsChangesSummary
          strategy={strategy}
          assetAmount={depositAmount}
          operation={EarnOperationVariant.DEPOSIT}
        />
      </StyledExpectedReturn>
    </ContainerBox>
  );
};

export default EarnAssetInput;
