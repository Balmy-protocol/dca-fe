import React from 'react';
import useLabelService from './useLabelService';
import { debounce } from 'lodash';
import useStoredEnsNames from './useStoredEnsNames';
import { isAddress } from 'viem';
import { normalize } from 'viem/ens';

function useEnsAddress(rawEnsName: string) {
  const [isLoadingEnsAddress, setIsLoadingEnsAddress] = React.useState(false);
  const labelService = useLabelService();
  const ensNames = useStoredEnsNames();

  const ensName = React.useMemo(() => {
    try {
      return rawEnsName ? normalize(rawEnsName) : '';
    } catch (error) {
      return '';
    }
  }, [rawEnsName]);

  const ensAddress = React.useMemo(
    () => Object.entries(ensNames).find(([, ens]) => ens === ensName)?.[0],
    [ensNames, ensName]
  );

  const debouncedLookup = React.useCallback(
    debounce(async (value: string) => {
      try {
        await labelService.fetchEnsAddress(value);
        // We wait for 200ms to ensure the ens address is set in the service and hooks
        await new Promise((resolve) => setTimeout(resolve, 100));
      } finally {
        setIsLoadingEnsAddress(false);
      }
    }, 2000),
    [labelService]
  );

  const handleEnsNameSearch = React.useCallback(
    (newValue: string) => {
      if (!newValue || isAddress(newValue)) {
        setIsLoadingEnsAddress(false);
        return;
      }

      setIsLoadingEnsAddress(true);
      void debouncedLookup(newValue);
    },
    [debouncedLookup]
  );

  return React.useMemo(
    () => ({ ensAddress, handleEnsNameSearch, isLoadingEnsAddress }),
    [ensAddress, handleEnsNameSearch, isLoadingEnsAddress]
  );
}

export default useEnsAddress;
