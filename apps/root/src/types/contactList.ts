import ProviderService from '@services/providerService';

export type Contact = {
  address: string;
  label?: string;
};

export type ContactList = Contact[];

export type PostContacts = {
  contacts: {
    contact: string;
    label?: string;
  }[];
};

export type IContactListService = {
  providerService: ProviderService;
  contactList: ContactList;
  addContact(contact: Contact): Promise<void>;
  removeContact(contact: Contact): Promise<void>;
  editContact(contact: Contact): Promise<void>;
  getContacts(): ContactList;
  setContacts(contacts: ContactList): void;
};
