import { AccountLabelsAndContactList, Contact, ContactList, IContactListService } from '@types';
import ProviderService from './providerService';
import ContractService from './contractService';
import MeanApiService from './meanApiService';
import { map } from 'lodash';
import AccountService from './accountService';
import WalletService from './walletService';
import LabelService from './labelService';
import { EventsManager } from './eventsManager';
import { ApiErrorKeys } from '@constants';

export interface ContactListServiceData {
  contactList: ContactList;
  isLoading: boolean;
}

const initialState: ContactListServiceData = { contactList: [], isLoading: false };
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
    super(initialState);
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

  get isLoadingContacts() {
    return this.serviceData.isLoading;
  }

  set isLoadingContacts(isLoading) {
    this.serviceData = { ...this.serviceData, isLoading };
  }

  logOutUser() {
    this.resetData();
  }

  async fetchLabelsAndContactList(): Promise<AccountLabelsAndContactList | undefined> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }

    this.isLoadingContacts = true;
    try {
      const signature = await this.accountService.getWalletVerifyingSignature({});
      const contacts = await this.meanApiService.getAccountLabelsAndContactList({
        accountId: user.id,
        signature,
      });
      this.isLoadingContacts = false;
      return contacts;
    } catch {
      this.isLoadingContacts = false;
      throw new Error(ApiErrorKeys.LABELS_CONTACT_LIST);
    }
  }

  async addContact(contact: Contact): Promise<void> {
    const user = this.accountService.getUser();
    if (!user) {
      return;
    }
    const currentContacts = [...this.contactList];
    const currentLabel = this.labelService.getLabels()[contact.address];
    try {
      const signature = await this.accountService.getWalletVerifyingSignature({});
      this.contactList = [...currentContacts, contact];
      const newLabel = contact.label?.label ? { label: contact.label.label, lastModified: Date.now() } : currentLabel;
      this.labelService.updateStoredLabels({ [contact.address]: newLabel });
      await this.meanApiService.postContacts({ contacts: [contact], accountId: user.id, signature });
    } catch (e) {
      this.contactList = currentContacts;
      this.labelService.updateStoredLabels({ [contact.address]: currentLabel });

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
      this.labelService.updateStoredLabels(labelsAndContactList.labels);
      this.contactList = labelsAndContactList.contacts;
    }

    const wallets = this.accountService.user?.wallets || [];
    const accountEns = await this.walletService.getManyEns(map(wallets, 'address'));
    this.accountService.setWalletsEns(accountEns);
  }

  getContactList() {
    return this.contactList;
  }

  getIsLoadingContactList() {
    return this.isLoadingContacts;
  }
}
