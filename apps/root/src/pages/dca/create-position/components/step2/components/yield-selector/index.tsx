import styled from 'styled-components';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Typography, Switch, Collapse } from 'ui-library';
import { useCreatePositionState } from '@state/create-position/hooks';
import { useAppDispatch } from '@state/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import { setFromYield, setToYield, setYieldEnabled } from '@state/create-position/actions';
import { YieldOption, YieldOptions } from '@types';
import YieldTokenSelector from '@common/components/yield-token-selector';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { DEFAULT_MINIMUM_USD_RATE_FOR_YIELD, MINIMUM_USD_RATE_FOR_YIELD, STRING_SWAP_INTERVALS } from '@constants';
import { formatCurrencyAmount, usdPriceToToken } from '@common/utils/currency';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { BigNumber } from 'ethers';

const StyledYieldTitleContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
`;

const StyledYieldContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

const StyledYieldHelpContainer = styled(Typography)`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

const StyledYieldHelpDescriptionContainer = styled.div`
  display: flex;
  padding: 10px;
  background-color: #212121;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
`;

const StyledYieldTokensContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

type Props = {
  yieldEnabled: boolean;
  fromCanHaveYield: boolean;
  toCanHaveYield: boolean;
  isLoadingYieldOptions: boolean;
  yieldOptions: YieldOptions;
  rateUsdPrice: number;
  usdPrice?: BigNumber;
};

const YieldSelector = ({
  usdPrice,
  yieldEnabled,
  fromCanHaveYield,
  toCanHaveYield,
  yieldOptions,
  isLoadingYieldOptions,
  rateUsdPrice,
}: Props) => {
  const { from, to, fromYield, toYield, frequencyType } = useCreatePositionState();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const selectedNetwork = useSelectedNetwork();
  const intl = useIntl();
  const [isHelpExpanded, setHelpExpanded] = React.useState(false);
  const minimumTokensNeeded = usdPriceToToken(
    from,
    MINIMUM_USD_RATE_FOR_YIELD[selectedNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD,
    usdPrice
  );

  const onSetYieldEnabled = (newYieldEnabled: boolean) => {
    dispatch(setYieldEnabled(newYieldEnabled));
    trackEvent('DCA - Set yield enabled', {});
  };

  const onSetFromYield = (newYield?: YieldOption | null) => {
    dispatch(setFromYield(newYield));
    trackEvent('DCA - Set yield from', {});
  };
  const onSetToYield = (newYield?: YieldOption | null) => {
    dispatch(setToYield(newYield));
    trackEvent('DCA - Set yield to', {});
  };

  return (
    <StyledYieldContainer>
      <StyledYieldTitleContainer>
        <Typography variant="body1">
          <FormattedMessage description="yieldTitle" defaultMessage="Generate yield" />
        </Typography>
        <Switch
          checked={yieldEnabled}
          onChange={() => onSetYieldEnabled(!yieldEnabled)}
          name="yieldEnabled"
          color="primary"
        />
      </StyledYieldTitleContainer>
      {yieldEnabled && (
        <StyledYieldTokensContainer>
          <YieldTokenSelector
            token={from}
            yieldOptions={yieldOptions}
            isLoading={isLoadingYieldOptions}
            setYieldOption={onSetFromYield}
            yieldSelected={fromYield}
          />
          <YieldTokenSelector
            token={to}
            yieldOptions={yieldOptions}
            isLoading={isLoadingYieldOptions}
            setYieldOption={onSetToYield}
            yieldSelected={toYield}
          />
        </StyledYieldTokensContainer>
      )}
      {!yieldEnabled && !fromCanHaveYield && !toCanHaveYield && (
        <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
          <FormattedMessage
            description="disabledByNoOption"
            // eslint-disable-next-line no-template-curly-in-string
            defaultMessage="None of the tokens you have selected support yield platforms."
          />
        </Typography>
      )}
      {!yieldEnabled &&
        from &&
        fromCanHaveYield &&
        !!rateUsdPrice &&
        rateUsdPrice < (MINIMUM_USD_RATE_FOR_YIELD[selectedNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD) && (
          <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
            <FormattedMessage
              description="disabledByUsdValue"
              // eslint-disable-next-line no-template-curly-in-string
              defaultMessage="You have to invest at least a rate of ${minimum} USD ({minToken} {symbol}) per {frequency} to enable this option."
              values={{
                minimum: MINIMUM_USD_RATE_FOR_YIELD[selectedNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD,
                minToken: formatCurrencyAmount(minimumTokensNeeded, from, 3, 3),
                symbol: from.symbol,
                frequency: intl.formatMessage(
                  STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].singularSubject
                ),
              }}
            />
          </Typography>
        )}
      <StyledYieldHelpContainer variant="body1" onClick={() => setHelpExpanded(!isHelpExpanded)}>
        <HelpOutlineOutlinedIcon fontSize="inherit" color="primary" />
        <FormattedMessage description="howItWorks" defaultMessage="How it works / Risks" />
        {isHelpExpanded ? <ArrowDropUpIcon fontSize="inherit" /> : <ArrowDropDownIcon fontSize="inherit" />}
      </StyledYieldHelpContainer>
      <Collapse in={isHelpExpanded}>
        <StyledYieldHelpDescriptionContainer>
          <Typography variant="body2">
            <FormattedMessage
              description="howItWorksDescription"
              defaultMessage="Funds will be deposited into your selected platform to generate yield while they wait to be swapped or withdrawn. The safety of the funds will be up to the selected platform, so please do your own research to perform an educated risk/reward assessment."
            />
          </Typography>
        </StyledYieldHelpDescriptionContainer>
      </Collapse>
    </StyledYieldContainer>
  );
};

export default YieldSelector;
