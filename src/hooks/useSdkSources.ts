import useSdkService from 'hooks/useSdkService';

function useSdkDexes() {
  const sdkService = useSdkService();

  return sdkService.getSupportedDexes();
}

export default useSdkDexes;
