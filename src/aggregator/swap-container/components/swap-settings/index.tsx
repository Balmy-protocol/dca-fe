import React from 'react';
import styled from 'styled-components';
import Slide from '@mui/material/Slide';
import Grid from '@mui/material/Grid';
import Button from 'common/button';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useAggregatorSettingsState } from 'state/aggregator-settings/hooks';
import { useAppDispatch } from 'state/hooks';
import { setGasSpeed, setSlippage, restoreDefaults } from 'state/aggregator-settings/actions';
import SlippageInput from 'common/slippage-input';
import GasSelector from 'common/gas-selector';
import { GasKeys } from 'config/constants/aggregator';

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: #1b1b1c;
  padding: 24px;
  display: flex;
`;

const StyledGrid = styled(Grid)<{ customSpacing?: number }>`
  margin-top: ${(props) => props.customSpacing || 0}px;
`;

const StyledSettingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

interface SwapSettingsProps {
  shouldShow: boolean;
  onClose: () => void;
}

const SwapSettings = ({ shouldShow, onClose }: SwapSettingsProps) => {
  const { slippage, gasSpeed } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();

  const onSlippageChange = (newSlippage: string) => {
    dispatch(setSlippage(newSlippage));
  };
  const onGasSpeedChange = (newGasSpeed: GasKeys) => {
    dispatch(setGasSpeed(newGasSpeed));
  };

  const onRestoreDefaults = () => {
    dispatch(restoreDefaults());
  };

  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
        <IconButton
          aria-label="close"
          size="small"
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '32px' }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
        <Grid container spacing={1} direction="column" style={{ flexWrap: 'nowrap' }}>
          <Grid item xs={12} style={{ flexBasis: 'auto' }}>
            <Typography variant="body1" fontWeight={600} fontSize="1.2rem">
              <FormattedMessage description="advancedAggregatorSettings" defaultMessage="Advanced settings" />
            </Typography>
          </Grid>
          <StyledGrid item xs={12} customSpacing={10} style={{ flexBasis: 'auto' }}>
            <StyledSettingContainer>
              <Typography variant="body1">
                <FormattedMessage description="advancedAggregatorSettingsSlippage" defaultMessage="Slippage:" />
              </Typography>
              <SlippageInput value={slippage} onChange={onSlippageChange} id="slippage-input" />
            </StyledSettingContainer>
          </StyledGrid>
          <StyledGrid item xs={12} customSpacing={10} style={{ flexBasis: 'auto' }}>
            <StyledSettingContainer>
              <Typography variant="body1">
                <FormattedMessage description="advancedAggregatorSettingsGasSpeed" defaultMessage="Gas speed:" />
              </Typography>
              <GasSelector selected={gasSpeed} onChange={onGasSpeedChange} />
            </StyledSettingContainer>
          </StyledGrid>
          <StyledGrid
            item
            xs={12}
            customSpacing={10}
            style={{ flex: '1', alignItems: 'flex-end', justifyContent: 'center', display: 'flex' }}
          >
            <Button variant="contained" color="secondary" onClick={onRestoreDefaults} fullWidth>
              <FormattedMessage
                description="advancedAggregatorSettingsRestoreDefaults"
                defaultMessage="Restore defaults"
              />
            </Button>
          </StyledGrid>
        </Grid>
      </StyledOverlay>
    </Slide>
  );
};

export default SwapSettings;
