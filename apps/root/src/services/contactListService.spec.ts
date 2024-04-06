import { createMockInstance } from '@common/utils/tests';
import { AccountLabels, Contact, User, UserStatus } from '@types';

import AccountService from './accountService';
import ProviderService from './providerService';
import MeanApiService from './meanApiService';
import ContractService from './contractService';
import ContactListService from './conctactListService';
import WalletService from './walletService';
import LabelService from './labelService';

jest.mock('./accountService');
jest.mock('./providerService');
jest.mock('./meanApiService');
jest.mock('./contractService.ts');
jest.mock('./walletService.ts');
jest.mock('./labelService.ts');

const MockedAccountService = jest.mocked(AccountService, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });
const MockedContractService = jest.mocked(ContractService, { shallow: true });
const MockedWalletService = jest.mocked(WalletService, { shallow: true });
const MockedLabelService = jest.mocked(LabelService, { shallow: true });

const userMock: User = {
  id: 'wallet:0xvalidUserId',
  wallets: [],
  status: UserStatus.loggedIn,
  label: 'validUser',
  signature: { message: '0x', signer: '0xvalidUserId' },
};
const labelsMock: AccountLabels = { ['address-1']: { label: 'contact-1', lastModified: 1000 } };
const contactMock: Contact = { address: 'address-1', label: { label: 'contact-1', lastModified: 1000 } };
const labelsAndContactListResponseMock = { labels: labelsMock, contacts: [contactMock] };

describe('ContactList Service', () => {
  let accountService: jest.MockedObject<AccountService>;
  let providerService: jest.MockedObject<ProviderService>;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let contractService: jest.MockedObject<ContractService>;
  let walletService: jest.MockedObject<WalletService>;
  let labelService: jest.MockedObject<LabelService>;
  let contactListService: ContactListService;

  beforeEach(() => {
    accountService = createMockInstance(MockedAccountService);
    providerService = createMockInstance(MockedProviderService);
    meanApiService = createMockInstance(MockedMeanApiService);
    contractService = createMockInstance(MockedContractService);
    walletService = createMockInstance(MockedWalletService);
    labelService = createMockInstance(MockedLabelService);
    contactListService = new ContactListService(
      accountService,
      providerService,
      meanApiService,
      contractService,
      walletService,
      labelService
    );

    accountService.getUser.mockReturnValue(userMock);
    accountService.getWalletVerifyingSignature.mockResolvedValue({
      message: 'signature',
      signer: '0xsigner',
    });
    meanApiService.getAccountLabelsAndContactList.mockResolvedValue(labelsAndContactListResponseMock);
    labelService.getLabels.mockReturnValue({});

    jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('fetchLabelsAndContactList', () => {
    test('it should not make a request if no user is present', async () => {
      accountService.getUser.mockReturnValueOnce(undefined);

      await contactListService.fetchLabelsAndContactList();

      expect(meanApiService.getAccountLabelsAndContactList).not.toHaveBeenCalled();
      expect(contactListService.getContactList()).toEqual([]);
    });

    test('it should return contactList array', async () => {
      const contactList = await contactListService.fetchLabelsAndContactList();

      expect(contactList).toEqual(labelsAndContactListResponseMock);
    });
  });

  describe('addContact', () => {
    test('it should not make a request if no user is present', async () => {
      accountService.getUser.mockReturnValueOnce(undefined);

      await contactListService.addContact(contactMock);

      expect(meanApiService.postContacts).not.toHaveBeenCalled();
      expect(contactListService.getContactList()).toEqual([]);
    });
    test('it should update the contactList and then make a request with meanApiService', async () => {
      await contactListService.addContact(contactMock);

      expect(contactListService.getContactList()).toEqual([contactMock]);
      expect(meanApiService.postContacts).toHaveBeenCalledTimes(1);
      expect(meanApiService.postContacts).toHaveBeenCalledWith({
        contacts: [contactMock],
        accountId: 'wallet:0xvalidUserId',
        signature: { message: 'signature', expiration: 'expiration', signer: '0xsigner' },
      });
    });
    test('it should call updateStoredLabels from labelService with new label when is provided', async () => {
      const updatedContact = { address: contactMock.address, label: { label: 'new-label', lastModified: Date.now() } };
      await contactListService.addContact(updatedContact);
      expect(labelService.updateStoredLabels).toHaveBeenCalledWith({ [contactMock.address]: updatedContact.label });
    });
    test('it should call updateStoredLabels from labelService with currentLabel is not provieded', async () => {
      labelService.getLabels.mockReturnValue(labelsMock);
      const updatedContact = { address: contactMock.address };
      await contactListService.addContact(updatedContact);
      expect(labelService.updateStoredLabels).toHaveBeenCalledWith({ [contactMock.address]: contactMock.label });
    });
    test('it should retain the original value of contactList and labels if the API call fails', async () => {
      meanApiService.postContacts.mockRejectedValueOnce(new Error('Mocked Error'));
      // disable console.error for this test
      jest.spyOn(console, 'error').mockImplementation(() => {});
      try {
        await contactListService.addContact(contactMock);
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Mocked Error'));
      }
      expect(meanApiService.postContacts).toHaveBeenCalledWith({
        contacts: [contactMock],
        accountId: 'wallet:0xvalidUserId',
        signature: { message: 'signature', expiration: 'expiration', signer: '0xsigner' },
      });
      expect(contactListService.getContactList()).toEqual([]);
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
      expect(contactListService.getContactList()).toEqual([contactMock]);
    });
    test('it should update the contactList and then make a request with meanApiService', async () => {
      await contactListService.removeContact(contactMock);

      expect(contactListService.getContactList()).toEqual([]);
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

      try {
        await contactListService.removeContact(contactMock);
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Mocked Error'));
      }

      expect(meanApiService.deleteContact).toHaveBeenCalledTimes(1);
      expect(meanApiService.deleteContact).toHaveBeenCalledWith({
        contactAddress: contactMock.address,
        accountId: 'wallet:0xvalidUserId',
        signature: { message: 'signature', expiration: 'expiration', signer: '0xsigner' },
      });
      expect(contactListService.getContactList()).toEqual([contactMock]);
    });
  });

  describe('initializeAliasesAndContacts', () => {
    test('it should assign contactList and call updateStoredLabels', async () => {
      await contactListService.initializeAliasesAndContacts();

      expect(contactListService.getContactList()).toEqual([contactMock]);
      expect(labelService.updateStoredLabels).toHaveBeenCalledWith(labelsMock);
    });

    test('it should get and assign wallet Ens with connected wallets', async () => {
      const returnedEns = { ['0x123']: 'customEns' };
      walletService.getManyEns.mockResolvedValue(returnedEns);
      await contactListService.initializeAliasesAndContacts();
      expect(accountService.setWalletsEns).toHaveBeenCalledWith(returnedEns);
    });
  });
});
