import React from 'react';
import isEqual from 'lodash/isEqual';
import find from 'lodash/find';
import compact from 'lodash/compact';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { parseUsdPrice } from '@common/utils/currency';
import { Campaigns, Token, TokenType } from '@types';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import useCampaignService from './useCampaignService';
import useGetToken from './useGetToken';
import useWallets from './useWallets';

function useClaimableCampaigns(): [Campaigns | undefined, boolean, string?] {
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: Campaigns;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const hasPendingTransactions = useHasPendingTransactions();
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevResult = usePrevious(result, false);
  const campaignService = useCampaignService();
  const isLoadingTokenList = useIsLoadingAllTokenLists();
  const getToken = useGetToken();
  const wallets = useWallets();

  React.useEffect(() => {
    async function callPromise() {
      try {
        const promiseResult = await Promise.allSettled(
          wallets.map(({ address }) => campaignService.getCampaigns(address))
        );

        const parsedCampaigns = compact(
          promiseResult.map((campaigns) => (campaigns.status === 'fulfilled' ? campaigns.value : undefined))
        ).reduce<Campaigns>((acc, campaigns) => {
          campaigns.forEach((campaign) => {
            const tokens = compact(campaign.tokens.map(({ address }) => getToken(address)));

            acc.push({
              ...campaign,
              tokens: campaign.tokens.map((token) => {
                const foundToken = find(tokens, { address: token.address });

                const fullToken: Token = {
                  address: token.address,
                  decimals: token.decimals,
                  name: token.name,
                  symbol: token.symbol,
                  chainId: campaign.chainId,
                  type: TokenType.BASE,
                  underlyingTokens: [],
                  ...(foundToken || {}),
                  chainAddresses: [],
                };

                return {
                  ...fullToken,
                  usdPrice: token.usdPrice,
                  balance: token.balance,
                  balanceUSD: parseUsdPrice(fullToken, token.balance, token.usdPrice),
                };
              }),
            });
          });

          return acc;
        }, []);

        setState({ isLoading: false, result: compact(parsedCampaigns), error: undefined });
      } catch (e) {
        setState({ result: undefined, error: e as string, isLoading: false });
      }
    }

    if ((!isLoading && !result && !error) || !isEqual(prevPendingTrans, hasPendingTransactions)) {
      if (!isLoadingTokenList) {
        setState({ isLoading: true, result: undefined, error: undefined });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        callPromise();
      }
    }
  }, [isLoading, result, error, hasPendingTransactions, isLoadingTokenList, getToken, prevPendingTrans]);

  return [result || prevResult, isLoading, error];
}

export default useClaimableCampaigns;
