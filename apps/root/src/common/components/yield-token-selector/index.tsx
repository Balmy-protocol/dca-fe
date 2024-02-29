import React from 'react';
import styled from 'styled-components';
import isUndefined from 'lodash/isUndefined';
import { Token, YieldOption, YieldOptions } from '@types';
import { FormattedMessage } from 'react-intl';
import TokenIcon from '@common/components/token-icon';
import { Typography, Popper, ClickAwayListener, ArrowDropDownIcon, CancelIcon } from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';

const StyledYieldTokenSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: 4px;
  align-items: center;
  padding: 14px 14px;
  gap: 12px;
`;

const IconContainer = styled.div`
  display: flex;
  width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
`;

const StyledYieldPlatformSelector = styled.div<{ inModal: boolean }>`
  display: flex;
  ${({ inModal }) => (!inModal ? 'flex: 1;align-self: stretch;' : '')}
  border-radius: 24px;
  padding: 4px 8px;
  cursor: pointer;
`;

const StyledYieldPlatformDescription = styled(Typography)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
`;

const StyledPopperContainer = styled.div`
  padding: 10px 8px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 256px;
`;

const StyledYieldOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 30px;
  padding: 3px 8px;
  cursor: pointer;
`;

const StyledYieldOptionApy = styled.div``;

const StyledYieldOptionDescription = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

interface YieldTokenSelectorProps {
  token: Token | null;
  isLoading: boolean;
  yieldSelected: YieldOption | null | undefined;
  yieldOptions: YieldOptions;
  setYieldOption: (newYield: null | YieldOption) => void;
  inModal?: boolean;
}

const YieldTokenSelector = ({
  token,
  yieldSelected,
  yieldOptions,
  setYieldOption,
  isLoading,
  inModal,
}: YieldTokenSelectorProps) => {
  const [showPopper, setShowPopper] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const availableYieldOptions = token
    ? yieldOptions.filter((yieldOption) => yieldOption.enabledTokens.includes(token.address))
    : [];

  React.useEffect(() => {
    if (!isLoading && yieldOptions.length && !availableYieldOptions.length) {
      setYieldOption(null);
    }
  }, [isLoading, availableYieldOptions, yieldOptions]);

  if (!token) {
    return null;
  }

  const handlePopperEl = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (!showPopper) {
      setTimeout(() => setShowPopper(true), 200);
    } else {
      setShowPopper(false);
    }
  };

  const handleClickAway = () => {
    setShowPopper(false);
  };

  const sx = inModal ? { zIndex: 1301 } : {};
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <StyledYieldTokenSelectorContainer>
        <TokenIcon token={token} />
        <Typography variant="body">{token.symbol}</Typography>
        {!isLoading && !availableYieldOptions.length && (
          <Typography variant="bodySmall">
            <FormattedMessage
              description="noYieldAvailable"
              defaultMessage="We currently don't support any platform to generate yield with this token"
            />
          </Typography>
        )}
        {isLoading ||
          (!!availableYieldOptions.length && (
            <StyledYieldPlatformSelector onClick={handlePopperEl} inModal>
              <StyledYieldPlatformDescription variant="bodySmall">
                {isUndefined(yieldSelected) && (
                  <FormattedMessage description="selectYieldPlatform" defaultMessage="Select platform" />
                )}
                {yieldSelected && (
                  <FormattedMessage
                    description="selectedYieldPlatform"
                    defaultMessage="{platform} (APY {apy}%)"
                    values={{ platform: yieldSelected.name, apy: parseFloat(yieldSelected.apy.toFixed(2)).toString() }}
                  />
                )}
                {yieldSelected === null && (
                  <FormattedMessage description="noSelectedYieldPlatform" defaultMessage="No yield" />
                )}
                <ArrowDropDownIcon fontSize="inherit" />
                <Popper
                  id={`yield-${token.address}-popper`}
                  open={showPopper}
                  anchorEl={anchorEl}
                  placement="bottom-start"
                  sx={sx}
                >
                  <StyledPopperContainer>
                    {isLoading && <CenteredLoadingIndicator />}
                    {!isLoading && (
                      <>
                        <StyledYieldOption onClick={() => setYieldOption(null)}>
                          <StyledYieldOptionDescription>
                            <IconContainer>
                              <CancelIcon fontSize="small" color="error" />
                            </IconContainer>
                            <Typography variant="bodySmall">
                              <FormattedMessage description="noYieldOption" defaultMessage="No yield" />
                            </Typography>
                          </StyledYieldOptionDescription>
                          <StyledYieldOptionApy>-</StyledYieldOptionApy>
                        </StyledYieldOption>
                        {availableYieldOptions.map((yieldOption, index) => (
                          <StyledYieldOption key={index} onClick={() => setYieldOption(yieldOption)}>
                            <StyledYieldOptionDescription>
                              <IconContainer>
                                <TokenIcon size={4} token={yieldOption.token} />
                              </IconContainer>
                              <Typography variant="bodySmall">{yieldOption.name}</Typography>
                            </StyledYieldOptionDescription>
                            <StyledYieldOptionApy>{parseFloat(yieldOption.apy.toFixed(2))}%</StyledYieldOptionApy>
                          </StyledYieldOption>
                        ))}
                      </>
                    )}
                  </StyledPopperContainer>
                </Popper>
              </StyledYieldPlatformDescription>
            </StyledYieldPlatformSelector>
          ))}
      </StyledYieldTokenSelectorContainer>
    </ClickAwayListener>
  );
};
export default YieldTokenSelector;
