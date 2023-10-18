import React from 'react';
import useLabelService from './useLabelService';
import { AccountLabels } from '@types';
import { isEqual } from 'lodash';
import useAccountService from './useAccountService';

function useStoredLabels() {
  const labelService = useLabelService();
  const accountService = useAccountService();
  const [storedLabels, setStoredLabels] = React.useState<AccountLabels>(labelService.getStoredLabels());

  const currentWallets = accountService.getWallets();
  const prevLabelsRef = React.useRef<AccountLabels>(storedLabels);

  React.useEffect(() => {
    const currentLabels = labelService.getStoredLabels();
    if (!isEqual(prevLabelsRef.current, currentLabels)) {
      setStoredLabels(currentLabels);
      prevLabelsRef.current = currentLabels;
    }
  }, [labelService, currentWallets]);

  return storedLabels;
}

export default useStoredLabels;
