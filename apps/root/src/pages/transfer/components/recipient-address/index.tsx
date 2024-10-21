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
import ContactSelectionAutocomplete from './components/contact-selection-autocomplete';

type RecipientAddressProps = {
  isContactSelection: boolean;
  setIsContactSelection: (isContactSelection: boolean) => void;
} & DistributiveOmit<ReturnType<typeof useValidateAddress>, 'address'>;

const RecipientAddress = ({
  setAddress,
  validationResult: { errorMessage, isValidAddress },
  isContactSelection,
  setIsContactSelection,
}: RecipientAddressProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const contactList = useStoredContactList();
  const { token, recipient: storedRecipient } = useTransferState();
  const currentNetwork = useCurrentNetwork();

  const selectedContact = React.useMemo(() => {
    return contactList.find((contact) => contact.address === storedRecipient);
  }, [contactList, storedRecipient]);

  const recognizedRecipient = React.useMemo(() => {
    if (!selectedContact) {
      return;
    }

    if (!selectedContact.label?.label) {
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
        contact: selectedContact.label.label,
        b: (chunks) => <b>{chunks}</b>,
      }
    );
  }, [selectedContact, intl]);

  const onRecipientChange = (nextValue: string) => {
    setAddress(nextValue);
    dispatch(setRecipient(nextValue));
    if (token) {
      replaceHistory(`/transfer/${currentNetwork.chainId}/${token.address}/${nextValue}`);
    }
  };

  return isContactSelection && selectedContact ? (
    <ContactSelectionAutocomplete selectedContact={selectedContact} setIsContactSelection={setIsContactSelection} />
  ) : (
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
      helperText={errorMessage || recognizedRecipient}
      onChange={onRecipientChange}
    />
  );
};

export default RecipientAddress;
