import React from 'react';
import { TokenSelectorOption } from '@common/components/token-selector/token-items';
import styled, { useTheme } from 'styled-components';
import { ForegroundPaper, DonutShape, ContainerBox, CoinStar, useMediaQuery } from 'ui-library';
import SuggestedStrategies from './components/suggested-strategies';
import { WizardSelection } from './components/wizard-selection';

const StyledContainer = styled(ForegroundPaper).attrs({ elevation: 0 })`
  ${({ theme: { palette, space } }) => `
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: ${palette.gradient.earnWizard};
    padding: ${space.s05};
  `}
`;

export type RewardSelectorOption = TokenSelectorOption;

export type AssetSelectorOption = TokenSelectorOption & {
  chainsWithBalance: number[];
};

const EarnWizard = () => {
  const { spacing, breakpoints } = useTheme();

  const [selectedAsset, setSelectedAsset] = React.useState<AssetSelectorOption | undefined>();
  const [selectedReward, setSelectedReward] = React.useState<RewardSelectorOption | undefined>();

  const shouldShowWizard3dObject = useMediaQuery(breakpoints.down('lg'));

  return (
    <ContainerBox flexDirection="column" gap={10}>
      <StyledContainer>
        <WizardSelection
          selectedAsset={selectedAsset}
          selectedReward={selectedReward}
          setSelectedAsset={setSelectedAsset}
          setSelectedReward={setSelectedReward}
        />
        {!shouldShowWizard3dObject && (
          <ContainerBox style={{ position: 'relative' }} justifyContent="end" alignItems="end">
            <div style={{ position: 'absolute' }}>
              <DonutShape top={spacing(16)} width="142px" height="142px" />
            </div>
            <div style={{ position: 'absolute' }}>
              <CoinStar right={spacing(25)} width={spacing(12)} height={spacing(12)} padding={spacing(7.25)} />
            </div>
          </ContainerBox>
        )}
      </StyledContainer>
      {(selectedAsset || selectedReward) && (
        <SuggestedStrategies selectedAsset={selectedAsset} selectedReward={selectedReward} />
      )}
    </ContainerBox>
  );
};

export default EarnWizard;
