import React from 'react';
import styled from 'styled-components';
import {
  Typography,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Slide,
  CloseIcon,
  ExpandMoreIcon,
  ExpandLessIcon,
  Button,
  colors,
  ContainerBox,
  Divider,
  Accordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummaryProps,
  KeyboardArrowRightIcon,
  Popover,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { useAppDispatch } from '@state/hooks';
import {
  setGasSpeed,
  setSlippage,
  restoreDefaults,
  setDisabledDexes,
  setPermit2,
  setSourceTimeout,
} from '@state/aggregator-settings/actions';
import { GasKeys, TIMEOUT_LABELS_BY_KEY, TimeoutKey } from '@constants/aggregator';
import useSdkDexes from '@hooks/useSdkSources';
import useTrackEvent from '@hooks/useTrackEvent';
import SlippageInput from './components/slippage-input';
import GasSelector from './components/gas-selector';
import QuoteSorter from '../quote-sorter';
import TimeoutSelector from './components/timeout-selector';
import { capitalize } from 'lodash';
import { SetStateCallback } from 'common-types';

const StyledOverlay = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 8 })`
  position: relative;
`;

const StyledCloseIconButton = styled(IconButton)`
  ${({ theme: { palette, spacing } }) => `
  position: absolute;
  top: -${spacing(10)};
  right: -${spacing(8)};
  padding: ${spacing(2.5)};
  color: ${colors[palette.mode].typography.typo2};
`}
`;

const StyledAccordion = styled(Accordion).attrs({ defaultExpanded: true })`
  ${({ theme: { spacing } }) => `
  padding: ${spacing(5)} ${spacing(3)};
  `}
`;

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<KeyboardArrowRightIcon fontSize="small" />} {...props} />
))(({}) => ({
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  marginTop: 0,
  borderTop: 'none',
}));

interface SwapSettingsProps {
  shouldShow: boolean;
  onClose: () => void;
  setShouldShowFirstStep: SetStateCallback<boolean>;
}

const SwapSettings = ({ shouldShow, onClose, setShouldShowFirstStep }: SwapSettingsProps) => {
  const { slippage, gasSpeed, disabledDexes, isPermit2Enabled, sourceTimeout } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();
  const dexes = useSdkDexes();
  const [showDexes, setShowDexes] = React.useState(false);
  const trackEvent = useTrackEvent();
  const intl = useIntl();

  const onSlippageChange = (newSlippage: string) => {
    dispatch(setSlippage(newSlippage));
    trackEvent('Aggregator - Set slippage', { slippage: newSlippage });
  };
  const onGasSpeedChange = (newGasSpeed: GasKeys) => {
    dispatch(setGasSpeed(newGasSpeed));
    trackEvent('Aggregator - Set gas speed', { gasSpeed: newGasSpeed });
  };
  const onSourceTimeoutChange = (newSourceTimeout: TimeoutKey) => {
    dispatch(setSourceTimeout(newSourceTimeout));
    trackEvent('Aggregator - Set source timeout speed', { sourceTimeout: newSourceTimeout });
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
    <Slide
      direction="up"
      in={shouldShow}
      mountOnEnter
      unmountOnExit
      onExited={() => setShouldShowFirstStep(true)}
      onEnter={() => setShouldShowFirstStep(false)}
    >
      <StyledOverlay>
        <StyledCloseIconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </StyledCloseIconButton>
        <Typography variant="h5" fontWeight={700}>
          <FormattedMessage description="advancedAggregatorSettings" defaultMessage="Advanced settings" />
        </Typography>
        <ContainerBox flexDirection="column" gap={8} fullWidth alignItems="center">
          <div>
            {/* Slippage */}
            <StyledAccordion>
              <AccordionSummary>
                <ContainerBox alignItems="center" justifyContent="space-between" fullWidth>
                  <Typography variant="body" fontWeight={600} lineHeight={1}>
                    <FormattedMessage description="advancedAggregatorSettingsSlippage" defaultMessage="Slippage" />
                  </Typography>
                  <Typography variant="bodySmall" fontWeight={700}>
                    {slippage}%
                  </Typography>
                </ContainerBox>
              </AccordionSummary>
              <AccordionDetails>
                <SlippageInput value={slippage} onChange={onSlippageChange} id="slippage-input" />
              </AccordionDetails>
            </StyledAccordion>
            {/* Gas Fee */}
            <StyledAccordion>
              <AccordionSummary>
                <ContainerBox alignItems="center" justifyContent="space-between" fullWidth>
                  <Typography variant="body" fontWeight={600} lineHeight={1}>
                    <FormattedMessage description="advancedAggregatorSettingsGasSpeed" defaultMessage="Gas speed" />
                  </Typography>
                  <Typography variant="bodySmall" fontWeight={700}>
                    {capitalize(gasSpeed)}
                  </Typography>
                </ContainerBox>
              </AccordionSummary>
              <AccordionDetails>
                <GasSelector selected={gasSpeed} onChange={onGasSpeedChange} />
              </AccordionDetails>
            </StyledAccordion>
            {/* Source Waiting Time */}
            <StyledAccordion>
              <AccordionSummary>
                <ContainerBox alignItems="center" justifyContent="space-between" fullWidth>
                  <Typography variant="body" fontWeight={600} lineHeight={1}>
                    <FormattedMessage
                      description="advancedAggregatorSettingsTimeout"
                      defaultMessage="Source waiting time"
                    />
                  </Typography>
                  <Typography variant="bodySmall" fontWeight={700}>
                    {intl.formatMessage(TIMEOUT_LABELS_BY_KEY[sourceTimeout])}
                  </Typography>
                </ContainerBox>
              </AccordionSummary>
              <AccordionDetails>
                <TimeoutSelector selected={sourceTimeout} onChange={onSourceTimeoutChange} />
              </AccordionDetails>
            </StyledAccordion>
            {/* Enabled Sources */}
            <ContainerBox alignItems="center" justifyContent="space-between" fullWidth>
              <Typography
                variant="body"
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
              <Popover open={showDexes}>
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
              </Popover>
            </ContainerBox>
            {/* Quote Sorter */}
            <QuoteSorter isLoading={false} />
            {/* Universal Approval */}
            <ContainerBox alignItems="center" justifyContent="space-between" fullWidth>
              <Typography variant="body" fontWeight={600} lineHeight={1}>
                <FormattedMessage
                  description="advancedAggregatorSettingsPermit2"
                  defaultMessage="Use Universal approval"
                />
              </Typography>
              <Switch
                checked={isPermit2Enabled}
                onChange={() => onPermit2Change(!isPermit2Enabled)}
                name="enableDisablePermit2Approval"
                color="primary"
              />
            </ContainerBox>
          </div>
          <Divider flexItem />
          <Button
            variant="contained"
            color="secondary"
            onClick={onRestoreDefaults}
            fullWidth
            sx={{ alignSelf: 'center' }}
          >
            <FormattedMessage
              description="advancedAggregatorSettingsRestoreDefaults"
              defaultMessage="Restore defaults"
            />
          </Button>
        </ContainerBox>
      </StyledOverlay>
    </Slide>
  );
};

export default SwapSettings;
