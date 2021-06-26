import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import LoadingIndicator from 'common/centered-loading-indicator';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { Token, Web3Service, EstimatedPairResponse } from 'types';
import usePromise from 'hooks/usePromise';
import { SetStateCallback } from 'types';

const StyledDialog = styled(Dialog)`
  display: flex;
  flex-direction: column;
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const StyledDialogContent = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const StyledLoadingIndicatorWrapper = styled.div`
  margin: 40px;
`;

const StyledCheckCircleOutlineIcon = styled(CheckCircleOutlineIcon)`
  color: rgb(17 147 34);
`;

interface LoadingConfig {
  content: React.ReactNode;
}

interface SuccessConfig {
  content: React.ReactNode;
}

interface ErrorConfig {
  content: React.ReactNode;
}

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
  onClose: () => void;
}

export const TransactionModal = ({
  selectedConfig,
  loadingConfig,
  successConfig,
  errorConfig,
  onClose,
}: CreatePairModalProps) => {
  const open = selectedConfig !== 'closed';

  const LoadingContent = (
    <>
      <StyledLoadingIndicatorWrapper>
        <LoadingIndicator size={70} />
      </StyledLoadingIndicatorWrapper>
      <Typography variant="h6">
        <FormattedMessage description="Waiting confirmation" defaultMessage="Waiting for confirmation" />
      </Typography>
      {loadingConfig.content}
      <Typography variant="body2">
        <FormattedMessage description="Confirm in wallet" defaultMessage="Confirm this transaction in your wallet" />
      </Typography>
    </>
  );

  const SuccessContent = (
    <>
      <StyledLoadingIndicatorWrapper>
        <Typography variant="h1">
          <StyledCheckCircleOutlineIcon fontSize="inherit" />
        </Typography>
      </StyledLoadingIndicatorWrapper>
      <Typography variant="h6">
        <FormattedMessage description="Operation successfull" defaultMessage="The operation was successfull!" />
      </Typography>
      {successConfig.content}
    </>
  );

  const ErrorContent = (
    <>
      <StyledLoadingIndicatorWrapper>
        <Typography variant="h1">
          <ErrorOutlineIcon color="error" fontSize="inherit" />
        </Typography>
      </StyledLoadingIndicatorWrapper>
      <Typography variant="h6">
        <FormattedMessage description="Operation erro" defaultMessage="Error encountered" />
      </Typography>
      {errorConfig.content}
    </>
  );
  return (
    <StyledDialog open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <StyledDialogContent>
        {selectedConfig === 'loading' && LoadingContent}
        {selectedConfig === 'success' && SuccessContent}
        {selectedConfig === 'error' && ErrorContent}
      </StyledDialogContent>
      {selectedConfig === 'success' || selectedConfig === 'error' ? (
        <DialogActions>
          <Button onClick={onClose} variant="contained" color="primary" size="large" style={{ width: '100%' }}>
            <FormattedMessage description="Close" defaultMessage="Close" />
          </Button>
        </DialogActions>
      ) : null}
    </StyledDialog>
  );
};

const TransactionModalProvider: React.FC<{}> = ({ children }) => {
  const [loadingConfig, setLoadingConfig] = React.useState<LoadingConfig>({ content: null });
  const [successConfig, setSuccessConfig] = React.useState<SuccessConfig>({ content: null });
  const [errorConfig, setErrorConfig] = React.useState<ErrorConfig>({ content: null });
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
        onClose={setClosedConfigContext}
      />
    </TransactionModalContext.Provider>
  );
};

export default TransactionModalProvider;
