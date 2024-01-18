import { createMockInstance } from '@common/utils/tests';
import { Contact, User, UserStatus } from '@types';

import AccountService from './accountService';
import ProviderService from './providerService';
import MeanApiService from './meanApiService';
import ContractService from './contractService';
import ContactListService from './conctactListService';

jest.mock('./accountService');
jest.mock('./providerService');
jest.mock('./meanApiService');
jest.mock('./contractService.ts');

const MockedAccountService = jest.mocked(AccountService, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });
const MockedContractService = jest.mocked(ContractService, { shallow: true });

const userMock: User = {
  id: 'wallet:0xvalidUserId',
  wallets: [],
  status: UserStatus.loggedIn,
  label: 'validUser',
  signature: { expiration: '', message: '0x', signer: '0xvalidUserId' },
};
const contactMock: Contact = { address: 'address-1', label: { label: 'contact-1', lastModified: 1000 } };

describe('ContactList Service', () => {
  let accountService: jest.MockedObject<AccountService>;
  let providerService: jest.MockedObject<ProviderService>;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let contractService: jest.MockedObject<ContractService>;
  let contactListService: ContactListService;

  beforeEach(() => {
    accountService = createMockInstance(MockedAccountService);
    providerService = createMockInstance(MockedProviderService);
    meanApiService = createMockInstance(MockedMeanApiService);
    contractService = createMockInstance(MockedContractService);
    contactListService = new ContactListService(accountService, providerService, meanApiService, contractService);

    accountService.getUser.mockReturnValue(userMock);
    accountService.getWalletVerifyingSignature.mockResolvedValue({
      message: 'signature',
      expiration: 'expiration',
      signer: '0xsigner',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('addContact', () => {
    test('it should not make a request if no user is present', async () => {
      accountService.getUser.mockReturnValueOnce(undefined);

      await contactListService.addContact(contactMock);

      expect(meanApiService.postContacts).not.toHaveBeenCalled();
      expect(contactListService.getContacts()).toEqual([]);
    });
    test('it should update the contactList and then make a request with meanApiService', async () => {
      await contactListService.addContact(contactMock);

      expect(contactListService.getContacts()).toEqual([contactMock]);
      expect(meanApiService.postContacts).toHaveBeenCalledTimes(1);
      expect(meanApiService.postContacts).toHaveBeenCalledWith({
        contacts: [contactMock],
        accountId: 'wallet:0xvalidUserId',
        signature: { message: 'signature', expiration: 'expiration', signer: '0xsigner' },
      });
    });
    test('it should retain the original value of contactList if the API call fails', async () => {
      meanApiService.postContacts.mockRejectedValueOnce(new Error('Mocked Error'));
      // disable console.error for this test
      jest.spyOn(console, 'error').mockImplementation(() => {});
      await contactListService.addContact(contactMock);

      expect(meanApiService.postContacts).toHaveBeenCalledWith({
        contacts: [contactMock],
        accountId: 'wallet:0xvalidUserId',
        signature: { message: 'signature', expiration: 'expiration', signer: '0xsigner' },
      });
      expect(contactListService.getContacts()).toEqual([]);
    });
  });

  describe('removeContact', () => {
    beforeEach(async () => {
      await contactListService.addContact(contactMock);
    });

    test('it should not make a request if no user is present', async () => {
      accountService.getUser.mockReturnValueOnce(undefined);

      await contactListService.removeContact(contactMock);

      expect(meanApiService.deleteContact).not.toHaveBeenCalled();
      expect(contactListService.getContacts()).toEqual([contactMock]);
    });
    test('it should update the contactList and then make a request with meanApiService', async () => {
      await contactListService.removeContact(contactMock);

      expect(contactListService.getContacts()).toEqual([]);
      expect(meanApiService.deleteContact).toHaveBeenCalledTimes(1);
      expect(meanApiService.deleteContact).toHaveBeenCalledWith({
        contactAddress: contactMock.address,
        accountId: 'wallet:0xvalidUserId',
        signature: { message: 'signature', expiration: 'expiration', signer: '0xsigner' },
      });
    });
    test('it should retain the original value of contactList if the API call fails', async () => {
      meanApiService.deleteContact.mockRejectedValueOnce(new Error('Mocked Error'));
      // disable console.error for this test
      jest.spyOn(console, 'error').mockImplementation(() => {});
      await contactListService.removeContact(contactMock);

      expect(meanApiService.deleteContact).toHaveBeenCalledTimes(1);
      expect(meanApiService.deleteContact).toHaveBeenCalledWith({
        contactAddress: contactMock.address,
        accountId: 'wallet:0xvalidUserId',
        signature: { message: 'signature', expiration: 'expiration', signer: '0xsigner' },
      });
      expect(contactListService.getContacts()).toEqual([contactMock]);
    });
  });

  describe('editContact', () => {
    const updatedContactMock = { ...contactMock, label: { label: 'updated-label' } };
    beforeEach(async () => {
      await contactListService.addContact(contactMock);
    });

    test('it should not make a request if no user is present', async () => {
      accountService.getUser.mockReturnValueOnce(undefined);

      await contactListService.editContact(updatedContactMock);

      expect(meanApiService.putAccountLabel).not.toHaveBeenCalled();
      expect(contactListService.getContacts()).toEqual([contactMock]);
    });
    test('it should not make a request if no label is sent', async () => {
      await contactListService.editContact({ address: contactMock.address });

      expect(meanApiService.putAccountLabel).not.toHaveBeenCalled();
      expect(contactListService.getContacts()).toEqual([contactMock]);
    });
    test('it should not make a request if contact was not found in contactList', async () => {
      await contactListService.editContact({ address: 'another-address', label: { label: 'contact-2' } });

      expect(meanApiService.putAccountLabel).not.toHaveBeenCalled();
      expect(contactListService.getContacts()).toEqual([contactMock]);
    });
    test('it should update the contactList and then make a request with meanApiService', async () => {
      await contactListService.editContact(updatedContactMock);

      expect(contactListService.getContacts()).toEqual([updatedContactMock]);
      expect(meanApiService.putAccountLabel).toHaveBeenCalledTimes(1);
      expect(meanApiService.putAccountLabel).toHaveBeenCalledWith({
        newLabel: updatedContactMock.label.label,
        labeledAddress: updatedContactMock.address,
        accountId: 'wallet:0xvalidUserId',
        signature: { message: 'signature', expiration: 'expiration', signer: '0xsigner' },
      });
    });
    test('it should retain the original value of contactList if the API call fails', async () => {
      // disable console.error for this test
      jest.spyOn(console, 'error').mockImplementation(() => {});
      meanApiService.putAccountLabel.mockRejectedValueOnce(new Error('Mocked Error'));
      await contactListService.editContact(updatedContactMock);

      expect(meanApiService.putAccountLabel).toHaveBeenCalledTimes(1);
      expect(meanApiService.putAccountLabel).toHaveBeenCalledWith({
        newLabel: updatedContactMock.label.label,
        labeledAddress: updatedContactMock.address,
        accountId: 'wallet:0xvalidUserId',
        signature: { message: 'signature', expiration: 'expiration', signer: '0xsigner' },
      });
      expect(contactListService.getContacts()).toEqual([contactMock]);
    });
  });

  describe('setContacts and getContacts', () => {
    it('should set and get contacts correctly', () => {
      const contacts = [
        { address: 'add-1', label: { label: 'lbl1' } },
        { address: 'add-2', label: { label: 'lbl2' } },
      ];

      contactListService.setContacts(contacts);

      const result = contactListService.getContacts();

      expect(result).toEqual(contacts);
    });
  });
});
