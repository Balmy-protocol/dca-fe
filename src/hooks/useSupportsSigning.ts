import useWeb3Service from './useWeb3Service';

function useSupportsSigning(): boolean {
  const web3Service = useWeb3Service();

  return web3Service.getSignSupport();
}

export default useSupportsSigning;
