import React from 'react';
import { ContainerBox, StyledNonFormContainer } from 'ui-library';
import EarnFAQ from '../../components/faq';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { EARN_PORTFOLIO } from '@constants/routes';
import NetWorth from '@common/components/net-worth';
import { WalletOptionValues, ALL_WALLETS } from '@common/components/wallet-selector';
import EarnPortfolioFinancialData from '../components/financial-data';
import EarnPositionsTable from '../components/earn-positions-table';

const EarnPortfolioFrame = () => {
  const [selectedWalletOption, setSelectedWalletOption] = React.useState<WalletOptionValues>(ALL_WALLETS);

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(changeRoute(EARN_PORTFOLIO.key));
  }, []);

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
            <EarnPortfolioFinancialData />
            <EarnPositionsTable />
          </ContainerBox>
        </ContainerBox>
        <EarnFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};
export default EarnPortfolioFrame;