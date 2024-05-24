import useWeb3Service from '@hooks/useWeb3Service';

export default function useEarnService() {
  const web3Service = useWeb3Service();

  return web3Service.getEarnService();
}
