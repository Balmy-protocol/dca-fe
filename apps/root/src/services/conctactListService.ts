import { Contact, ContactList, IAccountService, IContactListService } from '@types';
import ProviderService from './providerService';

export default class ContactListService implements IContactListService {
  accountService: IAccountService;

  providerService: ProviderService;

  contactList: ContactList = [];

  constructor(accountService: IAccountService, providerService: ProviderService) {
    this.accountService = accountService;
    this.providerService = providerService;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  async addContact(contact: Contact): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  async removeContact(contact: Contact): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  async editContact(contact: Contact): Promise<void> {}

  getContacts(): ContactList {
    return this.contactList;
  }

  setContacts(contacts: ContactList): void {
    this.contactList = contacts;
  }
}
