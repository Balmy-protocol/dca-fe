import useWeb3Service from '@hooks/useWeb3Service';

const useTierService = () => {
  const web3Service = useWeb3Service();
  return web3Service.getTierService();
};

export default useTierService;
