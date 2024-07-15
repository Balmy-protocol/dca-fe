import React from 'react';
import { useAppDispatch } from '@hooks/state';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { setRecipient } from '@state/transfer/actions';
import { useTransferState } from '@state/transfer/hooks';
import { defineMessage, useIntl } from 'react-intl';
import useValidateAddress from '@hooks/useValidateAddress';
import AddressInput from '@common/components/address-input';
import useStoredContactList from '@hooks/useStoredContactList';

type RecipientAddressProps = DistributiveOmit<ReturnType<typeof useValidateAddress>, 'address'>;

const RecipientAddress = ({
  setAddress,
  validationResult: { errorMessage, isValidAddress },
}: RecipientAddressProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const contactList = useStoredContactList();
  const { token, recipient: storedRecipient } = useTransferState();
  const currentNetwork = useCurrentNetwork();

  const recognizedRecipient = React.useMemo(() => {
    const foundContact = contactList.find((contact) => contact.address === storedRecipient);

    if (!foundContact) {
      return;
    }

    if (!foundContact.label?.label) {
      return intl.formatMessage(
        defineMessage({
          defaultMessage: 'This address matches a contact of yours',
          description: 'transferRecipientMatchesContactNoLabel',
        })
      );
    }

    return intl.formatMessage(
      defineMessage({
        defaultMessage: 'This address matches your contact <b>{contact}</b>',
        description: 'transferRecipientMatchesContact',
      }),
      {
        contact: foundContact.label.label,
        b: (chunks) => <b>{chunks}</b>,
      }
    );
  }, [contactList, storedRecipient, intl]);

  const onRecipientChange = (nextValue: string) => {
    setAddress(nextValue);
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
      helperText={errorMessage || recognizedRecipient || ' '}
      onChange={onRecipientChange}
    />
  );
};

export default RecipientAddress;
