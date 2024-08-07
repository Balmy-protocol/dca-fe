import React from 'react';
import { ContainerBox, StyledNonFormContainer } from 'ui-library';
import EarnFAQ from '../../components/faq';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { EARN_PORTFOLIO } from '@constants/routes';
import NetWorth from '@common/components/net-worth';
import { WalletOptionValues, ALL_WALLETS } from '@common/components/wallet-selector';
import EarnPortfolioFinancialData from '../components/financial-data';
import StrategiesTable from '@pages/earn/components/strategies-table';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import useEarnPositions from '@hooks/earn/useEarnPositions';
import { portfolioColumnConfigs } from '@pages/earn/components/strategies-table/components/columns';
import { EarnPosition, StrategyId } from 'common-types';
import useFilteredStrategies from '@hooks/earn/useFilteredStrategies';

const variant = StrategiesTableVariants.USER_STRATEGIES;

const EarnPortfolioFrame = () => {
  const [selectedWalletOption, setSelectedWalletOption] = React.useState<WalletOptionValues>(ALL_WALLETS);
  const { userStrategies, hasFetchedUserStrategies } = useEarnPositions();

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(changeRoute(EARN_PORTFOLIO.key));
  }, []);

  const groupedPositionsByStrategy = React.useMemo(() => {
    const strategiesRecord = userStrategies.reduce<Record<StrategyId, EarnPosition[]>>((acc, userStrat) => {
      const key = userStrat.strategy.id;
      if (acc[key]) {
        acc[key].push(userStrat);
      } else {
        // eslint-disable-next-line no-param-reassign
        acc[key] = [userStrat];
      }
      return acc;
    }, {});

    return Object.values(strategiesRecord);
  }, [userStrategies]);

  const filteredStrategies = useFilteredStrategies({
    variant,
    strategies: groupedPositionsByStrategy,
    columns: portfolioColumnConfigs,
  });

  return (
    <StyledNonFormContainer flexDirection="column" flexWrap="nowrap">
      <ContainerBox flexDirection="column" gap={32}>
        <ContainerBox flexDirection="column" gap={5}>
          <NetWorth
            walletSelector={{
              options: {
                allowAllWalletsOption: true,
                onSelectWalletOption: setSelectedWalletOption,
                selectedWalletOption,
              },
            }}
          />
          <ContainerBox flexDirection="column" gap={16}>
            <EarnPortfolioFinancialData userStrategies={userStrategies} isLoading={!hasFetchedUserStrategies} />
            <StrategiesTable
              columns={portfolioColumnConfigs}
              variant={variant}
              strategies={filteredStrategies}
              isLoading={!hasFetchedUserStrategies}
            />
          </ContainerBox>
        </ContainerBox>
        <EarnFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};
export default EarnPortfolioFrame;
