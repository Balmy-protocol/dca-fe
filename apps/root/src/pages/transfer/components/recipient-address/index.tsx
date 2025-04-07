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
import { trimAddress } from '@common/utils/parsing';
import { Skeleton } from 'ui-library';
import useEnsAddress from '@hooks/useEnsAddress';

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
  const { ensAddress, handleEnsNameSearch, isLoadingEnsAddress } = useEnsAddress(storedRecipient);

  const selectedContact = React.useMemo(() => {
    return contactList.find((contact) => contact.address === storedRecipient);
  }, [contactList, storedRecipient]);

  const recognizedRecipient = React.useMemo(() => {
    // ENS Handle

    if (ensAddress) {
      return intl.formatMessage(
        defineMessage({
          defaultMessage: 'This address matches an ENS name for the address <b>{address}</b>',
          description: 'transferRecipientMatchesEns',
        }),
        { address: trimAddress(ensAddress), b: (chunks) => <b>{chunks}</b> }
      );
    }

    // Contact Handle
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
  }, [selectedContact, intl, ensAddress]);

  const onRecipientChange = (nextValue: string) => {
    void handleEnsNameSearch(nextValue);

    setAddress(nextValue);
    dispatch(setRecipient(nextValue));
    if (token) {
      // Ens may have a dot in the name, so we need to encode it
      const safeValue = nextValue.replace(/\./g, '_');
      replaceHistory(`/transfer/${currentNetwork.chainId}/${token.address}/${safeValue}`);
    }
  };

  const hasError = !!storedRecipient && !isValidAddress && !!errorMessage && !isLoadingEnsAddress;

  return isContactSelection && selectedContact ? (
    <ContactSelectionAutocomplete selectedContact={selectedContact} setIsContactSelection={setIsContactSelection} />
  ) : (
    <AddressInput
      id="recipientAddress"
      value={storedRecipient}
      placeholder={intl.formatMessage(
        defineMessage({
          defaultMessage: 'Set recipient address or ENS (0x123... or name.eth)',
          description: 'recipientAddressWithEns',
        })
      )}
      error={hasError}
      helperText={
        isLoadingEnsAddress ? <Skeleton variant="text" width="20ch" /> : hasError ? errorMessage : recognizedRecipient
      }
      onChange={onRecipientChange}
    />
  );
};

export default RecipientAddress;
