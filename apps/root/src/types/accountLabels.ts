import AccountService from '@services/accountService';
import ContactListService from '@services/conctactListService';
import MeanApiService from '@services/meanApiService';
import { AccountLabelsAndContactList } from './account';

export type AccountLabels = Record<string, string>;
export type AccountEns = Record<string, string | null>;

export interface PostAccountLabels {
  labels: { label: string; wallet: string }[];
}

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
