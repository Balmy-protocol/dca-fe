import React from 'react';
import { Token } from '@types';
import TokenIcon from '@common/components/token-icon';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { getGhTokenListLogoUrl } from '@constants';
import styled from 'styled-components';

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
  { balance: number; price?: number; token: Token; isLoadingPrice: boolean }
>;

interface PortfolioProps {
  balances: PortfolioRecord;
}

const Portfolio = ({ balances }: PortfolioProps) => {
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
            {Object.entries(balances).map(([tokenKey, tokenInfo]) => {
              const balanceUsd = tokenInfo.price && tokenInfo.balance * tokenInfo.price;
              return (
                <TableRow key={tokenKey}>
                  <TableCell>
                    <Typography>
                      {tokenInfo.balance.toFixed(4)} {tokenInfo.token.symbol}
                    </Typography>
                    {tokenInfo.isLoadingPrice && !tokenInfo.price ? (
                      <CenteredLoadingIndicator size={8} />
                    ) : (
                      <Typography>${balanceUsd?.toFixed(2)}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
                      <StyledAssetLogosContainer>
                        <TokenIcon token={tokenInfo.token} size="32px" />
                        <StyledNetworkLogoContainer>
                          <TokenIcon
                            size="12px"
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
                      <CenteredLoadingIndicator size={12} />
                    ) : (
                      <Typography>${tokenInfo.price?.toFixed(2)}</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Portfolio;
