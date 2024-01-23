import React from 'react';
import ContactListService, { ContactListServiceData } from '@services/conctactListService';
import useContactListService from './useContactListService';
import useServiceEvents from './useServiceEvents';
import useStoredLabels from './useStoredLabels';

function useStoredContactList() {
  const contactListService = useContactListService();
  const labels = useStoredLabels();

  const storedContactList = useServiceEvents<ContactListServiceData, ContactListService>(
    contactListService,
    'contactList'
  );

  const labeledContactList = React.useMemo(
    () => storedContactList.map((contact) => ({ address: contact.address, label: labels[contact.address] })),
    [storedContactList, labels]
  );

  return labeledContactList;
}

export default useStoredContactList;
