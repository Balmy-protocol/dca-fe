import Address from '@common/components/address';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { formatUsdAmount, isSameToken } from '@common/utils/currency';
import { getTokensWithBalanceAndApy } from '@common/utils/earn/parsing';
import { BalanceToken } from '@hooks/useMergedTokensBalances';
import { TokenNetworksTooltipTitle } from '@pages/home/components/token-icon-multichain';
import { useShowBalances } from '@state/config/hooks';
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
  HiddenNumber,
  ContainerBox,
} from 'ui-library';

interface WalletBreakdownProps {
  strategy: DisplayStrategy;
}

const StyledCell = styled(TableCell)`
  padding: 0;
  padding-left: 0px !important;
  padding-right: 0px !important;
`;

const StyledTableHeaderRow = styled(TableRow)`
  background-color: transparent !important;
  ${StyledCell} {
    padding: 0 !important;
    border: none !important;
  }
`;

const StyledRow = styled(TableRow)<{ $isFirst: boolean }>`
  background-color: transparent !important;
  &:hover {
    background-color: transparent !important;
  }
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
    $isFirst,
  }) => `
    ${StyledCell} {
      padding-top: ${$isFirst ? '0px' : spacing(2)};
      border-top: ${$isFirst ? 'none' : `1.5px solid ${colors[mode].border.border1}`};
      border-radius: 0px;
    }
  `}
`;

const WalletBreakdownTableBody = ({ strategy, showRewards }: WalletBreakdownProps & { showRewards: boolean }) => {
  const intl = useIntl();
  const showBalances = useShowBalances();

  const walletItems = React.useMemo(() => {
    return strategy.userPositions
      ?.filter((position) => position.balances.some((balance) => balance.amount.amount > 0n))
      .map((position) => {
        const mainBalance = position.balances.find((balance) => isSameToken(balance.token, strategy.asset));
        const profit = position.balances.reduce((acc, balance) => acc + Number(balance.profit.amountInUSD), 0);

        const dailyEarnings = (Number(mainBalance?.amount.amountInUSD) * (position.strategy.farm.apy / 100)) / 365;

        const balanceTokens = position.balances
          .filter((balance) => !isSameToken(balance.token, strategy.asset))
          .map<BalanceToken>((balance) => ({
            balance: balance.amount.amount,
            balanceUsd: Number(balance.amount.amountInUSD),
            token: balance.token,
            isLoadingPrice: false,
          }));

        return { mainBalance, profit, dailyEarnings, balanceTokens, position };
      });
  }, [strategy.userPositions]);

  const rewardTokensData = React.useMemo(
    () => getTokensWithBalanceAndApy(strategy, strategy.userPositions),
    [strategy]
  );
  return walletItems?.map(({ mainBalance, profit, dailyEarnings, balanceTokens, position }, index) => (
    <StyledRow key={position.id} $isFirst={index === 0}>
      <StyledCell size="medium">
        <Typography variant="bodySmallSemibold">
          <Address address={position.owner} trimAddress />
        </Typography>
      </StyledCell>
      <StyledCell size="medium">
        {showBalances ? (
          <Typography variant="bodySmallSemibold">
            ${formatUsdAmount({ amount: Number(mainBalance?.amount.amountInUSD), intl })}
          </Typography>
        ) : (
          <HiddenNumber size="small" />
        )}
      </StyledCell>
      <StyledCell size="medium">
        {showBalances ? (
          <Typography variant="bodySmallSemibold">${formatUsdAmount({ amount: dailyEarnings, intl })}</Typography>
        ) : (
          <HiddenNumber size="small" />
        )}
      </StyledCell>
      <StyledCell size="small">
        {showBalances ? (
          <Typography variant="bodySmallSemibold">${formatUsdAmount({ amount: profit, intl })}</Typography>
        ) : (
          <HiddenNumber size="small" />
        )}
      </StyledCell>
      {showRewards && (
        <StyledCell size="small">
          <ContainerBox>
            <Tooltip title={<TokenNetworksTooltipTitle balanceTokens={balanceTokens} />}>
              <ComposedTokenIcon
                size={6}
                tokens={rewardTokensData.tokens}
                overlapRatio={0.6}
                marginRight={1.75}
                withShadow
              />
            </Tooltip>
          </ContainerBox>
        </StyledCell>
      )}
    </StyledRow>
  ));
};

const WalletBreakdown = ({ strategy }: WalletBreakdownProps) => {
  const rewardTokensData = React.useMemo(
    () => getTokensWithBalanceAndApy(strategy, strategy.userPositions),
    [strategy]
  );

  const showRewards = !!rewardTokensData.tokens.length;
  return (
    <Accordion disableGutters defaultExpanded sx={{ padding: ({ spacing }) => spacing(4) }} variant="outlined">
      <AccordionSummary>
        <Typography variant="h5Bold">
          <FormattedMessage
            defaultMessage="Breakdown"
            description="earn.strategy-detail.vault-investment-data.breakdown"
          />
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ paddingTop: 0 }}>
        <TableContainer sx={{ backgroundColor: 'transparent' }}>
          <Table sx={{ tableLayout: 'auto' }}>
            <TableHead>
              <StyledTableHeaderRow>
                <StyledCell size="medium">
                  <StyledBodySmallLabelTypography>
                    <FormattedMessage
                      defaultMessage="Wallet"
                      description="earn.strategy-detail.vault-investment-data.breakdown.table.wallet"
                    />
                  </StyledBodySmallLabelTypography>
                </StyledCell>
                <StyledCell size="small">
                  <StyledBodySmallLabelTypography>
                    <FormattedMessage
                      defaultMessage="Invested"
                      description="earn.strategy-detail.vault-investment-data.breakdown.table.invested"
                    />
                  </StyledBodySmallLabelTypography>
                </StyledCell>
                <StyledCell size="small">
                  <StyledBodySmallLabelTypography>
                    <FormattedMessage
                      defaultMessage="Daily Earnings"
                      description="earn.strategy-detail.vault-investment-data.breakdown.table.daily-earnings"
                    />
                  </StyledBodySmallLabelTypography>
                </StyledCell>
                <StyledCell size="small">
                  <StyledBodySmallLabelTypography>
                    <FormattedMessage
                      defaultMessage="Total Earnings"
                      description="earn.strategy-detail.vault-investment-data.breakdown.table.profit"
                    />
                  </StyledBodySmallLabelTypography>
                </StyledCell>
                {showRewards && (
                  <StyledCell size="small">
                    <StyledBodySmallLabelTypography>
                      <FormattedMessage
                        defaultMessage="Rewards"
                        description="earn.strategy-detail.vault-investment-data.breakdown.table.rewards"
                      />
                    </StyledBodySmallLabelTypography>
                  </StyledCell>
                )}
              </StyledTableHeaderRow>
            </TableHead>
            <TableBody>
              <WalletBreakdownTableBody strategy={strategy} showRewards={showRewards} />
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

export default WalletBreakdown;
