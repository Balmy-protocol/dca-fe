import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import LoadingIndicator from 'common/centered-loading-indicator';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CancelIcon from '@material-ui/icons/Cancel';
import Link from '@material-ui/core/Link';
import { buildEtherscanTransaction } from 'utils/etherscan';
import { TRANSACTION_ERRORS } from 'utils/errors';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  paper: {
    borderRadius: 20,
  },
});

const StyledDialogContent = styled(DialogContent)<{ withActions: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${(props) => (props.withActions ? '40px 72px 20px 72px' : '40px 72px')} !important;
  align-items: center;
  justify-content: center;
`;

const StyledDialogActions = styled(DialogActions)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 32px 32px 32px;
`;

const StyledDialog = styled(Dialog)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const StyledLoadingIndicatorWrapper = styled.div<{ withMargin?: boolean }>`
  ${(props) => props.withMargin && 'margin: 40px;'}
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
  const classes = useStyles();

  const LoadingContent = (
    <>
      <Typography variant="h6">
        <FormattedMessage description="Waiting confirmation" defaultMessage="Waiting for confirmation" />
      </Typography>
      <StyledLoadingIndicatorWrapper withMargin>
        <LoadingIndicator size={70} />
      </StyledLoadingIndicatorWrapper>
      {loadingConfig.content}
      <Typography variant="body1">
        <FormattedMessage description="Confirm in wallet" defaultMessage="Confirm this transaction in your wallet" />
      </Typography>
    </>
  );

  const SuccessContent = (
    <>
      <Typography variant="h6">
        <FormattedMessage description="Operation successfull" defaultMessage="Confirmation success!" />
      </Typography>
      <StyledLoadingIndicatorWrapper>
        <Typography variant="h1">
          <StyledCheckCircleOutlineIcon fontSize="inherit" />
        </Typography>
      </StyledLoadingIndicatorWrapper>
      <Typography variant="body1">{successConfig.content}</Typography>
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
          <CancelIcon color="error" fontSize="inherit" />
        </Typography>
      </StyledLoadingIndicatorWrapper>
      {!TRANSACTION_ERRORS[errorConfig.error?.code as keyof typeof TRANSACTION_ERRORS] && (
        <Typography variant="h6">
          <FormattedMessage description="Operation erro" defaultMessage="Error encountered" />
        </Typography>
      )}
      {errorConfig.content}
      <Typography variant="body1">
        {TRANSACTION_ERRORS[errorConfig.error?.code as keyof typeof TRANSACTION_ERRORS] || (
          <FormattedMessage
            description="unkown_error"
            defaultMessage="Unknown error: {message}"
            values={{ message: errorConfig.error?.message }}
          />
        )}
      </Typography>
    </>
  );
  return (
    <StyledDialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="xs"
      classes={{ paper: classes.paper }}
    >
      <StyledDialogContent withActions={selectedConfig === 'success' || selectedConfig === 'error'}>
        {selectedConfig === 'loading' && LoadingContent}
        {selectedConfig === 'success' && SuccessContent}
        {selectedConfig === 'error' && ErrorContent}
      </StyledDialogContent>
      {selectedConfig === 'success' || selectedConfig === 'error' ? (
        <StyledDialogActions>
          <Button onClick={onClose} variant="outlined" color="default" size="large" style={{ width: '100%' }}>
            <FormattedMessage description="Close" defaultMessage="Close" />
          </Button>
        </StyledDialogActions>
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
