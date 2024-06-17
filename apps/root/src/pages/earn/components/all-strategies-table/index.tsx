import React from 'react';
import { Strategy } from 'common-types';
import {
  BackgroundPaper,
  ContainerBox,
  DividerBorder2,
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
  ChevronRightIcon,
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
import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';
import { filterStrategiesBySearch } from '@common/utils/earn/search';

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

const StyledTableEnd = styled(TableCell)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(1)} 0px !important;
  `}
  height: 1px;
`;

const StyledNavContainer = styled(ContainerBox)`
  height: 100%;
  width: 50px;
  margin: 0 auto;
`;

const StyledChevronContainer = styled(ContainerBox)<{ hovered: boolean }>`
  transition: 0.15s all ease;
  ${({ hovered, theme: { spacing } }) => `
    padding-left: ${hovered ? spacing(2) : '0px'};
  `}
`;

const AllStrategiesTableHeader = () => (
  <TableRow>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="earn.all-strategies-table.column.vault-name" defaultMessage="Vault name" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="earn.all-strategies-table.column.token" defaultMessage="Token" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="earn.all-strategies-table.column.chain" defaultMessage="Chain" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="earn.all-strategies-table.column.yield-type" defaultMessage="Yield Type" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="earn.all-strategies-table.column.tvl" defaultMessage="TVL" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="earn.all-strategies-table.column.apy" defaultMessage="APY" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="earn.all-strategies-table.column.guardian" defaultMessage="Guardian" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="earn.all-strategies-table.column.safety" defaultMessage="Safety" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <StyledTableEnd size="small"></StyledTableEnd>
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
        <StyledTableEnd size="small"></StyledTableEnd>
      </TableRow>
    ))}
  </>
);
interface RowProps {
  strategy: Strategy;
  onRowClick: (strategy: Strategy) => void;
}
const Row = ({ strategy, onRowClick }: RowProps) => {
  const { id, farm, asset, network, formattedYieldType, riskLevel, guardian } = strategy;
  const [hovered, setHovered] = React.useState(false);

  return (
    <TableRow
      key={id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ cursor: 'pointer' }}
      hover
      onClick={() => onRowClick(strategy)}
    >
      <TableCell>
        <StyledBodySmallRegularTypo2>{farm.name}</StyledBodySmallRegularTypo2>
      </TableCell>
      <TableCell>
        <ContainerBox gap={2} alignItems="center">
          <TokenIcon token={asset} size={4.5} />
          <StyledBodySmallRegularTypo2>{asset.symbol}</StyledBodySmallRegularTypo2>
        </ContainerBox>
      </TableCell>
      <TableCell>
        <StyledBodySmallRegularTypo2>{network.name}</StyledBodySmallRegularTypo2>
      </TableCell>
      <TableCell>
        <ContainerBox>
          <StyledYieldTypeBox>
            <StyledBodySmallRegularTypo2>{formattedYieldType}</StyledBodySmallRegularTypo2>
          </StyledYieldTypeBox>
        </ContainerBox>
      </TableCell>
      <TableCell>
        <StyledBodySmallRegularTypo2>${usdFormatter(farm.tvl)}</StyledBodySmallRegularTypo2>
      </TableCell>
      <TableCell>
        <StyledBodySmallRegularTypo2>{farm.apy}%</StyledBodySmallRegularTypo2>
      </TableCell>
      <TableCell>
        {guardian ? (
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon token={emptyTokenWithLogoURI(guardian.logo || '')} size={4.5} />
            <StyledBodySmallRegularTypo2>{guardian.name}</StyledBodySmallRegularTypo2>
          </ContainerBox>
        ) : (
          <StyledBodySmallRegularTypo2>-</StyledBodySmallRegularTypo2>
        )}
      </TableCell>
      <TableCell>{getStrategySafetyIcon(riskLevel)}</TableCell>
      <StyledTableEnd size="small">
        <StyledNavContainer alignItems="center">
          <DividerBorder2 orientation="vertical" />
          <StyledChevronContainer hovered={hovered} alignItems="center" flex={1} justifyContent="center">
            <ChevronRightIcon sx={{ color: ({ palette: { mode } }) => colors[mode].accentPrimary }} />
          </StyledChevronContainer>
        </StyledNavContainer>
      </StyledTableEnd>
    </TableRow>
  );
};

const createEmptyRows = (rowCount: number) => {
  return Array.from({ length: rowCount }, (_, i) => (
    <TableRow key={i} sx={{ visibility: 'hidden', height: ({ spacing }) => spacing(15.25) }}>
      <TableCell colSpan={7}>&nbsp;</TableCell>
    </TableRow>
  ));
};

const AllStrategiesTable = () => {
  const [page, setPage] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const earnService = useEarnService();
  const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();
  const { filteredStrategies, hasFetchedAllStrategies } = useFilteredStrategies();

  React.useEffect(() => {
    const fetchStrategies = async () => {
      await earnService.fetchAllStrategies();
    };
    if (!hasFetchedAllStrategies) {
      void fetchStrategies();
    }
  }, []);

  const onRowClick = React.useCallback(
    (strategy: Strategy) => {
      pushToHistory(`/earn/${strategy.network.chainId}/vaults/${strategy.id}`);
      trackEvent('Earn Vault List - Go to vault details', {
        chainId: strategy.network.chainId,
      });
    },
    [pushToHistory, trackEvent]
  );

  const handleSearchChange = (newValue: string) => {
    setPage(0);
    setSearch(newValue);
  };

  const filteredStrategiesBySearch = React.useMemo<Strategy[]>(
    () => filterStrategiesBySearch(filteredStrategies, search),
    [filteredStrategies, search]
  );

  const visibleRows = React.useMemo<Strategy[]>(
    () => filteredStrategiesBySearch.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [page, filteredStrategiesBySearch]
  );

  // Keeps the table height consistent
  const emptyRows = createEmptyRows(ROWS_PER_PAGE - visibleRows.length);

  return (
    <ContainerBox flexDirection="column" gap={5} flex={1}>
      <AllStrategiesTableToolbar isLoading={!hasFetchedAllStrategies} search={search} setSearch={handleSearchChange} />
      <StyledBackgroundPaper variant="outlined">
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ tableLayout: 'auto' }}>
            <TableHead>
              <AllStrategiesTableHeader />
            </TableHead>
            <TableBody>
              {!hasFetchedAllStrategies ? (
                <AllStrategiesTableBodySkeleton />
              ) : (
                <>
                  {visibleRows.map((row) => (
                    <Row key={row.id} strategy={row} onRowClick={onRowClick} />
                  ))}
                  {emptyRows}
                </>
              )}
            </TableBody>
          </Table>
          <TablePagination
            count={filteredStrategiesBySearch.length}
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
