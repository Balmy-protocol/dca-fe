import React from 'react';
import ContactListService, { ContactListServiceData } from '@services/conctactListService';
import useContactListService from './useContactListService';
import useServiceEvents from './useServiceEvents';
import useStoredLabels from './useStoredLabels';
import useWallets from './useWallets';
import { map, uniq } from 'lodash';
import { ContactList } from 'common-types';
import useActiveWallet from './useActiveWallet';

function useStoredContactList() {
  const contactListService = useContactListService();
  const activeWallet = useActiveWallet();
  const labels = useStoredLabels();
  const wallets = useWallets();

  const storedContactList = useServiceEvents<ContactListServiceData, ContactListService, 'getContactList'>(
    contactListService,
    'getContactList'
  );

  const labeledContactList = React.useMemo<ContactList>(() => {
    const contactsWithWallets = uniq([...map(storedContactList, 'address'), ...map(wallets, 'address')]);
    return contactsWithWallets
      .filter((address) => address !== activeWallet?.address)
      .map((address) => ({ address, label: labels[address] }));
  }, [storedContactList, labels, wallets]);

  return labeledContactList;
}

export default useStoredContactList;
