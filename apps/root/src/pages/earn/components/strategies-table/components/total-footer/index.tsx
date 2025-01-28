import React from 'react';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { StrategyColumnConfig, StrategyColumnKeys } from '../columns';
import { TableStrategy } from '../..';
import { TableFooter, TableRow, ContainerBox, TableCell, Typography, Hidden, DividerBorder1, colors } from 'ui-library';
import styled from 'styled-components';
import { EarnPosition } from 'common-types';
import { flatten } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { usdFormatter } from '@common/utils/parsing';
import { parseUserStrategiesFinancialData } from '@common/utils/earn/parsing';

interface TotalFooterProps<T extends StrategiesTableVariants> {
  columns: StrategyColumnConfig<T>[];
  strategies: TableStrategy<T>[];
  variant: T;
  isEmptyPortfolio: boolean;
}

const StyledTableFooter = styled(TableFooter)<{ $isPortfolio?: boolean }>`
  position: relative;
  margin-top: ${({ theme }) => theme.spacing(4)};
  left: 0;
  bottom: 0;
  z-index: 2;
  position: sticky;
`;

const StyledTotalRow = styled(TableRow)`
  background: ${({ theme: { palette } }) => colors[palette.mode].background.quarteryNoAlpha} !important;
  &:hover {
    background: ${({ theme: { palette } }) => colors[palette.mode].background.quarteryNoAlpha} !important;
  }
`;

const StyledDividerContainer = styled(ContainerBox)`
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
`;

const StyledTotalsTableCell = styled(TableCell)`
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const TotalFooter = <T extends StrategiesTableVariants>({
  columns,
  strategies,
  variant,
  isEmptyPortfolio,
}: TotalFooterProps<T>) => {
  const totalInvested = React.useMemo(() => {
    if (variant === StrategiesTableVariants.ALL_STRATEGIES) {
      return {
        totalInvestedUsd: 0,
        currentProfitUsd: { asset: 0, total: 0 },
        currentProfitRate: { asset: 0, total: 0 },
        earnings: {},
      };
    }
    const userStrategies = strategies as EarnPosition[][];

    return parseUserStrategiesFinancialData(flatten(userStrategies));
  }, [strategies]);

  return (
    <StyledTableFooter>
      <StyledTotalRow>
        <StyledTotalsTableCell>
          <Typography variant="bodyBold">
            <FormattedMessage id="strategies-table.total" defaultMessage="Total" />
          </Typography>
        </StyledTotalsTableCell>
        {columns.slice(1).map((column) => (
          <Hidden {...column.hiddenProps} key={column.key}>
            <StyledTotalsTableCell key={column.key}>
              {column.key === StrategyColumnKeys.TOTAL_INVESTED ? (
                <Typography variant="bodyBold" color={isEmptyPortfolio ? 'text.disabled' : undefined}>
                  {`$${usdFormatter(totalInvested.totalInvestedUsd)}`}
                </Typography>
              ) : null}
              {column.key === StrategyColumnKeys.CURRENT_PROFIT ? (
                <Typography variant="bodyBold" color={isEmptyPortfolio ? 'text.disabled' : 'success.dark'}>
                  {usdFormatter(totalInvested.currentProfitUsd.asset)}
                </Typography>
              ) : null}
            </StyledTotalsTableCell>
          </Hidden>
        ))}
        <StyledDividerContainer flexDirection="column" fullWidth>
          <DividerBorder1 />
        </StyledDividerContainer>
      </StyledTotalRow>
    </StyledTableFooter>
  );
};

export default TotalFooter;
