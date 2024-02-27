import React from 'react';
import styled from 'styled-components';
import {
  Typography,
  IconButton,
  Switch,
  Slide,
  CloseIcon,
  Button,
  colors,
  ContainerBox,
  Divider,
  Accordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummaryProps,
  KeyboardArrowRightIcon,
  OptionsButtons,
  OptionsMenu,
  OptionsMenuOption,
  OptionsMenuOptionType,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  HelpOutlineIcon,
  BackgroundPaper,
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
  setSorting,
} from '@state/aggregator-settings/actions';
import {
  GAS_KEYS,
  GasKeys,
  SWAP_ROUTES_SORT_OPTIONS,
  SwapSortOptions,
  TIMEOUT_KEYS,
  TIMEOUT_LABELS_BY_KEY,
  TimeoutKey,
} from '@constants/aggregator';
import useSdkDexes from '@hooks/useSdkSources';
import useTrackEvent from '@hooks/useTrackEvent';
import SlippageInput from './components/slippage-input';
import { capitalize } from 'lodash';
import { SetStateCallback } from 'common-types';

const StyledOverlay = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 8 })`
  position: relative;
  backdrop-filter: blur(${({ theme }) => theme.spacing(0.5)});
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

const StyledSettingTitle = styled(Typography).attrs({
  variant: 'body',
  fontWeight: 600,
  lineHeight: 1,
})``;

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

const StyledSettingContainer = styled(ContainerBox).attrs({
  alignItems: 'center',
  justifyContent: 'space-between',
  fullWidth: true,
})<{ $collapsed?: boolean }>`
  ${({ $collapsed, theme: { palette, spacing } }) => `
  padding-right: ${spacing(1)};
  ${
    $collapsed &&
    `
    padding: ${spacing(5)} ${spacing(3)};
    border-bottom: 1px solid ${colors[palette.mode].border.border1};
    `
  }
  `}
`;

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  marginTop: 0,
  borderTop: 'none',
}));

const StyledApprovalContainer = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing(4)} ${spacing(3)};
  border-radius: ${spacing(2)};
  `}
