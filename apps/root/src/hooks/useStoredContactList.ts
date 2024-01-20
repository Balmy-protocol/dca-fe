import useContactListService from './useContactListService';
import useStoredLabels from './useStoredLabels';

function useStoredContactList() {
  const contactListService = useContactListService();
  const labels = useStoredLabels();

  const contactList = contactListService.getContacts();
  return contactList.map((contact) => ({ ...contact, label: labels[contact.address] }));
}

export default useStoredContactList;
