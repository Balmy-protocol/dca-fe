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
import Link from '@material-ui/core/Link';
import { Token, Web3Service, EstimatedPairResponse } from 'types';
import usePromise from 'hooks/usePromise';
import { SetStateCallback } from 'types';
import { buildEtherscanTransaction } from 'utils/etherscan';
import { TRANSACTION_ERRORS } from 'utils/errors';

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
  content?: React.ReactNode;
}

interface SuccessConfig {
  content?: React.ReactNode;
  hash?: string;
}

interface ErrorConfig {
  content?: React.ReactNode;
  error?: {
    code: number;
    message: string;
  };
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

const defaultLoadingConfig: LoadingConfig = {
  content: null,
};

const defaultSuccessConfig: SuccessConfig = {
  content: null,
};

const defaultErrorConfig: ErrorConfig = {
  content: null,
  error: { message: 'something went wrong', code: -9999999 },
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
      {successConfig.hash && (
        <Link href={buildEtherscanTransaction(successConfig.hash)} target="_blank" rel="noreferrer">
          <FormattedMessage description="View on etherscan" defaultMessage="View on etherscan" />
        </Link>
      )}
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
      <Typography variant="subtitle2">
        {TRANSACTION_ERRORS[errorConfig.error?.code as keyof typeof TRANSACTION_ERRORS] || (
          <FormattedMessage description="unkown_error" defaultMessage={errorConfig.error?.message} />
        )}
      </Typography>
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
    setLoadingConfig({
      ...defaultLoadingConfig,
      ...config,
    });
    setSelectedConfig('loading');
  };
  const setSuccessConfigContext = (config: SuccessConfig) => {
    setSuccessConfig({
      ...defaultSuccessConfig,
      ...config,
    });
    setSelectedConfig('success');
  };
  const setErrorConfigContext = (config: ErrorConfig) => {
    setErrorConfig({
      ...defaultErrorConfig,
      ...config,
    });
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
