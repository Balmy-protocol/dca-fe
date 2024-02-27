import React from 'react';
import { defineMessage, useIntl } from 'react-intl';
import useActiveWallet from './useActiveWallet';
import useTokenList from './useTokenList';
import { validateAddress } from '@common/utils/parsing';
import useStoredContactList from './useStoredContactList';
import findKey from 'lodash/findKey';
import { TokenListId } from 'common-types';

const inputRegex = RegExp(/^[A-Fa-f0-9x]*$/);

function useValidateAddress({
  restrictActiveWallet,
  restrictContactRepetition,
  defaultValue,
}: {
  restrictActiveWallet?: boolean;
  restrictContactRepetition?: boolean;
  allowHelperMatchingContactAddress?: boolean;
  defaultValue?: string | null;
}) {
  const activeWallet = useActiveWallet();
  const contactList = useStoredContactList();
  const tokenList = useTokenList({});
  const intl = useIntl();

  const [address, setAddress] = React.useState('');
  const [validationResult, setValidationResult] = React.useState<{
    isValidAddress: boolean;
    errorMessage: string;
  }>({
    isValidAddress: false,
    errorMessage: '',
  });

  React.useEffect(() => {
    if (defaultValue) {
      setAddress(defaultValue);
    }
  }, [defaultValue, setAddress]);

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

    const key = findKey(tokenList, (token) => token.address === address) as TokenListId;

    if (tokenList[key]) {
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

    if (contactList.some((contact) => contact.address === address.toLowerCase()) && restrictContactRepetition) {
      setValidationResult({
        errorMessage: intl.formatMessage(
          defineMessage({
            defaultMessage: 'Contact already exists',
            description: 'contactAlreadyExists',
          })
        ),
        isValidAddress: false,
      });
      return;
    }

    setValidationResult({
      isValidAddress: true,
      errorMessage: '',
    });
  }, [address, activeWallet, tokenList]);

  const onChangeAddress = (nextValue: string) => {
    if (!inputRegex.test(nextValue)) {
      return;
    }
    setAddress(nextValue);
  };

  return { validationResult, address, setAddress: onChangeAddress };
}

export default useValidateAddress;
