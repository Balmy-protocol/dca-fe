import AccountService from './accountService';
import ProviderService from './providerService';
import MeanApiService from './meanApiService';
import ContactListService from './conctactListService';
import { createMockInstance } from '@common/utils/tests';
import { Contact, User, UserType } from '@types';

jest.mock('./accountService');
jest.mock('./providerService');
jest.mock('./meanApiService');

const MockedAccountService = jest.mocked(AccountService, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });

const userMock: User = { id: 'validUserId', wallets: [], type: UserType.wallet };
const contactMock: Contact = { address: 'address-1', label: 'contact-1' };

describe('ContactList Service', () => {
  let accountService: jest.MockedObject<AccountService>;
  let providerService: jest.MockedObject<ProviderService>;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let contactListService: ContactListService;

  beforeEach(() => {
    accountService = createMockInstance(MockedAccountService);
    providerService = createMockInstance(MockedProviderService);
    meanApiService = createMockInstance(MockedMeanApiService);
    contactListService = new ContactListService(accountService, providerService, meanApiService);

    accountService.getUser.mockReturnValue(userMock);
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
      expect(meanApiService.postContacts).toHaveBeenCalledWith([contactMock], userMock.id);
    });
    test('it should retain the original value of contactList if the API call fails', async () => {
      meanApiService.postContacts.mockRejectedValueOnce(new Error('Mocked Error'));
      await contactListService.addContact(contactMock);

      expect(meanApiService.postContacts).toHaveBeenCalledWith([contactMock], userMock.id);
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
      expect(meanApiService.deleteContact).toHaveBeenCalledWith(contactMock.address, userMock.id);
    });
    test('it should retain the original value of contactList if the API call fails', async () => {
      meanApiService.deleteContact.mockRejectedValueOnce(new Error('Mocked Error'));
      await contactListService.removeContact(contactMock);

      expect(meanApiService.deleteContact).toHaveBeenCalledTimes(1);
      expect(meanApiService.deleteContact).toHaveBeenCalledWith(contactMock.address, userMock.id);
      expect(contactListService.getContacts()).toEqual([contactMock]);
    });
  });

  describe('editContact', () => {
    const updatedContactMock = { ...contactMock, label: 'updated-label' };
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
      await contactListService.editContact({ address: 'another-address', label: 'contact-2' });

      expect(meanApiService.putAccountLabel).not.toHaveBeenCalled();
      expect(contactListService.getContacts()).toEqual([contactMock]);
    });
    test('it should update the contactList and then make a request with meanApiService', async () => {
      await contactListService.editContact(updatedContactMock);

      expect(contactListService.getContacts()).toEqual([updatedContactMock]);
      expect(meanApiService.putAccountLabel).toHaveBeenCalledTimes(1);
      expect(meanApiService.putAccountLabel).toHaveBeenCalledWith(
        updatedContactMock.label,
        updatedContactMock.address,
        userMock.id
      );
    });
    test('it should retain the original value of contactList if the API call fails', async () => {
      meanApiService.putAccountLabel.mockRejectedValueOnce(new Error('Mocked Error'));
      await contactListService.editContact(updatedContactMock);

      expect(meanApiService.putAccountLabel).toHaveBeenCalledTimes(1);
      expect(meanApiService.putAccountLabel).toHaveBeenCalledWith(
        updatedContactMock.label,
        updatedContactMock.address,
        userMock.id
      );
      expect(contactListService.getContacts()).toEqual([contactMock]);
    });
  });

  describe('setContacts and getContacts', () => {
    it('should set and get contacts correctly', () => {
      const contacts = [
        { address: 'add-1', label: 'lbl1' },
        { address: 'add-2', label: 'lbl2' },
      ];

      contactListService.setContacts(contacts);

      const result = contactListService.getContacts();

      expect(result).toEqual(contacts);
    });
  });
});
