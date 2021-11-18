import React from 'react';
import { AxiosResponse } from 'axios';
import { TOKEN_LISTS } from 'config/constants';
import { getURLFromQuery } from 'utils/parsing';
import { TokenListResponse, TokensLists, TokenList } from 'types';
import useAxiosService from './useAxiosService';

function useTokensLists() {
  const [tokensLists, setTokensLists] = React.useState<Record<string, TokensLists>>({});
  const axiosClient = useAxiosService();

  React.useEffect(() => {
    const getTokensLists = async () => {
      const tokensPromises: Promise<AxiosResponse<TokenListResponse>>[] = [];
      Object.keys(TOKEN_LISTS).forEach((tokenListUrl) =>
        tokensPromises.push(axiosClient.get(getURLFromQuery(tokenListUrl)))
      );

      const values = await Promise.all(tokensPromises);

      const mappedTokensLists = values.map((tokensListsResponse) => {
        const tokens: TokenList = {};

        tokensListsResponse.data.tokens.forEach((token) => {
          tokens[token.address.toLowerCase()] = {
            ...token,
            address: token.address.toLowerCase(),
          };
        });

        return {
          ...tokensListsResponse.data,
          tokens,
        };
      });

      const newTokensLists: Record<string, TokensLists> = {};

      Object.keys(TOKEN_LISTS).forEach((tokenListUrl, index) => {
        newTokensLists[tokenListUrl] = mappedTokensLists[index];
      });

      setTokensLists(newTokensLists);
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getTokensLists();
  }, [axiosClient]);

  return tokensLists;
}

export default useTokensLists;
