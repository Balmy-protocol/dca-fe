import useSdkService from 'hooks/useSdkService';

function usdSdkChains() {
  const sdkService = useSdkService();

  return sdkService.getSupportedChains();
}

export default usdSdkChains;
