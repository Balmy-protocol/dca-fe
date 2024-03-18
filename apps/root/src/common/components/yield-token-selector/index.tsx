import React from 'react';
import styled from 'styled-components';
import { PositionYieldOption, Token, YieldOption, YieldOptions } from '@types';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import TokenIcon from '@common/components/token-icon';
import {
  Typography,
  OptionsMenuOption,
  OptionsMenuOptionType,
  ContainerBox,
  TokenPickerButton,
  CloseCircleIcon,
  OptionsMenuItems,
} from 'ui-library';
import { StyledDcaInputLabel } from '@pages/dca/create-position/components/step1';
import { toToken } from '@common/utils/currency';

const StyledYieldOptionDescription = styled(ContainerBox).attrs({ alignItems: 'center', gap: 2 })``;

interface YieldTokenSelectorProps {
  token: Token | null;
  isLoading: boolean;
  yieldSelected: PositionYieldOption | null;
  yieldOptions: YieldOptions;
  setYieldOption: (newYield: null | YieldOption) => void;
  hasMinimumForYield: boolean;
}

const YieldTokenSelector = ({
  token,
  yieldSelected,
  yieldOptions,
  setYieldOption,
  isLoading,
  hasMinimumForYield,
}: YieldTokenSelectorProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const intl = useIntl();

  const availableYieldOptions = token
    ? yieldOptions.filter((yieldOption) => yieldOption.enabledTokens.includes(token.address))
    : [];

  React.useEffect(() => {
    if ((!isLoading && yieldOptions.length && !availableYieldOptions.length) || !hasMinimumForYield) {
      setYieldOption(null);
    }
  }, [isLoading, availableYieldOptions, yieldOptions, hasMinimumForYield]);

  const yieldMenuOptions: OptionsMenuOption[] = React.useMemo(
    () => [
      {
        type: OptionsMenuOptionType.option,
        label: (
          <StyledYieldOptionDescription>
            <CloseCircleIcon color="info" />
            <StyledDcaInputLabel>
              <FormattedMessage description="noYieldOption" defaultMessage="No yield" />
            </StyledDcaInputLabel>
          </StyledYieldOptionDescription>
        ),
        onClick: () => setYieldOption(null),
      },
      { type: OptionsMenuOptionType.divider },
      ...availableYieldOptions.map((yieldOption) => ({
        type: OptionsMenuOptionType.option,
        label: (
          <ContainerBox gap={10} justifyContent="space-between" alignItems="center" fullWidth>
            <StyledYieldOptionDescription>
              <TokenIcon size={6} token={yieldOption.token} />
              <StyledDcaInputLabel>{yieldOption.name}</StyledDcaInputLabel>
            </StyledYieldOptionDescription>
            <StyledDcaInputLabel fontWeight={700}>APY {parseFloat(yieldOption.apy.toFixed(2))}%</StyledDcaInputLabel>
          </ContainerBox>
        ),
        disabled: !hasMinimumForYield,
        onClick: () => setYieldOption(yieldOption),
      })),
    ],
    [availableYieldOptions]
  );

  const selectedOptionLabel = yieldSelected
    ? {
        ...toToken({
          symbol: intl.formatMessage(
            defineMessage({ description: 'selectedYieldPlatform', defaultMessage: '{platform}' }),
            { platform: yieldSelected.name }
          ),
        }),
        icon: <TokenIcon size={6} token={yieldSelected.token} />,
      }
    : {
        ...toToken({
          symbol: intl.formatMessage(
            defineMessage({ description: 'noSelectedYieldPlatform', defaultMessage: 'No yield' })
          ),
        }),
        icon: <CloseCircleIcon color={!availableYieldOptions.length ? 'disabled' : 'info'} />,
      };

  if (!token) {
    return null;
  }

  return (
    <ContainerBox flexDirection="column" gap={2} alignItems="start">
      <ContainerBox gap={2}>
        <TokenIcon token={token} size={6} />
        <Typography variant="body" fontWeight={700}>
          {token.symbol}
        </Typography>
      </ContainerBox>
      <TokenPickerButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        token={selectedOptionLabel}
        showAction
        isLoading={isLoading}
        tokenSize={6}
        disabled={!availableYieldOptions.length}
      />
      <OptionsMenuItems options={yieldMenuOptions} anchorEl={anchorEl} handleClose={() => setAnchorEl(null)} />
    </ContainerBox>
  );
};
export default YieldTokenSelector;
