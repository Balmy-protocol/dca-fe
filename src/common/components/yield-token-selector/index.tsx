import React from 'react';
import styled from 'styled-components';
import isUndefined from 'lodash/isUndefined';
import { Token, YieldOption, YieldOptions } from 'types';
import { FormattedMessage } from 'react-intl';
import TokenIcon from 'common/components/token-icon';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CancelIcon from '@mui/icons-material/Cancel';
import Popper from '@mui/material/Popper';
import CenteredLoadingIndicator from 'common/components/centered-loading-indicator';
import ClickAwayListener from '@mui/material/ClickAwayListener';

const StyledYieldTokenSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: 4px;
  background-color: #333333;
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
  background: rgba(216, 216, 216, 0.1);
  border-radius: 24px;
  border: 1px solid #ffffff1a;
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
  background: #333333;
  border: 2px solid #a5aab5;
  background-color: #1b1b1c;
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
  color: #ffffff80;

  &:hover {
    background-color: #333333;
    color: #ffffff;
  }
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

  if (!token) {
    return null;
  }

  const availableYieldOptions = yieldOptions.filter((yieldOption) =>
    yieldOption.enabledTokens.includes(token?.address)
  );

  React.useEffect(() => {
    if (!isLoading && yieldOptions.length && !availableYieldOptions.length) {
      setYieldOption(null);
    }
  }, [isLoading, availableYieldOptions, yieldOptions]);

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
        <Typography variant="body1">{token.symbol}</Typography>
        {!isLoading && !availableYieldOptions.length && (
          <Typography variant="body2">
            <FormattedMessage
              description="noYieldAvailable"
              defaultMessage="We currently don't support any platform to generate yield with this token"
            />
          </Typography>
        )}
        {isLoading ||
          (!!availableYieldOptions.length && (
            <StyledYieldPlatformSelector onClick={handlePopperEl} inModal>
              <StyledYieldPlatformDescription variant="body2">
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
                            <Typography variant="body2">
                              <FormattedMessage description="noYieldOption" defaultMessage="No yield" />
                            </Typography>
                          </StyledYieldOptionDescription>
                          <StyledYieldOptionApy>-</StyledYieldOptionApy>
                        </StyledYieldOption>
                        {availableYieldOptions.map((yieldOption, index) => (
                          <StyledYieldOption key={index} onClick={() => setYieldOption(yieldOption)}>
                            <StyledYieldOptionDescription>
                              <IconContainer>
                                <TokenIcon size="16px" token={yieldOption.token} />
                              </IconContainer>
                              <Typography variant="body2">{yieldOption.name}</Typography>
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
