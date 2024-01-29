import styled from 'styled-components';
import React from 'react';
import isEqual from 'lodash/isEqual';
import { IconButton, Badge, colors, CogIcon } from 'ui-library';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { DEFAULT_AGGREGATOR_SETTINGS } from '@constants/aggregator';
import { useThemeMode } from '@state/config/hooks';

const StyledCogContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: ${({ theme: { spacing } }) => `${spacing(1)} ${spacing(2)}`};
`;

const StyledIconButton = styled(IconButton)`
  padding: 0;
`;

type Props = {
  onShowSettings: () => void;
};

const AdvancedSettings = ({ onShowSettings }: Props) => {
  const { slippage, gasSpeed, disabledDexes, sorting, sourceTimeout, isPermit2Enabled } = useAggregatorSettingsState();
  const themeMode = useThemeMode();

  const hasNonDefaultSettings =
    slippage !== DEFAULT_AGGREGATOR_SETTINGS.slippage.toString() ||
    gasSpeed !== DEFAULT_AGGREGATOR_SETTINGS.gasSpeed ||
    sorting !== DEFAULT_AGGREGATOR_SETTINGS.sorting ||
    sourceTimeout !== DEFAULT_AGGREGATOR_SETTINGS.sourceTimeout ||
    isPermit2Enabled !== DEFAULT_AGGREGATOR_SETTINGS.isPermit2Enabled ||
    !isEqual(disabledDexes, DEFAULT_AGGREGATOR_SETTINGS.disabledDexes);

  return (
    <StyledCogContainer>
      <Badge color="warning" variant="dot" invisible={!hasNonDefaultSettings}>
        <StyledIconButton aria-label="settings" onClick={onShowSettings}>
          <CogIcon sx={{ color: colors[themeMode].typography.typo2 }} />
        </StyledIconButton>
      </Badge>
    </StyledCogContainer>
  );
};

export default React.memo(AdvancedSettings);
