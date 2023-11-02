import { createMockInstance } from '@common/utils/tests';
import { Contact, ERC20Contract, ERC721Contract, TokenType, User, UserType } from '@types';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { BigNumber } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';

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
  id: 'wallet:validUserId',
  wallets: [],
  type: UserType.wallet,
  signature: { expiration: '', message: '0x' },
};
const contactMock: Contact = { address: 'address-1', label: 'contact-1' };

describe('ContactList Service', () => {
  let accountService: jest.MockedObject<AccountService>;
  let providerService: jest.MockedObject<ProviderService>;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let contractService: jest.MockedObject<ContractService>;
  let contactListService: ContactListService;
  const signerSendTransaction = jest.fn();

  beforeEach(() => {
    accountService = createMockInstance(MockedAccountService);
    providerService = createMockInstance(MockedProviderService);
    meanApiService = createMockInstance(MockedMeanApiService);
    contractService = createMockInstance(MockedContractService);
    contactListService = new ContactListService(accountService, providerService, meanApiService, contractService);

    accountService.getUser.mockReturnValue(userMock);
    const mockedSigner = {
      sendTransaction: signerSendTransaction.mockResolvedValue('sendTransaction'),
    } as unknown as jest.Mocked<JsonRpcSigner>;
    providerService.getSigner.mockResolvedValue(mockedSigner);
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
      // disable console.error for this test
      jest.spyOn(console, 'error').mockImplementation(() => {});
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
      // disable console.error for this test
      jest.spyOn(console, 'error').mockImplementation(() => {});
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
      // disable console.error for this test
      jest.spyOn(console, 'error').mockImplementation(() => {});
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

  describe('transferTokenToContact', () => {
    const erc20TokenMock = emptyTokenWithAddress('token', TokenType.ERC20_TOKEN);
    const nativeTokenMock = emptyTokenWithAddress('nativeToken', TokenType.BASE);
    const erc721TokenMock = emptyTokenWithAddress('nftToken', TokenType.ERC721_TOKEN);

    test('it should not proceed if amount is not greater than zero', async () => {
      try {
        await contactListService.transferTokenToContact({
          from: 'from',
          contact: contactMock,
          token: nativeTokenMock,
          amount: BigNumber.from(0),
        });
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Amount must be greater than zero'));
      }
    });
    test("it should transfer tokens using the ERC20 interface if it's an ERC20 token", async () => {
      const transferFn = jest.fn().mockResolvedValue('transfer');
      contractService.getERC20TokenInstance.mockResolvedValue({
        transfer: transferFn,
      } as unknown as ERC20Contract);

      const txResponse = await contactListService.transferTokenToContact({
        from: 'from',
        contact: contactMock,
        token: erc20TokenMock,
        amount: BigNumber.from(10),
      });

      expect(txResponse).toEqual('transfer');
      expect(transferFn).toHaveBeenCalledTimes(1);
      expect(transferFn).toHaveBeenCalledWith(contactMock.address, BigNumber.from(10));
    });
    test('it should generate a transaction from the signer if the token is a protocol token', async () => {
      const txResponse = await contactListService.transferTokenToContact({
        from: 'from',
        contact: contactMock,
        token: nativeTokenMock,
        amount: BigNumber.from(10),
      });

      expect(txResponse).toEqual('sendTransaction');
      expect(signerSendTransaction).toHaveBeenCalledTimes(1);
      expect(signerSendTransaction).toHaveBeenCalledWith({
        from: 'from',
        to: contactMock.address,
        value: BigNumber.from(10),
      });
    });
    test('it should not proceed if token is not of type Base or ERC20', async () => {
      try {
        await contactListService.transferTokenToContact({
          from: 'from',
          contact: contactMock,
          token: erc721TokenMock,
          amount: BigNumber.from(10),
        });
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Token must be of type Base or ERC20'));
      }
    });
  });

  describe('transferNFTToContact', () => {
    const erc20TokenMock = emptyTokenWithAddress('token', TokenType.ERC20_TOKEN);
    const erc721TokenMock = emptyTokenWithAddress('nftToken', TokenType.ERC721_TOKEN);

    test('it should not proceed if token is not of type ERC721', async () => {
      try {
        await contactListService.transferNFTToContact({
          from: 'from',
          contact: contactMock,
          token: erc20TokenMock,
          tokenId: BigNumber.from(1111),
        });
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Token must be of type ERC721'));
      }
    });
    test("it should transfer token using the ERC721 interface if it's an ERC721 token", async () => {
      const transferFromFn = jest.fn().mockResolvedValue('transferFrom');
      contractService.getERC721TokenInstance.mockResolvedValue({
        transferFrom: transferFromFn,
      } as unknown as ERC721Contract);

      const txResponse = await contactListService.transferNFTToContact({
        from: 'from',
        contact: contactMock,
        token: erc721TokenMock,
        tokenId: BigNumber.from(1111),
      });

      expect(txResponse).toEqual('transferFrom');
      expect(transferFromFn).toHaveBeenCalledTimes(1);
      expect(transferFromFn).toHaveBeenCalledWith('from', contactMock.address, BigNumber.from(1111));
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
