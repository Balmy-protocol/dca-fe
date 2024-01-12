import React from 'react';
import { defineMessage, useIntl } from 'react-intl';
import useActiveWallet from './useActiveWallet';
import useTokenList from './useTokenList';
import { validateAddress } from '@common/utils/parsing';

export interface ValidationOutput {
  isValidAddress: boolean;
  errorMessage: string;
}

function useValidateAddress({
  address,
  restrictActiveWallet,
  additionalValidations = [],
}: {
  address: string | null;
  restrictActiveWallet?: boolean;
  additionalValidations?: ((address: string) => ValidationOutput)[];
}) {
  const activeWallet = useActiveWallet();
  const tokenList = useTokenList({ allowAllTokens: true, filterChainId: true });
  const intl = useIntl();
  const [validationResult, setValidationResult] = React.useState<ValidationOutput>({
    isValidAddress: false,
    errorMessage: '',
  });

  React.useEffect(() => {
    if (address === '' || address === null) {
      setValidationResult({
        isValidAddress: false,
        errorMessage: '',
      });
      return;
    }

    if (!validateAddress(address)) {
      setValidationResult({
        isValidAddress: false,
        errorMessage: intl.formatMessage(
          defineMessage({
            defaultMessage: 'This is not a valid address',
            description: 'errorInvalidAddress',
          })
        ),
      });
      return;
    }

    if (address.toLowerCase() === activeWallet?.address.toLowerCase() && restrictActiveWallet) {
      setValidationResult({
        isValidAddress: false,
        errorMessage: intl.formatMessage(
          defineMessage({
            defaultMessage: 'Transfer address cannot be the same as your address',
            description: 'errorSameAddress',
          })
        ),
      });
      return;
    }

    if (tokenList[address]) {
      setValidationResult({
        isValidAddress: false,
        errorMessage: intl.formatMessage(
          defineMessage({
            defaultMessage: 'Transfer address cannot be a token address',
            description: 'errorTokenAsRecipient',
          })
        ),
      });
      return;
    }

    for (const validate of additionalValidations) {
      const result = validate(address);
      if (!result.isValidAddress) {
        setValidationResult({
          isValidAddress: false,
          errorMessage: result.errorMessage,
        });
        return;
      }
    }

    setValidationResult({
      isValidAddress: true,
      errorMessage: '',
    });
  }, [address, activeWallet, tokenList]);

  return validationResult;
}

export default useValidateAddress;
