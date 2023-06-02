import styled from 'styled-components';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import { useCreatePositionState } from '@state/create-position/hooks';
import { STRING_SWAP_INTERVALS } from '@constants';
import TokenInput from '@common/components/token-input';
import FrequencyInput from '@common/components/frequency-easy-input';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useConnextEstimation from '@hooks/useConnextEstimation';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';

const StyledSummaryContainer = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
`;

const StyledInputContainer = styled.div`
  margin: 6px 0px;
  display: inline-flex;
`;

type Props = {
  handleFromValueChange: (newFromValue: string) => void;
  handleRateValueChange: (newRateValue: string) => void;
  handleFrequencyChange: (newValue: string) => void;
  rateUsdPrice: number;
  yieldEnabled: boolean;
  fromCanHaveYield: boolean;
  fromValueUsdPrice: number;
  fundWithValueUsdPrice: number;
};

const Summary = ({
  handleFromValueChange,
  handleFrequencyChange,
  handleRateValueChange,
  rateUsdPrice,
  yieldEnabled,
  fromCanHaveYield,
  fromValueUsdPrice,
  fundWithValueUsdPrice,
}: Props) => {
  const { from, fromValue, rate, frequencyValue, fromYield, frequencyType, fundWith } = useCreatePositionState();
  const intl = useIntl();
  const selectedNetwork = useSelectedNetwork();
  const [connextEstimation, isLoadingEstimation] = useConnextEstimation(
    fundWith,
    parseUnits(fromValue || '0', (fundWith || from)?.decimals),
    selectedNetwork.chainId
  );

  const fromValueToShow =
    (connextEstimation && formatUnits(connextEstimation?.amountReceived, from?.decimals)) || fromValue || '0';
  const connextRate =
    connextEstimation &&
    connextEstimation.amountReceived.gt(BigNumber.from(0)) &&
    frequencyValue &&
    BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
    from &&
    formatUnits(connextEstimation.amountReceived.div(BigNumber.from(frequencyValue)), from.decimals);

  const rateToShow = connextRate || rate;

  return (
    <>
      {fundWith && (
        <StyledSummaryContainer>
          <Typography variant="body1" component="span">
            <FormattedMessage description="invest detail" defaultMessage="You'll use" />
          </Typography>
          <StyledInputContainer>
            <TokenInput
              id="from-minimal-value"
              value={fromValue || '0'}
              onChange={handleFromValueChange}
              withBalance={false}
              token={fundWith}
              showChain={fundWith.chainId !== from?.chainId}
              isMinimal
              maxWidth="210px"
              usdValue={fundWithValueUsdPrice.toFixed(2)}
            />
          </StyledInputContainer>
          {fundWith.chainId !== from?.chainId && (
            <Typography variant="body1" component="span">
              <FormattedMessage
                description="invest detail"
                defaultMessage="to create a position on {chain}"
                values={{ chain: selectedNetwork.name }}
              />
            </Typography>
          )}
        </StyledSummaryContainer>
      )}
      <StyledSummaryContainer>
        <Typography variant="body1" component="span">
          <FormattedMessage description="invest detail" defaultMessage="You'll invest" />
        </Typography>
        <StyledInputContainer>
          <TokenInput
            id="from-minimal-value"
            value={fromValueToShow}
            onChange={handleFromValueChange}
            withBalance={false}
            token={from}
            isMinimal
            maxWidth="210px"
            disabled={!!fundWith && fundWith.address !== from?.address}
            usdValue={fromValueUsdPrice.toFixed(2)}
            loading={isLoadingEstimation}
          />
        </StyledInputContainer>
      </StyledSummaryContainer>
      <StyledSummaryContainer>
        <Typography variant="body1" component="span">
          <FormattedMessage description="rate detail" defaultMessage="We'll swap" />
        </Typography>
        <StyledInputContainer>
          <TokenInput
            id="rate-value"
            value={rateToShow}
            onChange={handleRateValueChange}
            withBalance={false}
            token={from}
            disabled={!!fundWith && fundWith.address !== from?.address}
            isMinimal
            usdValue={rateUsdPrice.toFixed(2)}
            loading={isLoadingEstimation}
          />
        </StyledInputContainer>
        {yieldEnabled && fromCanHaveYield && fromYield !== null && (
          <Typography variant="body1" component="span">
            <FormattedMessage description="yield detail" defaultMessage="+ yield" />
          </Typography>
        )}
        <Typography variant="body1" component="span">
          <FormattedMessage
            description="rate detail"
            defaultMessage="{frequency} for you for"
            values={{
              frequency: intl.formatMessage(
                STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].every
              ),
            }}
          />
        </Typography>
        <StyledInputContainer>
          <FrequencyInput id="frequency-value" value={frequencyValue} onChange={handleFrequencyChange} isMinimal />
        </StyledInputContainer>
        {intl.formatMessage(
          STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].subject
        )}
      </StyledSummaryContainer>
    </>
  );
};

export default Summary;
