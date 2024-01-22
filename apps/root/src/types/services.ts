import ProviderService from '@services/providerService';
import AccountService from '@services/accountService';
import MeanApiService from '@services/meanApiService';
import { Contact, ContactList, AccountLabels, PostAccountLabels } from '@types';

// TODO: Redefine types for both services

export type IContactListService = {
  providerService: ProviderService;
  contactList: ContactList;
  addContact(contact: Contact): Promise<void>;
  removeContact(contact: Contact): Promise<void>;
  editContactLabel(contact: Contact): void;
};

export type ILabelService = {
  labels: AccountLabels;
  meanApiService: MeanApiService;
  accountService: AccountService;
  postLabels(labels: PostAccountLabels): Promise<void>;
  editLabel(newLabel: string, labeledAddress: string): Promise<void>;
  deleteLabel(labeledAddress: string): Promise<void>;
};
