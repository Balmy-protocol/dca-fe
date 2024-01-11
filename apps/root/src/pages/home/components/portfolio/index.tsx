import React from 'react';
import { Token } from '@types';
import {
  Box,
  Grid,
  ItemContent,
  Skeleton,
  TableCell,
  TableRow,
  Typography,
  VirtualizedTable,
  buildVirtuosoTableComponents,
  colors,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { formatCurrencyAmount, toSignificantFromBigDecimal } from '@common/utils/currency';
import { isUndefined, map, orderBy } from 'lodash';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';

const StyledCellTypography = styled(Typography).attrs({
  variant: 'body',
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
  `}
`;

const StyledCellTypographySmall = styled(Typography).attrs({
  variant: 'bodySmall',
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo3};

  `}
`;

export type BalanceItem = {
  balance: bigint;
  balanceUsd?: number;
  price?: number;
  token: Token;
  isLoadingPrice: boolean;
};
export type PortfolioRecord = Record<string, BalanceItem>;

interface PortfolioProps {
  balances: PortfolioRecord;
  isLoadingAllBalances: boolean;
}

const SKELETON_ROWS = Array.from(Array(5).keys());
const PortfolioBodySkeleton: ItemContent<BalanceItem, Record<string, never>> = () => {
  return (
    <>
      <TableCell>
        <Grid container gap={1} direction="column">
          <StyledCellTypography>
            <Skeleton variant="text" animation="wave" />
          </StyledCellTypography>
          <StyledCellTypographySmall>
            <Skeleton variant="text" animation="wave" />
          </StyledCellTypographySmall>
        </Grid>
      </TableCell>
      <TableCell>
        <Grid container direction="row" alignItems={'center'} gap={3}>
          <Skeleton variant="circular" width={32} height={32} animation="wave" />
          <Box display="flex" alignItems={'stretch'} flexDirection="column" flexGrow={1} gap={1}>
            <StyledCellTypography>
              <Skeleton variant="text" animation="wave" />
            </StyledCellTypography>
            <StyledCellTypographySmall>
              <Skeleton variant="text" animation="wave" />
            </StyledCellTypographySmall>
          </Box>
        </Grid>
      </TableCell>
      <TableCell>
        <StyledCellTypography>
          <Skeleton variant="text" animation="wave" />
        </StyledCellTypography>
      </TableCell>
    </>
  );
};

const PortfolioBodyItem: ItemContent<BalanceItem, Record<string, never>> = (
  index: number,
  { balance, token, isLoadingPrice, price, balanceUsd }: BalanceItem
) => {
  return (
    <>
      <TableCell>
        <Box display={'flex'} flexDirection={'column'}>
          <StyledCellTypography>
            {formatCurrencyAmount(balance, token, 3)} {token.symbol}
          </StyledCellTypography>
          <StyledCellTypographySmall>
            {isLoadingPrice && !price ? (
              <Skeleton variant="text" animation="wave" />
            ) : (
              `$${toSignificantFromBigDecimal(balanceUsd?.toString(), 4, 0.01)}`
            )}
          </StyledCellTypographySmall>
        </Box>
      </TableCell>
      <TableCell>
        <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
          <TokenIconWithNetwork token={token} />
          <Box display={'flex'} flexDirection={'column'}>
            <StyledCellTypography>{token.symbol}</StyledCellTypography>
            <StyledCellTypographySmall>{token.name}</StyledCellTypographySmall>
          </Box>
        </Grid>
      </TableCell>
      <TableCell>
        <StyledCellTypography>
          {isLoadingPrice && !price ? (
            <Skeleton variant="text" animation="wave" />
          ) : (
            `$${toSignificantFromBigDecimal(price?.toString())}`
          )}
        </StyledCellTypography>
      </TableCell>
    </>
  );
};

const PortfolioTableHeader = () => (
  <TableRow>
    <TableCell>
      <StyledCellTypographySmall>
        <FormattedMessage description="portfolioBalanceCol" defaultMessage="Balance" />
      </StyledCellTypographySmall>
    </TableCell>
    <TableCell>
      <StyledCellTypographySmall>
        <FormattedMessage description="portfolioAssetCol" defaultMessage="Asset" />
      </StyledCellTypographySmall>
    </TableCell>
    <TableCell>
      <StyledCellTypographySmall>
        <FormattedMessage description="portfolioPriceCol" defaultMessage="Price" />
      </StyledCellTypographySmall>
    </TableCell>
  </TableRow>
);

const VirtuosoTableComponents = buildVirtuosoTableComponents<BalanceItem, Record<string, never>>();

const Portfolio = ({ balances, isLoadingAllBalances }: PortfolioProps) => {
  const orderedBalances = React.useMemo(() => {
    const mappedBalances = map(Object.entries(balances), ([key, value]) => ({ ...value, key }));
    return orderBy(mappedBalances, [(item) => isUndefined(item.balanceUsd), 'balanceUsd'], ['asc', 'desc']);
  }, [balances]);

  return (
    <VirtualizedTable
      data={isLoadingAllBalances ? (SKELETON_ROWS as unknown as BalanceItem[]) : orderedBalances}
      VirtuosoTableComponents={VirtuosoTableComponents}
      header={PortfolioTableHeader}
      itemContent={isLoadingAllBalances ? PortfolioBodySkeleton : PortfolioBodyItem}
      separateRows={false}
    />
  );
};

export default Portfolio;
