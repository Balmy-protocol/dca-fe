import React from 'react';
import ContactListService, { ContactListServiceData } from '@services/conctactListService';
import useContactListService from './useContactListService';
import useServiceEvents from './useServiceEvents';
import useStoredLabels from './useStoredLabels';
import useWallets from './useWallets';
import { map, uniq } from 'lodash';
import { ContactList } from 'common-types';

function useStoredContactList() {
  const contactListService = useContactListService();
  const labels = useStoredLabels();
  const wallets = useWallets();

  const storedContactList = useServiceEvents<ContactListServiceData, ContactListService, 'getContactList'>(
    contactListService,
    'getContactList'
  );

  const labeledContactList = React.useMemo<ContactList>(() => {
    const contactsWithWallets = uniq([...map(storedContactList, 'address'), ...map(wallets, 'address')]);
    return contactsWithWallets.map((address) => ({ address, label: labels[address] }));
  }, [storedContactList, labels, wallets]);

  return labeledContactList;
}

export default useStoredContactList;
