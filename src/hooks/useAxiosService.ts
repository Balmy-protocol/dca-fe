import React from 'react';
import WalletContext from 'common/wallet-context';

function useAxiosService() {
  const context = React.useContext(WalletContext);

  return context.axiosClient;
}

export default useAxiosService;
