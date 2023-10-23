import { IAccountService } from '@types';
import ProviderService from '@services/providerService';

export type Contact = {
  address: string;
  label?: string;
};

export type ContactList = Contact[];

export type IContactListService = {
  accountService: IAccountService;
  providerService: ProviderService;
  contactList: ContactList;
  addContact(contact: Contact): Promise<void>;
  removeContact(contact: Contact): Promise<void>;
  editContact(contact: Contact): Promise<void>;
  getContacts(): ContactList;
  //   transferToContact({
  //     contact,
  //     token,
  //     amount,
  //   }: {
  //     contact: Contact;
  //     token: Token;
  //     amount: BigNumber;
  //   }): Promise<TransactionResponse>;
  setContacts(contacts: ContactList): void;
};
