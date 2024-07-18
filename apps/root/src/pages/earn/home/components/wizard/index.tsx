import React from 'react';
import { TokenSelectorOption } from '@common/components/token-selector';
import styled, { useTheme } from 'styled-components';
import { ForegroundPaper, DonutShape, ContainerBox, CoinStar } from 'ui-library';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import SuggestedStrategies from './components/suggested-strategies';
import { WizardSelection } from './components/wizard-selection';

const StyledContainer = styled(ForegroundPaper).attrs({ elevation: 0 })`
  ${({ theme: { palette, spacing } }) => `
    display: flex;
    flex-direction: column;
    background: ${palette.gradient.earnWizard};
    padding: ${spacing(5)};
  `}
`;

export type RewardSelectorOption = TokenSelectorOption;

export type AssetSelectorOption = TokenSelectorOption & {
  chainsWithBalance: number[];
};

const EarnWizard = () => {
  const { spacing } = useTheme();
  const currentBreakpoint = useCurrentBreakpoint();

  const [selectedAsset, setSelectedAsset] = React.useState<AssetSelectorOption | undefined>();
  const [selectedReward, setSelectedReward] = React.useState<RewardSelectorOption | undefined>();

  const isDownMd = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';

  return (
    <ContainerBox flexDirection="column" gap={10}>
      <StyledContainer>
        <WizardSelection
          selectedAsset={selectedAsset}
          selectedReward={selectedReward}
          setSelectedAsset={setSelectedAsset}
          setSelectedReward={setSelectedReward}
        />
        {!isDownMd && (
          <ContainerBox style={{ position: 'relative' }} justifyContent="end" alignItems="end">
            <div style={{ position: 'absolute' }}>
              <DonutShape top={spacing(10)} />
            </div>
            <div style={{ position: 'absolute' }}>
              <CoinStar right={spacing(30)} />
            </div>
          </ContainerBox>
        )}
      </StyledContainer>
      {selectedAsset && selectedReward && (
        <SuggestedStrategies
          selectedAsset={{
            token: selectedAsset.token,
            chainsWithBalance: selectedAsset.chainsWithBalance,
          }}
          selectedReward={{
            token: selectedReward.token,
          }}
        />
      )}
    </ContainerBox>
  );
};

export default EarnWizard;
