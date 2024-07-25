import React from 'react';
import useServiceEvents from '@hooks/useServiceEvents';
import useHacksLandingService from './useHacksLandingService';
import { DisplayAllowance, SavedAllowance } from '@pages/hacks/types';
import HacksLandinService, { HacksLandingServiceData } from '@services/hacksLandingService';
import useTokenList from '@hooks/useTokenList';
import { toToken } from '@common/utils/currency';
import { Address, TokenList, TokenListId } from 'common-types';

const parseUserAllowances = ({
  userAllowances,
  tokenList,
}: {
  userAllowances: SavedAllowance;
  tokenList: TokenList;
}) => {
  const newAllowances: DisplayAllowance = {};

  Object.entries(userAllowances).forEach(([chainIdString, chainAllowances]) => {
    const chainId = Number(chainIdString);
    if (!newAllowances[chainId]) {
      newAllowances[chainId] = { isLoading: userAllowances[chainId].isLoading, allowances: {} };
    }
    Object.entries(chainAllowances.allowances).forEach(([walletAddress, contractAllowances]) => {
      if (!newAllowances[chainId].allowances[walletAddress as Address]) {
        newAllowances[chainId].allowances[walletAddress as Address] = {};
      }
      Object.entries(contractAllowances).forEach(([contractAddress, tokenAllowances]) => {
        if (!newAllowances[chainId].allowances[walletAddress as Address][contractAddress as Address]) {
          newAllowances[chainId].allowances[walletAddress as Address][contractAddress as Address] = {};
        }
        Object.entries(tokenAllowances).forEach(([tokenAddress, amount]) => {
          const tokenListId = `${chainId}-${tokenAddress}` as TokenListId;
          const token = tokenList[tokenListId] || toToken({ address: tokenAddress, chainId, name: tokenAddress });

          newAllowances[chainId].allowances[walletAddress as Address][contractAddress as Address][
            tokenAddress as Address
          ] = {
            token,
            amount,
          };
        });
      });
    });
  });

  return newAllowances;
};

export default function useWalletshackasAllowance() {
  const hacksLandingService = useHacksLandingService();
  const tokenList = useTokenList({ curateList: false });

  const walletAllowances = useServiceEvents<HacksLandingServiceData, HacksLandinService, 'getWalletAllowances'>(
    hacksLandingService,
    'getWalletAllowances'
  );

  const parsedHacksLandings = React.useMemo<DisplayAllowance>(
    () => parseUserAllowances({ userAllowances: walletAllowances, tokenList }),
    [walletAllowances, tokenList]
  );

  return parsedHacksLandings;
}
