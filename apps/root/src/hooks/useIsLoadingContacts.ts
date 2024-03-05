import ContactListService, { ContactListServiceData } from '@services/conctactListService';
import useContactListService from './useContactListService';
import useServiceEvents from './useServiceEvents';

function useIsLoadingContactList() {
  const contactListService = useContactListService();

  const isLoadingContactList = useServiceEvents<ContactListServiceData, ContactListService, 'getIsLoadingContactList'>(
    contactListService,
    'getIsLoadingContactList'
  );

  return isLoadingContactList;
}

export default useIsLoadingContactList;
