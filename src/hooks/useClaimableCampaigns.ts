import React from 'react';
import isEqual from 'lodash/isEqual';
import compact from 'lodash/compact';
import usePrevious from 'hooks/usePrevious';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { useBlockNumber } from 'state/block-number/hooks';
import { parseUsdPrice } from 'utils/currency';
import { Campaigns } from 'types';
import useCurrentNetwork from './useCurrentNetwork';
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
  const currentNetwork = useCurrentNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevResult = usePrevious(result, false);
  const campaignService = useCampaignService();
  const getToken = useGetToken();

  React.useEffect(() => {
    async function callPromise() {
      try {
        const promiseResult = await campaignService.getCampaigns();

        const parsedCampaigns = promiseResult.map((campaign) => {
          const tokens = compact(campaign.tokens.map(({ address }) => getToken(address)));

          // there is some token that we actually havent been able to get
          if (campaign.tokens.length !== tokens.length) {
            return null;
          }

          return {
            ...campaign,
            tokens: tokens.map((token, index) => ({
              ...token,
              balance: campaign.tokens[index].balance,
              balanceUSD: parseUsdPrice(token, campaign.tokens[index].balance, campaign.tokens[index].usdPrice),
            })),
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
      !isEqual(prevPendingTrans, hasPendingTransactions) ||
      (blockNumber &&
        prevBlockNumber &&
        blockNumber !== -1 &&
        prevBlockNumber !== -1 &&
        !isEqual(prevBlockNumber, blockNumber))
    ) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    isLoading,
    result,
    error,
    hasPendingTransactions,
    prevAccount,
    account,
    prevBlockNumber,
    blockNumber,
    prevPendingTrans,
  ]);

  return [result || prevResult, isLoading, error];
}

export default useClaimableCampaigns;
