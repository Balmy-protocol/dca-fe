import ProviderService from '@services/providerService';
import AccountService from '@services/accountService';
import MeanApiService from '@services/meanApiService';
import { Contact, PostAccountLabels, ContactList, AccountLabels } from '@types';
import ContractService from '@services/contractService';
import WalletService from '@services/walletService';
import LabelService from '@services/labelService';

export type IContactListService = {
  accountService: AccountService;
  providerService: ProviderService;
  contractService: ContractService;
  meanApiService: MeanApiService;
  walletService: WalletService;
  labelService: LabelService;

  fetchLabelsAndContactList(): Promise<void>;
  addContact(contact: Contact): Promise<void>;
  removeContact(contact: Contact): Promise<void>;
  getContactList(): ContactList;
};

export type ILabelService = {
  meanApiService: MeanApiService;
  accountService: AccountService;

  postLabels(labels: PostAccountLabels): Promise<void>;
  editLabel(newLabel: string, labeledAddress: string): Promise<void>;
  deleteLabel(labeledAddress: string): Promise<void>;
  updateStoredLabels(labels: AccountLabels): void;
  getLabels(): AccountLabels;
};
