import { Contact, ContactList, IContactListService } from '@types';
import ProviderService from './providerService';
import ContractService from './contractService';
import MeanApiService from './meanApiService';
import { findIndex, remove } from 'lodash';
import AccountService from './accountService';

export default class ContactListService implements IContactListService {
  accountService: AccountService;

  providerService: ProviderService;

  contractService: ContractService;

  meanApiService: MeanApiService;

  contactList: ContactList = [];

  constructor(
    accountService: AccountService,
    providerService: ProviderService,
    meanApiService: MeanApiService,
    contractService: ContractService
  ) {
    this.accountService = accountService;
    this.providerService = providerService;
    this.contractService = contractService;
    this.meanApiService = meanApiService;
  }

  async addContact(contact: Contact): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    const currentContacts = [...this.contactList];
    try {
      const signature = await this.accountService.getWalletVerifyingSignature({});
      this.contactList = [...currentContacts, contact];
      await this.meanApiService.postContacts({ contacts: [contact], accountId: user.id, signature });
    } catch (e) {
      this.contactList = currentContacts;
      console.error(e);
    }
  }

  async removeContact(contact: Contact): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    const currentContacts = [...this.contactList];
    try {
      remove(this.contactList, { address: contact.address });
      const signature = await this.accountService.getWalletVerifyingSignature({});
      await this.meanApiService.deleteContact({ contactAddress: contact.address, accountId: user.id, signature });
    } catch (e) {
      this.contactList = currentContacts;
      console.error(e);
    }
  }

  async editContact(contact: Contact): Promise<void> {
    const user = this.accountService.getUser();
    if (!user || !contact.label) {
      return;
    }
    const contactIndex = findIndex(this.contactList, { address: contact.address });
    if (contactIndex === -1) {
      return;
    }

    const currentContacts = [...this.contactList];
    try {
      this.contactList[contactIndex] = contact;
      const signature = await this.accountService.getWalletVerifyingSignature({});
      await this.meanApiService.putAccountLabel({
        newLabel: contact.label.label,
        labeledAddress: contact.address,
        accountId: user.id,
        signature,
      });
    } catch (e) {
      this.contactList = currentContacts;
      console.error(e);
    }
  }

  getContacts(): ContactList {
    return this.contactList;
  }

  setContacts(contacts: ContactList): void {
    this.contactList = contacts;
  }
}
