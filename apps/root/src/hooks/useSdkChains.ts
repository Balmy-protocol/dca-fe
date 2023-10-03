import React from 'react';
import useSdkService from '@hooks/useSdkService';

function useSdkChains() {
  const sdkService = useSdkService();

  return React.useMemo(() => sdkService.getSupportedChains(), []);
}

export default useSdkChains;
