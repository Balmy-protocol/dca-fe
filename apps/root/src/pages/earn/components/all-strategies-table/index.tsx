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
  Typography,
  colors,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { useAllStrategies } from '@hooks/earn/useAllStrategies';
import useEarnService from '@hooks/earn/useEarnService';
import styled from 'styled-components';
import { usdFormatter } from '@common/utils/parsing';

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

const StyledBodySmallSemiboldTypo2 = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
    ...rest
  }) => ({
    variant: 'bodySmallSemibold',
    color: colors[mode].typography.typo2,
    noWrap: true,
    ...rest,
  })
)``;

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
  </TableRow>
);

const ROWS_PER_PAGE = 7;

const skeletonRows = Array.from(Array(ROWS_PER_PAGE).keys());

const AllStrategiesTableBodySkeleton = () => (
  <>
    {skeletonRows.map((i) => (
      <TableRow key={i}>
        <TableCell>
          <StyledBodySmallSemiboldTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallSemiboldTypo2>
        </TableCell>
        <TableCell>
          <ContainerBox gap={2} alignItems="center">
            <Skeleton variant="circular" width={28} height={28} animation="wave" />
            <StyledBodySmallSemiboldTypo2>
              <Skeleton variant="text" animation="wave" width="6ch" />
            </StyledBodySmallSemiboldTypo2>
          </ContainerBox>
        </TableCell>
        <TableCell>
          <StyledBodySmallSemiboldTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallSemiboldTypo2>
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
          <StyledBodySmallSemiboldTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallSemiboldTypo2>
        </TableCell>
        <TableCell>
          <StyledBodySmallSemiboldTypo2>
            <Skeleton variant="text" animation="wave" />
          </StyledBodySmallSemiboldTypo2>
        </TableCell>
      </TableRow>
    ))}
  </>
);

const createRow = (strategy: Strategy) => (
  <TableRow>
    <TableCell>
      <StyledBodySmallSemiboldTypo2>{strategy.farm.name}</StyledBodySmallSemiboldTypo2>
    </TableCell>
    <TableCell>
      <ContainerBox gap={2} alignItems="center">
        {strategy.asset.icon}
        <StyledBodySmallSemiboldTypo2>{strategy.asset.symbol}</StyledBodySmallSemiboldTypo2>
      </ContainerBox>
    </TableCell>
    <TableCell>
      <StyledBodySmallSemiboldTypo2>{strategy.network.name}</StyledBodySmallSemiboldTypo2>
    </TableCell>
    <TableCell>
      <ContainerBox>
        <StyledYieldTypeBox>
          <StyledBodySmallRegularTypo2>{strategy.farm.yieldType}</StyledBodySmallRegularTypo2>
        </StyledYieldTypeBox>
      </ContainerBox>
    </TableCell>
    <TableCell>
      <StyledBodySmallSemiboldTypo2>${usdFormatter(strategy.farm.tvl)}</StyledBodySmallSemiboldTypo2>
    </TableCell>
    <TableCell>
      <StyledBodySmallSemiboldTypo2>{strategy.rewards[0].apy}%</StyledBodySmallSemiboldTypo2>
    </TableCell>
  </TableRow>
);

const AllStrategiesTable = () => {
  const [page, setPage] = React.useState(0);
  const earnService = useEarnService();
  const { isLoadingAllStrategies, strategies } = useAllStrategies();

  React.useEffect(() => {
    const fetchStrategies = async () => {
      await earnService.fetchAllStrategies();
    };
    void fetchStrategies();
  }, []);

  const visibleRows = React.useMemo<Strategy[]>(
    () => strategies.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [page, strategies]
  );

  return (
    <StyledBackgroundPaper variant="outlined">
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <AllStrategiesTableHeader />
          </TableHead>
          <TableBody>
            {isLoadingAllStrategies ? <AllStrategiesTableBodySkeleton /> : visibleRows.map(createRow)}
          </TableBody>
        </Table>
        <TablePagination
          count={strategies.length}
          rowsPerPage={10}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
        />
      </TableContainer>
    </StyledBackgroundPaper>
  );
};

export default AllStrategiesTable;
