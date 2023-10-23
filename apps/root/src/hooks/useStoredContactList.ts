import useContactListService from './useContactListService';

function useStoredContactList() {
  const contactListService = useContactListService();
  return contactListService.getContacts();
}

export default useStoredContactList;
