import React from 'react';
import styled from 'styled-components';
import Slide from '@mui/material/Slide';
import Grid from '@mui/material/Grid';
import Button from '@common/components/button';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { useAppDispatch } from '@state/hooks';
import {
  setGasSpeed,
  setSlippage,
  restoreDefaults,
  setDisabledDexes,
  setConfetti,
  setPermit2,
} from '@state/aggregator-settings/actions';
import { GasKeys } from '@constants/aggregator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import useSdkDexes from '@hooks/useSdkSources';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Switch from '@mui/material/Switch';
import useTrackEvent from '@hooks/useTrackEvent';
import SlippageInput from './components/slippage-input';
import GasSelector from './components/gas-selector';
import ConfettiInput from './components/confetti-input';
import QuoteSorter from '../quote-sorter';

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
  overflow: auto;
`;

const StyledGrid = styled(Grid)<{ customSpacing?: number }>`
  margin-top: ${(props) => props.customSpacing || 0}px;
`;

const StyledSettingContainer = styled.div<{ columns?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  ${(props) => (props.columns ? 'justify-content: center;' : 'justify-content: space-between;')}
  ${(props) => (props.columns ? 'align-items: flex-start;' : 'align-items: center;')}
  ${(props) => (props.columns ? 'flex-direction: column;' : '')}
`;

interface SwapSettingsProps {
  shouldShow: boolean;
  onClose: () => void;
}

const SwapSettings = ({ shouldShow, onClose }: SwapSettingsProps) => {
  const { slippage, gasSpeed, disabledDexes, confettiParticleCount, isPermit2Enabled } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();
  const dexes = useSdkDexes();
  const [showDexes, setShowDexes] = React.useState(false);
  const trackEvent = useTrackEvent();

  const onSlippageChange = (newSlippage: string) => {
    dispatch(setSlippage(newSlippage));
    trackEvent('Aggregator - Set slippage', { slippage: newSlippage });
  };
  const onGasSpeedChange = (newGasSpeed: GasKeys) => {
    dispatch(setGasSpeed(newGasSpeed));
    trackEvent('Aggregator - Set gas speed', { gasSpeed: newGasSpeed });
  };
  const onConfettiChange = (newConfettiParticleCount: number) => {
    dispatch(setConfetti(newConfettiParticleCount));
  };
  const onPermit2Change = (newPermitConfig: boolean) => {
    dispatch(setPermit2(newPermitConfig));

    if (newPermitConfig) {
      trackEvent('Aggregator - Enable permit2');
    } else {
      trackEvent('Aggregator - Disable permit2');
    }
  };

  const onRestoreDefaults = () => {
    dispatch(restoreDefaults());
    trackEvent('Aggregator - Set default settings');
  };

  const handleToggleDex = (checked: boolean, id: string) => {
    const newDisabledDexes = [...disabledDexes];

    if (newDisabledDexes.includes(id)) {
      newDisabledDexes.splice(newDisabledDexes.indexOf(id), 1);
      trackEvent('Aggregator - Disable dex', { source: id });
    } else {
      newDisabledDexes.push(id);
      trackEvent('Aggregator - Enable dex', { source: id });
    }

    dispatch(setDisabledDexes(newDisabledDexes));
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
                <FormattedMessage
                  description="advancedAggregatorSettingsPermit2"
                  defaultMessage="Use Universal approval:"
                />
              </Typography>
              <Switch
                checked={isPermit2Enabled}
                onChange={() => onPermit2Change(!isPermit2Enabled)}
                name="enableDisablePermit2Approval"
                color="primary"
              />
            </StyledSettingContainer>
          </StyledGrid>
          <StyledGrid item xs={12} customSpacing={10} style={{ flexBasis: 'auto' }}>
            <StyledSettingContainer>
              <Typography variant="body1">
                <FormattedMessage description="advancedAggregatorSettingsSlippage" defaultMessage="Slippage:" />
              </Typography>
              <SlippageInput value={slippage} onChange={onSlippageChange} id="slippage-input" />
            </StyledSettingContainer>
          </StyledGrid>
          <StyledGrid item xs={12} customSpacing={10} style={{ flexBasis: 'auto' }}>
            <QuoteSorter isLoading={false} />
          </StyledGrid>
          <StyledGrid item xs={12} customSpacing={10} style={{ flexBasis: 'auto' }}>
            <StyledSettingContainer>
              <Typography variant="body1">
                <FormattedMessage description="advancedAggregatorSettingsGasSpeed" defaultMessage="Gas speed:" />
              </Typography>
              <GasSelector selected={gasSpeed} onChange={onGasSpeedChange} />
            </StyledSettingContainer>
          </StyledGrid>
          <StyledGrid item xs={12} customSpacing={10} style={{ flexBasis: 'auto' }}>
            <StyledSettingContainer>
              <Typography variant="body1">
                <FormattedMessage description="advancedAggregatorSettingsConfetti" defaultMessage="Confetti count:" />
              </Typography>
              <ConfettiInput
                value={confettiParticleCount}
                id="confetti-particle-count-input"
                onChange={onConfettiChange}
              />
            </StyledSettingContainer>
          </StyledGrid>
          <StyledGrid item xs={12} customSpacing={10} style={{ flexBasis: 'auto' }}>
            <StyledSettingContainer columns>
              <Typography
                variant="body1"
                onClick={() => setShowDexes(!showDexes)}
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <FormattedMessage
                  description="advancedAggregatorSettingsEnabledSources"
                  defaultMessage="Enabled sources ({enabled})"
                  values={{ enabled: Object.keys(dexes).length - disabledDexes.length }}
                />
                {showDexes ? <ExpandLessIcon fontSize="medium" /> : <ExpandMoreIcon fontSize="medium" />}
              </Typography>
              <Collapse in={showDexes}>
                {Object.keys(dexes).map((dexKey) => (
                  <FormGroup key={dexKey}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={(evt) => handleToggleDex(evt.target.checked, dexKey)}
                          checked={!disabledDexes.includes(dexKey)}
                        />
                      }
                      label={dexes[dexKey].name}
                    />
                  </FormGroup>
                ))}
              </Collapse>
            </StyledSettingContainer>
          </StyledGrid>
          <StyledGrid
            item
            xs={12}
            customSpacing={10}
            style={{ flex: '1', alignItems: 'flex-end', justifyContent: 'center', display: 'flex' }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={onRestoreDefaults}
              fullWidth
              sx={{ marginBottom: '10px' }}
            >
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
