import { Contact, ContactList, IContactListService, Token, TokenType } from '@types';
import ProviderService from './providerService';
import { BigNumber } from 'ethers';
import ContractService from './contractService';
import { TransactionResponse } from '@ethersproject/providers';
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
      this.contactList = [...currentContacts, contact];
      await this.meanApiService.postContacts([contact]);
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
      await this.meanApiService.deleteContact(contact.address);
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
      await this.meanApiService.putAccountLabel(contact.label, contact.address);
    } catch (e) {
      this.contactList = currentContacts;
      console.error(e);
    }
  }

  async transferTokenToContact({
    contact,
    token,
    amount,
  }: {
    contact: Contact;
    token: Token;
    amount: BigNumber;
  }): Promise<TransactionResponse | undefined> {
    if (amount.lte(0)) {
      throw new Error('Amount must be greater than zero');
    }
    const signer = await this.accountService.getActiveWalletSigner();
    if (!signer) {
      throw new Error('No active wallet signer available');
    }
    const from = await signer.getAddress();

    if (token.type === TokenType.ERC20_TOKEN || token.type === TokenType.WRAPPED_PROTOCOL_TOKEN) {
      const erc20Contract = await this.contractService.getERC20TokenInstance(token.chainId, token.address, from);
      return erc20Contract.transfer(contact.address, amount);
    } else if (token.type === TokenType.BASE) {
      return signer.sendTransaction({
        from,
        to: contact.address,
        value: amount,
      });
    }

    throw new Error('Token must be of type Base or ERC20');
  }

  async transferNFTToContact({ contact, token, tokenId }: { contact: Contact; token: Token; tokenId: BigNumber }) {
    if (token.type !== TokenType.ERC721_TOKEN) {
      throw new Error('Token must be of type ERC721');
    }

    const signer = await this.accountService.getActiveWalletSigner();
    if (!signer) {
      throw new Error('No active wallet signer available');
    }
    const from = await signer.getAddress();

    if (token.type === TokenType.ERC721_TOKEN) {
      const erc721Contract = await this.contractService.getERC721TokenInstance(token.chainId, token.address, from);
      return erc721Contract.transferFrom(from, contact.address, tokenId);
    }
  }

  getContacts(): ContactList {
    return this.contactList;
  }

  setContacts(contacts: ContactList): void {
    this.contactList = contacts;
  }
}
