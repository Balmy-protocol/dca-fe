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
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { getGhTokenListLogoUrl } from '@constants';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { formatCurrencyAmount, toSignificantFromBigDecimal } from '@common/utils/currency';
import { map, orderBy } from 'lodash';

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

export type PortfolioRecord = Record<
  string,
  { balance: BigNumber; balanceUsd?: number; price?: number; token: Token; isLoadingPrice: boolean }
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
              <Skeleton variant="text" sx={{ fontSize: '18px' }} />
              <Skeleton variant="text" />
            </Grid>
          </TableCell>
          <TableCell>
            <Grid container direction="row" alignItems={'center'} gap={3}>
              <Skeleton variant="circular" width={32} height={32} />
              <Box display="flex" alignItems={'stretch'} flexDirection="column" flexGrow={1} gap={1}>
                <Skeleton variant="text" />
                <Skeleton variant="text" sx={{ fontSize: '18px' }} />
              </Box>
            </Grid>
          </TableCell>
          <TableCell>
            <Skeleton variant="text" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

const Portfolio = ({ balances, isLoadingAllBalances }: PortfolioProps) => {
  const orderedBalances = React.useMemo(() => {
    const mappedBalances = map(Object.entries(balances), ([key, value]) => ({ ...value, key }));
    return orderBy(mappedBalances, ['balanceUsd'], ['desc']);
  }, [balances]);

  return (
    <>
      <Typography variant="h5">
        <FormattedMessage description="myPortfolio" defaultMessage="My Portfolio" />
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <FormattedMessage description="portfolioBalanceCol" defaultMessage="Balance" />
              </TableCell>
              <TableCell>
                <FormattedMessage description="portfolioAssetCol" defaultMessage="Asset" />
              </TableCell>
              <TableCell>
                <FormattedMessage description="portfolioPriceCol" defaultMessage="Price" />
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
                    <Typography>
                      {formatCurrencyAmount(tokenInfo.balance, tokenInfo.token)} {tokenInfo.token.symbol}
                    </Typography>
                    {tokenInfo.isLoadingPrice && !tokenInfo.price ? (
                      <Skeleton variant="text" />
                    ) : (
                      <Typography>${toSignificantFromBigDecimal(tokenInfo.balanceUsd?.toString(), 4, 0.01)}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
                      <StyledAssetLogosContainer>
                        <TokenIcon token={tokenInfo.token} size="32px" />
                        <StyledNetworkLogoContainer>
                          <TokenIcon
                            size="14px"
                            token={{
                              ...tokenInfo.token,
                              logoURI: getGhTokenListLogoUrl(tokenInfo.token.chainId, 'logo'),
                            }}
                          />
                        </StyledNetworkLogoContainer>
                      </StyledAssetLogosContainer>
                      <Grid>
                        <Typography>{tokenInfo.token.symbol}</Typography>
                        <Typography>{tokenInfo.token.name}</Typography>
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell>
                    {tokenInfo.isLoadingPrice && !tokenInfo.price ? (
                      <Skeleton variant="text" />
                    ) : (
                      <Typography>${toSignificantFromBigDecimal(tokenInfo.price?.toString())}</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Portfolio;
