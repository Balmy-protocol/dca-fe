import useWeb3Service from './useWeb3Service';

function useArcx() {
  const web3Service = useWeb3Service();

  return web3Service.getArcxClient();
}

export default useArcx;
