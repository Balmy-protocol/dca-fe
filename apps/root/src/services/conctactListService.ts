import { AccountLabelsAndContactList, Contact, ContactList, IContactListService } from '@types';
import ProviderService from './providerService';
import ContractService from './contractService';
import MeanApiService from './meanApiService';
import { findIndex, map, remove } from 'lodash';
import AccountService from './accountService';
import WalletService from './walletService';
import LabelService from './labelService';

export default class ContactListService implements IContactListService {
  accountService: AccountService;

  providerService: ProviderService;

  contractService: ContractService;

  meanApiService: MeanApiService;

  walletService: WalletService;

  labelService: LabelService;

  private _contactList: ContactList = [];

  constructor(
    accountService: AccountService,
    providerService: ProviderService,
    meanApiService: MeanApiService,
    contractService: ContractService,
    walletService: WalletService,
    labelService: LabelService
  ) {
    this.accountService = accountService;
    this.providerService = providerService;
    this.contractService = contractService;
    this.meanApiService = meanApiService;
    this.walletService = walletService;
    this.labelService = labelService;
  }

  get contactList() {
    return this._contactList;
  }

  set contactList(contactList) {
    this._contactList = contactList;
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
    const currentLabel = this.labelService.labels[contact.address].label;
    try {
      const signature = await this.accountService.getWalletVerifyingSignature({});
      this.contactList = [...currentContacts, contact];
      this.labelService.updateLabelLocally(contact.address, contact.label?.label);
      await this.meanApiService.postContacts({ contacts: [contact], accountId: user.id, signature });
    } catch (e) {
      this.contactList = currentContacts;
      this.labelService.updateLabelLocally(contact.address, currentLabel);
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
      remove(this.contactList, { address: contact.address });
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

  editContactLabel(contact: Contact): void {
    const contactIndex = findIndex(this.contactList, { address: contact.address });
    if (contactIndex === -1) {
      return;
    }
    this.contactList[contactIndex].label = contact.label;
  }
}