`;

interface SwapSettingsProps {
  shouldShow: boolean;
  onClose: () => void;
  setShouldShowFirstStep: SetStateCallback<boolean>;
}

const SwapSettings = ({ shouldShow, onClose, setShouldShowFirstStep }: SwapSettingsProps) => {
  const { slippage, gasSpeed, disabledDexes, isPermit2Enabled, sourceTimeout, sorting } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();
  const dexes = useSdkDexes();
  const trackEvent = useTrackEvent();
  const intl = useIntl();

  const gasOptions = GAS_KEYS.map((key) => ({ value: key, text: capitalize(key) }));
  const timeoutOptions = TIMEOUT_KEYS.map((key) => ({
    value: key,
    text: intl.formatMessage(TIMEOUT_LABELS_BY_KEY[key]),
  }));

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
  const setQuoteSorting = (newSort: SwapSortOptions) => {
    dispatch(setSorting(newSort));
    trackEvent('Aggregator - Change selected sorting', { sort: newSort });
  };
  const handleToggleDex = (id: string) => {
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

  const dexOptions: OptionsMenuOption[] = Object.keys(dexes).map((dexKey) => ({
    label: '',
    type: OptionsMenuOptionType.option,
    closeOnClick: false,
    icon: (
      <FormGroup key={dexKey}>
        <FormControlLabel
          control={<Checkbox onChange={() => handleToggleDex(dexKey)} checked={!disabledDexes.includes(dexKey)} />}
          label={dexes[dexKey].name}
        />
      </FormGroup>
    ),
  }));

  const sortQuotesOptions: OptionsMenuOption[] = Object.entries(SWAP_ROUTES_SORT_OPTIONS).map(
    ([optionKey, optionData]) => ({
      label: intl.formatMessage(optionData.label),
      type: OptionsMenuOptionType.option,
      control: (
        <Typography variant="bodySmall">
          <Tooltip title={intl.formatMessage(optionData.help)} arrow placement="top">
            <HelpOutlineIcon fontSize="small" />
          </Tooltip>
        </Typography>
      ),
      onClick: () => setQuoteSorting(optionKey as SwapSortOptions),
    })
  );

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
        <div>
          {/* Slippage */}
          <StyledAccordion>
            <AccordionSummary>
              <StyledSettingContainer>
                <StyledSettingTitle>
                  <FormattedMessage description="advancedAggregatorSettingsSlippage" defaultMessage="Slippage" />
                </StyledSettingTitle>
                <Typography variant="bodySmall" fontWeight={700}>
                  {slippage !== '' && `${slippage}%`}
                </Typography>
              </StyledSettingContainer>
            </AccordionSummary>
            <AccordionDetails>
              <SlippageInput value={slippage} onChange={onSlippageChange} id="slippage-input" />
            </AccordionDetails>
          </StyledAccordion>
          {/* Gas Fee */}
          <StyledAccordion>
            <AccordionSummary>
              <StyledSettingContainer>
                <StyledSettingTitle>
                  <FormattedMessage description="advancedAggregatorSettingsGasSpeed" defaultMessage="Gas speed" />
                </StyledSettingTitle>
                <Typography variant="bodySmall" fontWeight={700}>
                  {capitalize(gasSpeed)}
                </Typography>
              </StyledSettingContainer>
            </AccordionSummary>
            <AccordionDetails>
              <OptionsButtons options={gasOptions} activeOption={gasSpeed} setActiveOption={onGasSpeedChange} />
            </AccordionDetails>
          </StyledAccordion>
          {/* Source Waiting Time */}
          <StyledAccordion>
            <AccordionSummary>
              <StyledSettingContainer>
                <StyledSettingTitle>
                  <FormattedMessage
                    description="advancedAggregatorSettingsTimeout"
                    defaultMessage="Source waiting time"
                  />
                </StyledSettingTitle>
                <Typography variant="bodySmall" fontWeight={700}>
                  {intl.formatMessage(TIMEOUT_LABELS_BY_KEY[sourceTimeout])}
                </Typography>
              </StyledSettingContainer>
            </AccordionSummary>
            <AccordionDetails>
              <OptionsButtons
                options={timeoutOptions}
                activeOption={sourceTimeout}
                setActiveOption={onSourceTimeoutChange}
              />
            </AccordionDetails>
          </StyledAccordion>
          {/* Enabled Sources */}
          <StyledSettingContainer $collapsed>
            <StyledSettingTitle>
              <FormattedMessage
                description="advancedAggregatorSettingsEnabledSources"
                defaultMessage="Enabled sources"
              />
            </StyledSettingTitle>
            <OptionsMenu
              mainDisplay={
                <>
                  <Typography variant="bodySmall" fontWeight={700}>
                    {Object.keys(dexes).length - disabledDexes.length}/{Object.keys(dexes).length}
                  </Typography>
                  <KeyboardArrowRightIcon fontSize="small" />
                </>
              }
              showEndIcon={false}
              options={dexOptions}
            />
          </StyledSettingContainer>
          {/* Quote Sorter */}
          <StyledSettingContainer $collapsed>
            <StyledSettingTitle>
              <FormattedMessage description="selectBestQuoteBy" defaultMessage="Select by" />
            </StyledSettingTitle>
            <OptionsMenu
              mainDisplay={
                <>
                  <Typography variant="bodySmall" fontWeight={700}>
                    {intl.formatMessage(SWAP_ROUTES_SORT_OPTIONS[sorting].label)}
                  </Typography>
                  <KeyboardArrowRightIcon fontSize="small" />
                </>
              }
              showEndIcon={false}
              options={sortQuotesOptions}
            />
          </StyledSettingContainer>
        </div>
        {/* Universal Approval */}
        <StyledApprovalContainer>
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="h6" fontWeight={700}>
              <FormattedMessage
                description="advancedAggregatorSettingsPermit2"
                defaultMessage="Use Universal approval"
              />
            </Typography>
            <Typography variant="body" lineHeight="normal">
              <FormattedMessage
                description="approveTokenExplanation"
                defaultMessage="By enabling Universal Approval, you will be able to use Uniswap, Balmy, swap aggregators and more protocols without having to authorize each one of them"
              />
            </Typography>
          </ContainerBox>
          <Switch
            checked={isPermit2Enabled}
            onChange={() => onPermit2Change(!isPermit2Enabled)}
            name="enableDisablePermit2Approval"
            color="primary"
          />
        </StyledApprovalContainer>
        <Divider flexItem />
        <ContainerBox fullWidth justifyContent="center">
          <Button variant="contained" color="secondary" onClick={onRestoreDefaults} fullWidth>
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
