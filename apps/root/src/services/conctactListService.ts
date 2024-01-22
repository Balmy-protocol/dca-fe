import { AccountLabelsAndContactList, Contact, ContactList, IContactListService } from '@types';
import ProviderService from './providerService';
import ContractService from './contractService';
import MeanApiService from './meanApiService';
import { map } from 'lodash';
import AccountService from './accountService';
import WalletService from './walletService';
import LabelService from './labelService';
import { EventsManager } from './eventsManager';

export interface ContactListServiceData {
  contactList: ContactList;
}

export default class ContactListService extends EventsManager<ContactListServiceData> implements IContactListService {
  accountService: AccountService;

  providerService: ProviderService;

  contractService: ContractService;

  meanApiService: MeanApiService;

  walletService: WalletService;

  labelService: LabelService;

  constructor(
    accountService: AccountService,
    providerService: ProviderService,
    meanApiService: MeanApiService,
    contractService: ContractService,
    walletService: WalletService,
    labelService: LabelService
  ) {
    super({ contactList: [] });
    this.accountService = accountService;
    this.providerService = providerService;
    this.contractService = contractService;
    this.meanApiService = meanApiService;
    this.walletService = walletService;
    this.labelService = labelService;
  }

  get contactList() {
    return this.serviceData.contactList;
  }

  set contactList(contactList) {
    this.serviceData = { ...this.serviceData, contactList };
  }

  async fetchLabelsAndContactList(): Promise<AccountLabelsAndContactList | undefined> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }

    try {
      const signature = await this.accountService.getWalletVerifyingSignature({});
      return await this.meanApiService.getAccountLabelsAndContactList({
        accountId: user.id,
        signature,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async addContact(contact: Contact): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    const currentContacts = [...this.contactList];
    const currentLabel = this.labelService.labels?.[contact.address];
    try {
      const signature = await this.accountService.getWalletVerifyingSignature({});
      this.contactList = [...currentContacts, contact];
      this.labelService.labels = {
        ...this.labelService.labels,
        [contact.address]: contact.label ? { label: contact.label.label, lastModified: Date.now() } : currentLabel,
      };
      await this.meanApiService.postContacts({ contacts: [contact], accountId: user.id, signature });
    } catch (e) {
      this.contactList = currentContacts;
      this.labelService.labels = {
        ...this.labelService.labels,
        [contact.address]: currentLabel,
      };
      throw e;
    }
  }

  async removeContact(contact: Contact): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    const currentContacts = [...this.contactList];
    try {
      this.contactList = currentContacts.filter((contactEl) => contactEl.address !== contact.address);
      const signature = await this.accountService.getWalletVerifyingSignature({});
      await this.meanApiService.deleteContact({ contactAddress: contact.address, accountId: user.id, signature });
    } catch (e) {
      this.contactList = currentContacts;
      throw e;
    }
  }

  async initializeAliasesAndContacts(): Promise<void> {
    const labelsAndContactList = await this.fetchLabelsAndContactList();
    if (labelsAndContactList) {
      this.labelService.labels = labelsAndContactList.labels;
      this.contactList = labelsAndContactList.contacts;
    }

    const wallets = this.accountService.user?.wallets || [];
    const accountEns = await this.walletService.getManyEns(map(wallets, 'address'));
    this.accountService.setWalletsEns(accountEns);
  }
}
