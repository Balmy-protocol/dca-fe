import { IAccountService, Token } from '@types';
import ProviderService from '@services/providerService';
import { BigNumber } from 'ethers';
import { TransactionResponse } from '@ethersproject/providers';

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
  accountService: IAccountService;
  providerService: ProviderService;
  contactList: ContactList;
  addContact(contact: Contact): Promise<void>;
  removeContact(contact: Contact): Promise<void>;
  editContact(contact: Contact): Promise<void>;
  getContacts(): ContactList;
  transferTokenToContact({
    contact,
    token,
    amount,
  }: {
    contact: Contact;
    token: Token;
    amount: BigNumber;
  }): Promise<TransactionResponse | undefined>;
  transferNFTToContact({
    contact,
    token,
    tokenId,
  }: {
    contact: Contact;
    token: Token;
    tokenId: BigNumber;
  }): Promise<TransactionResponse | undefined>;
  setContacts(contacts: ContactList): void;
};
