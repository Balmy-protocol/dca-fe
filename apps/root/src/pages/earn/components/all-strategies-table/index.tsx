import React from 'react';
import { Strategy } from 'common-types';
import {
  BackgroundPaper,
  ContainerBox,
  Paper,
  Skeleton,
  StyledBodySmallLabelTypography,
  StyledBodySmallRegularTypo2,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  colors,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import useEarnService from '@hooks/earn/useEarnService';
import styled from 'styled-components';
import { usdFormatter } from '@common/utils/parsing';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI } from '@common/utils/currency';
import AllStrategiesTableToolbar from './components/toolbar';
import { getStrategySafetyIcon } from '@common/utils/earn/parsing';
import useFilteredStrategies from '@hooks/earn/useFilteredStrategies';

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
    padding: 0px ${spacing(4)} ${spacing(4)} ${spacing(4)};
  `}
  flex: 1;
  display: flex;
  align-items: center;
`;

const StyledYieldTypeBox = styled.div`
  ${({ theme: { palette, spacing } }) => `
  padding: ${spacing(1)} ${spacing(3)};
  border-radius: ${spacing(2)};
  border: 1px solid ${colors[palette.mode].violet.violet300};
  `}
`;

const AllStrategiesTableHeader = () => (
  <TableRow>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="allVaultsVaultName" defaultMessage="Vault name" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="allVaultsToken" defaultMessage="Token" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="allVaultsChain" defaultMessage="Chain" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="allVaultsYieldType" defaultMessage="Yield Type" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="allVaultsTVL" defaultMessage="TVL" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="allVaultsAPY" defaultMessage="APY" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="allVaultsGuardian" defaultMessage="Guardian" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="allVaultsSafety" defaultMessage="Safety" />
      </StyledBodySmallLabelTypography>
    </TableCell>
  </TableRow>
);

const ROWS_PER_PAGE = 7;

const skeletonRows = Array.from(Array(ROWS_PER_PAGE).keys());

const AllStrategiesTableBodySkeleton = () => (
  <>
    {skeletonRows.map((i) => (
      <TableRow key={i}>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo2>
        </TableCell>
        <TableCell>
          <ContainerBox gap={2} alignItems="center">
            <Skeleton variant="circular" width={28} height={28} animation="wave" />
            <StyledBodySmallRegularTypo2>
              <Skeleton variant="text" animation="wave" width="6ch" />
            </StyledBodySmallRegularTypo2>
          </ContainerBox>
        </TableCell>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo2>
        </TableCell>
        <TableCell>
          <ContainerBox>
            <StyledYieldTypeBox>
              <StyledBodySmallRegularTypo2>
                <Skeleton variant="text" animation="wave" width="6ch" />
              </StyledBodySmallRegularTypo2>
            </StyledYieldTypeBox>
          </ContainerBox>
        </TableCell>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo2>
        </TableCell>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo2>
        </TableCell>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo2>
        </TableCell>
        <TableCell>
          <StyledBodySmallRegularTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallRegularTypo2>
        </TableCell>
      </TableRow>
    ))}
  </>
);

const createRow = (strategy: Strategy) => (
  <TableRow key={`${strategy.id}-${strategy.guardian?.id}`}>
    <TableCell>
      <StyledBodySmallRegularTypo2>{strategy.farm.name}</StyledBodySmallRegularTypo2>
    </TableCell>
    <TableCell>
      <ContainerBox gap={2} alignItems="center">
        {strategy.asset.icon}
        <StyledBodySmallRegularTypo2>{strategy.asset.symbol}</StyledBodySmallRegularTypo2>
      </ContainerBox>
    </TableCell>
    <TableCell>
      <StyledBodySmallRegularTypo2>{strategy.network.name}</StyledBodySmallRegularTypo2>
    </TableCell>
    <TableCell>
      <ContainerBox>
        <StyledYieldTypeBox>
          <StyledBodySmallRegularTypo2>{strategy.formattedYieldType}</StyledBodySmallRegularTypo2>
        </StyledYieldTypeBox>
      </ContainerBox>
    </TableCell>
    <TableCell>
      <StyledBodySmallRegularTypo2>${usdFormatter(strategy.farm.tvl)}</StyledBodySmallRegularTypo2>
    </TableCell>
    <TableCell>
      <StyledBodySmallRegularTypo2>{strategy.farm.apy}%</StyledBodySmallRegularTypo2>
    </TableCell>
    <TableCell>
      {strategy.guardian ? (
        <ContainerBox gap={2} alignItems="center">
          <TokenIcon token={emptyTokenWithLogoURI(strategy.guardian.logo || '')} />
          <StyledBodySmallRegularTypo2>{strategy.guardian.name}</StyledBodySmallRegularTypo2>
        </ContainerBox>
      ) : (
        <StyledBodySmallRegularTypo2>-</StyledBodySmallRegularTypo2>
      )}
    </TableCell>
    <TableCell>{getStrategySafetyIcon(strategy.riskLevel)}</TableCell>
  </TableRow>
);

const createEmptyRows = (rowCount: number) => {
  return Array.from({ length: rowCount }, (_, i) => (
    <TableRow key={i} sx={{ visibility: 'hidden', height: ({ spacing }) => spacing(15.25) }}>
      <TableCell colSpan={7}>&nbsp;</TableCell>
    </TableRow>
  ));
};

const AllStrategiesTable = () => {
  const [page, setPage] = React.useState(0);
  const earnService = useEarnService();
  const { filteredStrategies, isLoadingAllStrategies } = useFilteredStrategies();

  React.useEffect(() => {
    const fetchStrategies = async () => {
      await earnService.fetchAllStrategies();
    };
    void fetchStrategies();
  }, []);

  const visibleRows = React.useMemo<Strategy[]>(
    () => filteredStrategies.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [page, filteredStrategies]
  );

  // Keeps the table height consistent
  const emptyRows = createEmptyRows(ROWS_PER_PAGE - visibleRows.length);

  return (
    <ContainerBox flexDirection="column" gap={5}>
      <AllStrategiesTableToolbar isLoading={isLoadingAllStrategies} />
      <StyledBackgroundPaper variant="outlined">
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <AllStrategiesTableHeader />
            </TableHead>
            <TableBody>
              {isLoadingAllStrategies ? (
                <AllStrategiesTableBodySkeleton />
              ) : (
                <>
                  {visibleRows.map(createRow)}
                  {emptyRows}
                </>
              )}
            </TableBody>
          </Table>
          <TablePagination
            count={filteredStrategies.length}
            rowsPerPage={ROWS_PER_PAGE}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
          />
        </TableContainer>
      </StyledBackgroundPaper>
    </ContainerBox>
  );
};

export default AllStrategiesTable;
