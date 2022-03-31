import useTokenList from './useTokenList';

function useToken(tokenAddress: string) {
  const tokenList = useTokenList();

  return tokenList[tokenAddress];
}

export default useToken;
