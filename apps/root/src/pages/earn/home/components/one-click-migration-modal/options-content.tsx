import { FarmWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';
import StrategiesTable from '@pages/earn/components/strategies-table';
import { migrationOptionsColumnConfigs } from '@pages/earn/components/strategies-table/components/columns';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ContainerBox, ForegroundPaper, Typography, Collapse, ArrowDropUpIcon, ArrowDropDownIcon } from 'ui-library';

const StyledHowItWorksTitleContainer = styled(ContainerBox).attrs({ gap: 1, alignItems: 'center' })`
  cursor: pointer;
`;

const StyledHowItWorksCollapseContainer = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { space } }) => `
    padding: ${space.s05};
    display: flex;
  `}
`;

interface OneClickMigrationOptionsContentProps {
  farms: FarmWithAvailableDepositTokens[];
  onGoToDetails: (farm: FarmWithAvailableDepositTokens) => void;
}

const OneClickMigrationOptionsContent = ({ farms, onGoToDetails }: OneClickMigrationOptionsContentProps) => {
  const [isHelpExpanded, setIsHelpExpanded] = React.useState(false);

  const handleOnGoToDetails = (farm: FarmWithAvailableDepositTokens) => {
    onGoToDetails(farm);
  };

  return (
    <ContainerBox flexDirection="column" gap={6}>
      <StrategiesTable
        columns={migrationOptionsColumnConfigs}
        visibleRows={farms}
        variant={StrategiesTableVariants.MIGRATION_OPTIONS}
        isLoading={false}
        onGoToStrategy={handleOnGoToDetails}
        rowsPerPage={farms.length}
        page={0}
        setPage={() => {}}
        strategies={farms}
        showBalances={false}
        showPagination={false}
      />
      <ContainerBox flexDirection="column" gap={2}>
        <StyledHowItWorksTitleContainer onClick={() => setIsHelpExpanded(!isHelpExpanded)}>
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="earn.strategy-details.vault-data.guardian.how-it-works.title"
              defaultMessage="How it works"
            />
          </Typography>
          {isHelpExpanded ? <ArrowDropUpIcon fontSize="inherit" /> : <ArrowDropDownIcon fontSize="inherit" />}
        </StyledHowItWorksTitleContainer>
        <Collapse in={isHelpExpanded} unmountOnExit>
          <StyledHowItWorksCollapseContainer>
            <Typography variant="bodyRegular">
              <FormattedMessage
                description="earn.strategy-details.vault-data.guardian.how-it-works.content"
                defaultMessage="Here will go the description of how a guardian works"
              />
            </Typography>
          </StyledHowItWorksCollapseContainer>
        </Collapse>
      </ContainerBox>
    </ContainerBox>
  );
};

export default OneClickMigrationOptionsContent;
