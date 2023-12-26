import React from 'react';
import { Token } from '@types';
import TokenIcon from '@common/components/token-icon';
import {
  Box,
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  colors,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { getGhTokenListLogoUrl } from '@constants';
import styled from 'styled-components';
import { formatCurrencyAmount, toSignificantFromBigDecimal, toToken } from '@common/utils/currency';
import { isUndefined, map, orderBy } from 'lodash';

const StyledNetworkLogoContainer = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  border: 2px solid;
  width: 16px;
  height: 16px;
`;

const StyledAssetLogosContainer = styled.div`
  position: relative;
`;

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

export type PortfolioRecord = Record<
  string,
  { balance: bigint; balanceUsd?: number; price?: number; token: Token; isLoadingPrice: boolean }
>;

interface PortfolioProps {
  balances: PortfolioRecord;
  isLoadingAllBalances: boolean;
}

const PortfolioBodySkeleton = () => {
  const skeletonRows = Array.from(Array(5).keys());
  return (
    <>
      {skeletonRows.map((i) => (
        <TableRow key={i}>
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
        </TableRow>
      ))}
    </>
  );
};

const Portfolio = ({ balances, isLoadingAllBalances }: PortfolioProps) => {
  const orderedBalances = React.useMemo(() => {
    const mappedBalances = map(Object.entries(balances), ([key, value]) => ({ ...value, key }));
    return orderBy(mappedBalances, [(item) => isUndefined(item.balanceUsd), 'balanceUsd'], ['asc', 'desc']);
  }, [balances]);

  return (
    <TableContainer>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead>
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
        </TableHead>
        <TableBody>
          {isLoadingAllBalances ? (
            <PortfolioBodySkeleton />
          ) : (
            orderedBalances.map((tokenInfo) => (
              <TableRow key={tokenInfo.key}>
                <TableCell>
                  <Box display={'flex'} flexDirection={'column'}>
                    <StyledCellTypography>
                      {formatCurrencyAmount(tokenInfo.balance, tokenInfo.token, 3)} {tokenInfo.token.symbol}
                    </StyledCellTypography>
                    <StyledCellTypographySmall>
                      {tokenInfo.isLoadingPrice && !tokenInfo.price ? (
                        <Skeleton variant="text" animation="wave" />
                      ) : (
                        `$${toSignificantFromBigDecimal(tokenInfo.balanceUsd?.toString(), 4, 0.01)}`
                      )}
                    </StyledCellTypographySmall>
                  </Box>
                </TableCell>
                <TableCell>
                  <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
                    <StyledAssetLogosContainer>
                      <TokenIcon token={tokenInfo.token} size="32px" />
                      <StyledNetworkLogoContainer>
                        <TokenIcon
                          size="14px"
                          token={toToken({
                            logoURI: getGhTokenListLogoUrl(tokenInfo.token.chainId, 'logo'),
                          })}
                        />
                      </StyledNetworkLogoContainer>
                    </StyledAssetLogosContainer>
                    <Box display={'flex'} flexDirection={'column'}>
                      <StyledCellTypography>{tokenInfo.token.symbol}</StyledCellTypography>
                      <StyledCellTypographySmall>{tokenInfo.token.name}</StyledCellTypographySmall>
                    </Box>
                  </Grid>
                </TableCell>
                <TableCell>
                  <StyledCellTypography>
                    {tokenInfo.isLoadingPrice && !tokenInfo.price ? (
                      <Skeleton variant="text" animation="wave" />
                    ) : (
                      `$${toSignificantFromBigDecimal(tokenInfo.price?.toString())}`
                    )}
                  </StyledCellTypography>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Portfolio;
