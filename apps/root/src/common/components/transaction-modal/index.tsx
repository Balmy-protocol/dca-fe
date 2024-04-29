import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import LoadingIndicator from '@common/components/centered-loading-indicator';
import { FormattedMessage } from 'react-intl';
import { Typography, Link, CheckCircleOutlineIcon, CancelIcon, Modal, Button, copyTextToClipboard } from 'ui-library';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { TRANSACTION_ERRORS, getTransactionErrorCode, shouldTrackError } from '@common/utils/errors';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useActiveWallet from '@hooks/useActiveWallet';
import { BaseError } from 'viem';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledLink = styled(Link)``;

const StyledLoadingIndicatorWrapper = styled.div<{ withMargin?: boolean }>`
  ${(props) => props.withMargin && 'margin: 40px;'}
`;

const StyledCheckCircleOutlineIcon = styled(CheckCircleOutlineIcon)``;

interface LoadingConfig {
  content?: React.ReactNode;
}

interface SuccessConfig {
  content?: React.ReactNode;
  hash?: string;
}

export interface ErrorConfig {
  content?: React.ReactNode;
  error?:
    | (BaseError & {
        extraData: unknown;
      })
    | (Error & {
        extraData: unknown;
      });
}

export interface TransactionModalContextValue {
  setLoadingConfig: (config: LoadingConfig) => void;
  setSuccessConfig: (config: SuccessConfig) => void;
  setErrorConfig: (config: ErrorConfig) => void;
  setClosedConfig: () => void;
}

export const TransactionModalContextDefaultValue: TransactionModalContextValue = {
  setLoadingConfig: () => {},
  setSuccessConfig: () => {},
  setErrorConfig: () => {},
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
  const currentNetwork = useCurrentNetwork();
  const activeWallet = useActiveWallet();
  const providerInfo = activeWallet?.providerInfo;

  const LoadingContent = (
    <>
      <Typography variant="h6">
        <FormattedMessage description="Waiting confirmation" defaultMessage="Waiting for confirmation" />
      </Typography>
      <StyledLoadingIndicatorWrapper withMargin>
        <LoadingIndicator size={70} />
      </StyledLoadingIndicatorWrapper>
      {loadingConfig.content}
      <Typography variant="bodyRegular">
        <FormattedMessage
          description="Confirm in wallet"
          defaultMessage="Please check your wallet to confirm this transaction"
        />
      </Typography>
    </>
  );

  const SuccessContent = (
    <>
      <Typography variant="h6">
        <FormattedMessage description="Operation successfull" defaultMessage="Transaction sent!" />
      </Typography>
      <StyledLoadingIndicatorWrapper>
        <Typography variant="h1">
          <StyledCheckCircleOutlineIcon fontSize="inherit" />
        </Typography>
      </StyledLoadingIndicatorWrapper>
      <Typography variant="bodyRegular">{successConfig.content}</Typography>
      {successConfig.hash && (
        <StyledLink
          href={buildEtherscanTransaction(successConfig.hash, currentNetwork.chainId)}
          target="_blank"
          rel="noreferrer"
        >
          <FormattedMessage description="View on etherscan" defaultMessage="View on explorer" />
        </StyledLink>
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
      {!TRANSACTION_ERRORS[getTransactionErrorCode(errorConfig.error)] && (
        <Typography variant="h6">
          <FormattedMessage description="Operation erro" defaultMessage="Error encountered" />
        </Typography>
      )}
      {errorConfig.content}
      <Typography variant="bodyRegular" sx={{ wordBreak: 'break-word' }}>
        {TRANSACTION_ERRORS[getTransactionErrorCode(errorConfig.error)] || (
          <FormattedMessage
            description="unkown_error"
            defaultMessage="Unknown error: {message}"
            values={{ message: errorConfig.error?.message }}
          />
        )}
      </Typography>
      {shouldTrackError(errorConfig.error as unknown as Error) && (
        <Button
          variant="contained"
          sx={{ marginTop: '10px' }}
          onClick={() =>
            copyTextToClipboard(
              `\`\`\`${JSON.stringify({
                ...errorConfig.error,
                providerInfo,
              })}\`\`\``
            )
          }
        >
          <FormattedMessage description="errorEncounteredButtonCopyLog" defaultMessage="Copy error log" />
        </Button>
      )}
    </>
  );

  return (
    <Modal
      open={open}
      showCloseButton={selectedConfig === 'success' || selectedConfig === 'error'}
      onClose={onClose}
      maxWidth="sm"
      actions={[]}
    >
      <StyledContainer>
        {selectedConfig === 'loading' && LoadingContent}
        {selectedConfig === 'success' && SuccessContent}
        {selectedConfig === 'error' && ErrorContent}
      </StyledContainer>
    </Modal>
  );
};

const TransactionModalProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [loadingConfig, setLoadingConfig] = React.useState<LoadingConfig>({ content: null });
  const [successConfig, setSuccessConfig] = React.useState<SuccessConfig>({ content: null });
  const [errorConfig, setErrorConfig] = React.useState<ErrorConfig>({ content: null });
  const [selectedConfig, setSelectedConfig] = React.useState<'loading' | 'success' | 'error' | 'closed'>('closed');

  const setLoadingConfigContext = React.useCallback(
    (config: LoadingConfig) => {
      setLoadingConfig({
        ...defaultLoadingConfig,
        ...config,
      });
      setSelectedConfig('loading');
    },
    [setLoadingConfig, setSelectedConfig]
  );
  const setSuccessConfigContext = React.useCallback(
    (config: SuccessConfig) => {
      setSuccessConfig({
        ...defaultSuccessConfig,
        ...config,
      });
      setSelectedConfig('success');
    },
    [setSuccessConfig, setSelectedConfig]
  );
  const setErrorConfigContext = React.useCallback(
    (config: ErrorConfig) => {
      setErrorConfig({
        ...defaultErrorConfig,
        ...config,
      });
      setSelectedConfig('error');
    },
    [setErrorConfig, setSelectedConfig]
  );
  const setClosedConfigContext = React.useCallback(() => {
    setSelectedConfig('closed');
  }, [setSelectedConfig]);

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
