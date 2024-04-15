import React from 'react';
import { useAppDispatch } from '@hooks/state';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { setRecipient } from '@state/transfer/actions';
import { useTransferState } from '@state/transfer/hooks';
import { defineMessage, useIntl } from 'react-intl';
import useValidateAddress from '@hooks/useValidateAddress';
import AddressInput from '@common/components/address-input';

const RecipientAddress = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const { token, recipient: storedRecipient } = useTransferState();
  const currentNetwork = useCurrentNetwork();
  const {
    validationResult: { isValidAddress, errorMessage },
    setAddress: setInputAddress,
  } = useValidateAddress({
    restrictActiveWallet: true,
  });

  const onRecipientChange = (nextValue: string) => {
    setInputAddress(nextValue);
    dispatch(setRecipient(nextValue));
    if (token) {
      replaceHistory(`/transfer/${currentNetwork.chainId}/${token.address}/${nextValue}`);
    }
  };

  return (
    <AddressInput
      id="recipientAddress"
      value={storedRecipient}
      placeholder={intl.formatMessage(
        defineMessage({
          defaultMessage: 'Recipient Address',
          description: 'recipientAddress',
        })
      )}
      error={!isValidAddress && !!errorMessage}
      helperText={errorMessage || ' '}
      onChange={onRecipientChange}
    />
  );
};

export default RecipientAddress;
