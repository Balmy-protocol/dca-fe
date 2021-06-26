import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import LoadingIndicator from 'common/centered-loading-indicator';
import { Token, Web3Service, EstimatedPairResponse } from 'types';
import usePromise from 'hooks/usePromise';
import { SetStateCallback } from 'types';

interface LoadingConfig {}

interface SuccessConfig {}

interface ErrorConfig {}

export interface TransactionModalContextValue {
  setLoadingConfig: (config: LoadingConfig) => void;
  setSuccessConfig: (config: SuccessConfig) => void;
  setErrorConfig: (config: ErrorConfig) => void;
  setClosedConfig: () => void;
}

export const TransactionModalContextDefaultValue: TransactionModalContextValue = {
  setLoadingConfig: (config: LoadingConfig) => {},
  setSuccessConfig: (config: SuccessConfig) => {},
  setErrorConfig: (config: ErrorConfig) => {},
  setClosedConfig: () => {},
};

export const TransactionModalContext = React.createContext(TransactionModalContextDefaultValue);

interface CreatePairModalProps {
  selectedConfig: 'loading' | 'success' | 'error' | 'closed';
  loadingConfig: LoadingConfig;
  successConfig: SuccessConfig;
  errorConfig: ErrorConfig;
}

export const TransactionModal = ({
  selectedConfig,
  loadingConfig,
  successConfig,
  errorConfig,
}: CreatePairModalProps) => {
  const open = selectedConfig !== 'closed';

  return (
    <Dialog open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogContent>Boop I am a modal</DialogContent>
    </Dialog>
  );
};

const TransactionModalProvider: React.FC<{}> = ({ children }) => {
  const [loadingConfig, setLoadingConfig] = React.useState<LoadingConfig>({});
  const [successConfig, setSuccessConfig] = React.useState<SuccessConfig>({});
  const [errorConfig, setErrorConfig] = React.useState<ErrorConfig>({});
  const [selectedConfig, setSelectedConfig] = React.useState<'loading' | 'success' | 'error' | 'closed'>('closed');

  const setLoadingConfigContext = (config: LoadingConfig) => {
    setLoadingConfig(config);
    setSelectedConfig('loading');
  };
  const setSuccessConfigContext = (config: SuccessConfig) => {
    setSuccessConfig(config);
    setSelectedConfig('success');
  };
  const setErrorConfigContext = (config: ErrorConfig) => {
    setErrorConfig(config);
    setSelectedConfig('error');
  };
  const setClosedConfigContext = () => {
    setSelectedConfig('closed');
  };

  return (
    <TransactionModalContext.Provider
      value={{
        setLoadingConfig: setLoadingConfigContext,
        setSuccessConfig: setSuccessConfigContext,
        setErrorConfig: setErrorConfigContext,
        setClosedConfig: setClosedConfigContext,
      }}
    >
      {children}
      <TransactionModal
        selectedConfig={selectedConfig}
        successConfig={successConfig}
        errorConfig={errorConfig}
        loadingConfig={loadingConfig}
      />
    </TransactionModalContext.Provider>
  );
};

export default TransactionModalProvider;
