import React from 'react';
import { useIntl } from 'react-intl';
import useActiveWallet from './useActiveWallet';
import useTokenList from './useTokenList';
import { validateAddress } from '@common/utils/parsing';

function useValidateTransferRecipient(recipient: string | null) {
  const activeWallet = useActiveWallet();
  const tokenList = useTokenList({ allowAllTokens: true, filterChainId: true });
  const intl = useIntl();
  const [validationResult, setValidationResult] = React.useState({
    isValidRecipient: false,
    errorMessage: '',
  });

  const validateRecipient = React.useCallback(() => {
    if (recipient === '' || recipient === null) {
      setValidationResult({
        isValidRecipient: false,
        errorMessage: '',
      });
      return;
    }

    if (!validateAddress(recipient)) {
      setValidationResult({
        isValidRecipient: false,
        errorMessage: intl.formatMessage({
          defaultMessage: 'This is not a valid address',
          description: 'errorInvalidAddress',
        }),
      });
      return;
    }

    if (recipient.toLowerCase() === activeWallet?.address.toLowerCase()) {
      setValidationResult({
        isValidRecipient: false,
        errorMessage: intl.formatMessage({
          defaultMessage: 'Transfer address cannot be the same as your address',
          description: 'errorSameAddress',
        }),
      });
      return;
    }

    if (tokenList[recipient]) {
      setValidationResult({
        isValidRecipient: false,
        errorMessage: intl.formatMessage({
          defaultMessage: 'Transfer address cannot be a token address',
          description: 'errorTokenAsRecipient',
        }),
      });
      return;
    }

    setValidationResult({
      isValidRecipient: true,
      errorMessage: '',
    });
  }, [recipient, activeWallet, tokenList]);

  React.useEffect(() => {
    validateRecipient();
  }, [recipient, activeWallet, tokenList]);

  return validationResult;
}

export default useValidateTransferRecipient;
