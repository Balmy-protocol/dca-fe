import useWeb3Service from './useWeb3Service';

function useCampaignService() {
  const web3Service = useWeb3Service();

  return web3Service.getCampaignService();
}

export default useCampaignService;
