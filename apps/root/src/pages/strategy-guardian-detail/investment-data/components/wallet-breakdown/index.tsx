import Address from '@common/components/address';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { formatUsdAmount, isSameToken } from '@common/utils/currency';
import { BalanceToken } from '@hooks/useMergedTokensBalances';
import { TokenNetworksTooltipTitle } from '@pages/home/components/token-icon-multichain';
import { DisplayStrategy } from 'common-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  StyledBodySmallLabelTypography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  colors,
} from 'ui-library';

interface WalletBreakdownProps {
  strategy: DisplayStrategy;
}

const StyledCell = styled(TableCell)`
  padding: 0;
  padding-left: 0px !important;
  padding-right: 0px !important;
`;

const StyledRow = styled(TableRow)<{ $isLast: boolean; $isFirst: boolean }>`
  background-color: transparent !important;
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
    $isFirst,
    $isLast,
  }) => `
    ${StyledCell} {
      padding-top: ${$isFirst ? '0px' : spacing(2)};
      padding-bottom: ${$isLast ? '0px' : spacing(2)};
      ${!$isLast && `border-bottom: 1.5px solid ${colors[mode].border.border1};`}
      border-radius: 0px;
    }
  `}
`;

const WalletBreakdown = ({ strategy }: WalletBreakdownProps) => {
  const intl = useIntl();

  return (
    <Accordion disableGutters defaultExpanded sx={{ padding: ({ spacing }) => spacing(4) }}>
      <AccordionSummary>
        <Typography variant="h6Bold">
          <FormattedMessage defaultMessage="Breakdown" description="strategy-detail.vault-investment-data.breakdown" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer sx={{ backgroundColor: 'transparent' }}>
          <Table sx={{ borderSpacing: ({ spacing }) => `0px ${spacing(2)} !important`, tableLayout: 'auto' }}>
            <TableHead>
              <TableRow>
                <StyledCell size="medium">
                  <StyledBodySmallLabelTypography>
                    <FormattedMessage
                      defaultMessage="Wallet"
                      description="strategy-detail.vault-investment-data.breakdown.table.wallet"
                    />
                  </StyledBodySmallLabelTypography>
                </StyledCell>
                <StyledCell size="small">
                  <StyledBodySmallLabelTypography>
                    <FormattedMessage
                      defaultMessage="Invested"
                      description="strategy-detail.vault-investment-data.breakdown.table.invested"
                    />
                  </StyledBodySmallLabelTypography>
                </StyledCell>
                <StyledCell size="small">
                  <StyledBodySmallLabelTypography>
                    <FormattedMessage
                      defaultMessage="Daily Earnings"
                      description="strategy-detail.vault-investment-data.breakdown.table.daily-earnings"
                    />
                  </StyledBodySmallLabelTypography>
                </StyledCell>
                <StyledCell size="small">
                  <StyledBodySmallLabelTypography>
                    <FormattedMessage
                      defaultMessage="Profit"
                      description="strategy-detail.vault-investment-data.breakdown.table.profit"
                    />
                  </StyledBodySmallLabelTypography>
                </StyledCell>
                <StyledCell size="small">
                  <StyledBodySmallLabelTypography>
                    <FormattedMessage
                      defaultMessage="Rewards"
                      description="strategy-detail.vault-investment-data.breakdown.table.rewards"
                    />
                  </StyledBodySmallLabelTypography>
                </StyledCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {strategy.userPositions?.map((position, index) => {
                const mainBalance = position.balances.reduce(
                  (acc, balance) => acc + Number(balance.amount.amountInUSD),
                  0
                );
                const profit = position.balances.reduce((acc, balance) => acc + Number(balance.profit.amountInUSD), 0);

                const dailyEarnings = (Number(mainBalance) * position.strategy.farm.apy) / 365;

                const balanceTokens = position.balances
                  .filter((balance) => !isSameToken(balance.token, strategy.asset))
                  .map<BalanceToken>((balance) => ({
                    balance: balance.amount.amount,
                    balanceUsd: Number(balance.amount.amountInUSD),
                    token: balance.token,
                    isLoadingPrice: false,
                  }));

                return (
                  <>
                    <StyledRow
                      key={position.id}
                      $isFirst={index === 0}
                      $isLast={index === (strategy.userPositions?.length || 0) - 1}
                    >
                      <StyledCell size="medium">
                        <Typography
                          variant="bodySmallSemibold"
                          color={({ palette: { mode } }) => colors[mode].typography.typo3}
                        >
                          <Address address={position.owner} trimAddress />
                        </Typography>
                      </StyledCell>
                      <StyledCell size="medium">
                        <Typography
                          variant="bodySmallSemibold"
                          color={({ palette: { mode } }) => colors[mode].typography.typo3}
                        >
                          ${formatUsdAmount({ amount: profit, intl })}
                        </Typography>
                      </StyledCell>
                      <StyledCell size="medium">
                        <Typography
                          variant="bodySmallSemibold"
                          color={({ palette: { mode } }) => colors[mode].typography.typo3}
                        >
                          ${formatUsdAmount({ amount: dailyEarnings, intl })}
                        </Typography>
                      </StyledCell>
                      <StyledCell size="small">
                        <Typography
                          variant="bodySmallSemibold"
                          color={({ palette: { mode } }) => colors[mode].typography.typo3}
                        >
                          ${formatUsdAmount({ amount: profit, intl })}
                        </Typography>
                      </StyledCell>
                      <StyledCell size="small">
                        <Tooltip title={<TokenNetworksTooltipTitle balanceTokens={balanceTokens} />}>
                          <ComposedTokenIcon
                            size={6}
                            tokens={strategy.rewards.tokens}
                            overlapRatio={0.6}
                            marginRight={1.75}
                            withShadow
                          />
                        </Tooltip>
                      </StyledCell>
                    </StyledRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

export default WalletBreakdown;
