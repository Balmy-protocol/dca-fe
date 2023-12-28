import ProviderService from '@services/providerService';
import AccountService from '@services/accountService';
import ContactListService from '@services/conctactListService';
import MeanApiService from '@services/meanApiService';
import { Contact, ContactList, AccountLabels, AccountLabelsAndContactList } from '@types';

export type IContactListService = {
  providerService: ProviderService;
  contactList: ContactList;
  addContact(contact: Contact): Promise<void>;
  removeContact(contact: Contact): Promise<void>;
  editContact(contact: Contact): Promise<void>;
  getContacts(): ContactList;
  setContacts(contacts: ContactList): void;
};

export type ILabelService = {
  labels: AccountLabels;
  meanApiService: MeanApiService;
  accountService: AccountService;
  contactListService: ContactListService;
  getStoredLabels(): AccountLabels;
  fetchLabelsAndContactList(): Promise<AccountLabelsAndContactList | undefined>;
  postLabels(labels: AccountLabels): Promise<void>;
  editLabel(newLabel: string, labeledAddress: string): Promise<void>;
  deleteLabel(labeledAddress: string): Promise<void>;
  setWalletsAliases(): void;
  initializeAliasesAndContacts(): Promise<void>;
};
