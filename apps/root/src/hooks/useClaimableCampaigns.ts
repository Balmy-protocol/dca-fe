import React from 'react';
import isEqual from 'lodash/isEqual';
import find from 'lodash/find';
import compact from 'lodash/compact';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { parseUsdPrice } from '@common/utils/currency';
import { Campaigns, Token, TokenType } from '@types';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import useAccount from './useAccount';
import useCampaignService from './useCampaignService';
import useGetToken from './useGetToken';

function useClaimableCampaigns(): [Campaigns | undefined, boolean, string?] {
  const account = useAccount();
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
  const prevAccount = usePrevious(account);
  const prevResult = usePrevious(result, false);
  const campaignService = useCampaignService();
  const isLoadingTokenList = useIsLoadingAllTokenLists();
  const getToken = useGetToken();

  React.useEffect(() => {
    async function callPromise() {
      if (!account) {
        return;
      }

      try {
        const promiseResult = await campaignService.getCampaigns(account);

        const parsedCampaigns = promiseResult.map((campaign) => {
          const tokens = compact(campaign.tokens.map(({ address }) => getToken(address)));

          return {
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
              };

              return {
                ...fullToken,
                balance: token.balance,
                balanceUSD: parseUsdPrice(fullToken, token.balance, token.usdPrice),
              };
            }),
          };
        });

        setState({ isLoading: false, result: compact(parsedCampaigns), error: undefined });
      } catch (e) {
        setState({ result: undefined, error: e as string, isLoading: false });
      }
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(account, prevAccount) ||
      !isEqual(prevPendingTrans, hasPendingTransactions)
    ) {
      if (account && !isLoadingTokenList) {
        setState({ isLoading: true, result: undefined, error: undefined });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        callPromise();
      }
    }
  }, [
    isLoading,
    result,
    error,
    hasPendingTransactions,
    prevAccount,
    account,
    isLoadingTokenList,
    getToken,
    prevPendingTrans,
  ]);

  return [result || prevResult, isLoading, error];
}

export default useClaimableCampaigns;
