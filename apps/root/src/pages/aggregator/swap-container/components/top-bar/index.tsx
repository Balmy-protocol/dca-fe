import styled from 'styled-components';
import React from 'react';
import isEqual from 'lodash/isEqual';
import { IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Badge from '@mui/material/Badge';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { DEFAULT_AGGREGATOR_SETTINGS } from '@constants/aggregator';
import NetworkSelector from '../network-selector';

const StyledCogContainer = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  border: 3px solid #151515;
  border-radius: 20px;
  background: #151515;
`;

type Props = {
  onShowSettings: () => void;
};

const TopBar = ({ onShowSettings }: Props) => {
  const { slippage, gasSpeed, disabledDexes, sorting, sourceTimeout, isPermit2Enabled } = useAggregatorSettingsState();
  const hasNonDefaultSettings =
    slippage !== DEFAULT_AGGREGATOR_SETTINGS.slippage.toString() ||
    gasSpeed !== DEFAULT_AGGREGATOR_SETTINGS.gasSpeed ||
    sorting !== DEFAULT_AGGREGATOR_SETTINGS.sorting ||
    sourceTimeout !== DEFAULT_AGGREGATOR_SETTINGS.sourceTimeout ||
    isPermit2Enabled !== DEFAULT_AGGREGATOR_SETTINGS.isPermit2Enabled ||
    !isEqual(disabledDexes, DEFAULT_AGGREGATOR_SETTINGS.disabledDexes);

  return (
    <>
      <StyledCogContainer>
        <Badge color="warning" variant="dot" invisible={!hasNonDefaultSettings}>
          <IconButton aria-label="settings" size="small" sx={{ padding: '3px' }} onClick={onShowSettings}>
            <SettingsIcon fontSize="inherit" />
          </IconButton>
        </Badge>
      </StyledCogContainer>
      <NetworkSelector />
    </>
  );
};

export default React.memo(TopBar);
