import { createMockInstance } from '@common/utils/tests';
import { User, UserStatus, Wallet } from '@types';

import MeanApiService from './meanApiService';
import AccountService from './accountService';
import ProviderService from './providerService';
import ContractService from './contractService';
import { PublicClient } from 'viem';
import LabelService from './labelService';

jest.mock('./meanApiService');
jest.mock('./contractService.ts');
jest.mock('./providerService');
jest.mock('./accountService');

const MockedMeanApiService = jest.mocked(MeanApiService);
const MockedContractService = jest.mocked(ContractService, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedAccountService = jest.mocked(AccountService, { shallow: true });

const userMock: User = {
  id: 'wallet:0xvalidUserId',
  wallets: [
    {
      address: '0xaddress',
    } as unknown as Wallet,
    {
      address: '0xaddress2',
    } as unknown as Wallet,
  ],
  status: UserStatus.loggedIn,
  label: 'validUser',
  signature: { message: '0x', signer: '0xvalidUserId' },
};

describe('Label Service', () => {
  let meanApiService: jest.MockedObject<MeanApiService>;
  let contractService: jest.MockedObject<ContractService>;
  let providerService: jest.MockedObject<ProviderService>;
  let accountService: jest.MockedObject<AccountService>;
  let labelService: LabelService;

  beforeEach(() => {
    meanApiService = createMockInstance(MockedMeanApiService);
    accountService = createMockInstance(MockedAccountService);
    providerService = createMockInstance(MockedProviderService);
    contractService = createMockInstance(MockedContractService);
    labelService = new LabelService(meanApiService, accountService, providerService, contractService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  /* eslint-disable jest/expect-expect, jest/no-disabled-tests */

  describe('getStoredLabels', () => {
    test('it should return an empty object as initialized value', async () => {});
    test('it should return the correct value after a successfull fetch', async () => {});
  });

  describe('fetchLabelsAndContactList', () => {
    test('it should not make a request if no user is present', async () => {});
    test('it should make a request with meanApiService and return the response', async () => {});
    test('it should return undefined if the request fails', async () => {});
  });

  describe('postLabels', () => {
    test('it should not make a request if no user is present', async () => {});
    test('it should update the labels data and then make a request with meanApiService', async () => {});
    test('it should retain the original value of labels if the API call fails', async () => {});
  });

  describe('editLabel', () => {
    test('it should not make a request if no user is present', async () => {});
    test('it should not make a request if the address has no label asociated', async () => {});
    test('it should update the labels data and then make a request with meanApiService', async () => {});
    test('it should retain the original value if the API call fails', async () => {});
  });

  describe('deleteLabel', () => {
    test('it should not make a request if no user is present', async () => {});
    test('it should only make a request if the address has a label asociated', async () => {});
    test('it should update the labels data and then make a request with meanApiService', async () => {});
    test('it should retain the original value if the API call fails', async () => {});
  });

  describe('setWalletsAliases', () => {
    test('it should call setWalletsAliases from accountService with local labels property', () => {});
  });

  describe('initializeAliasesAndContacts', () => {
    test('it should not call any other methods if labelsAndContactList is undefined', async () => {});
    test('it should initialize received labels and ContactList to the corresponding services and should call setWalletsAliases', async () => {});
  });

  /* eslint-enable jest/expect-expect, jest/no-disabled-tests */

  describe('fetchEns', () => {
    let getEnsName: jest.Mock;

    beforeEach(() => {
      getEnsName = jest.fn().mockImplementation((address: { address: string }) => `lookup-address-${address.address}`);
      providerService.getProvider.mockReturnValue({
        getEnsName,
      } as unknown as PublicClient);
    });

    describe('when mainnet ens was found', () => {
      test('it should fetch once for ens name if same address is provided', async () => {
        void labelService.fetchEns('0xaddress');
        await labelService.fetchEns('0xaddress');

        expect(providerService.getProvider).toHaveBeenCalledTimes(1);
        expect(getEnsName).toHaveBeenCalledTimes(1);
      });

      test('it should not call smolDomain', async () => {
        const mockedSmolDomainInstance = {
          read: {
            getFirstDefaultDomain: jest.fn().mockResolvedValue('smolEns'),
          },
        };
        contractService.getSmolDomainInstance.mockResolvedValue(
          mockedSmolDomainInstance as unknown as ReturnType<ContractService['getSmolDomainInstance']>
        );
        await labelService.fetchEns('0xaddress');

        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).not.toHaveBeenCalled();
      });

      test('it should use the defaultProvider and return the lookupAddress', async () => {
        await labelService.fetchEns('0xaddress');

        const ensNames = labelService.getEnsNames();
        const result = ensNames['0xaddress'];

        expect(providerService.getProvider).toHaveBeenCalledTimes(1);
        expect(providerService.getProvider).toHaveBeenCalledWith(1);
        expect(getEnsName).toHaveBeenCalledTimes(1);
        expect(getEnsName).toHaveBeenCalledWith({
          address: '0xaddress',
          universalResolverAddress: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62',
        });
        expect(result).toEqual('lookup-address-0xaddress');
      });

      test('it should return null if the lookupAddress fails', async () => {
        // disable console.error for this test
        jest.spyOn(console, 'error').mockImplementation(() => {});

        getEnsName.mockImplementation(() => {
          throw new Error('damn');
        });
        await labelService.fetchEns('0xaddress');

        const ensNames = labelService.getEnsNames();
        const result = ensNames['0xaddress'];

        expect(providerService.getProvider).toHaveBeenCalledTimes(1);
        expect(providerService.getProvider).toHaveBeenCalledWith(1);
        expect(getEnsName).toHaveBeenCalledTimes(1);
        expect(getEnsName).toHaveBeenCalledWith({
          address: '0xaddress',
          universalResolverAddress: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62',
        });
        expect(result).toEqual(null);
      });
    });

    describe('when no ens was found in mainnet', () => {
      let mockedSmolDomainInstance: {
        read: {
          getFirstDefaultDomain: jest.Mock;
        };
      };
      beforeEach(() => {
        mockedSmolDomainInstance = {
          read: {
            getFirstDefaultDomain: jest.fn().mockResolvedValue('smolEns'),
          },
        };
        contractService.getSmolDomainInstance.mockResolvedValue(
          mockedSmolDomainInstance as unknown as ReturnType<ContractService['getSmolDomainInstance']>
        );
        getEnsName.mockRejectedValue(new Error('damn'));

        // disable console.error for this test
        jest.spyOn(console, 'error').mockImplementation(() => {});
      });

      test('it should fetch once for ens name if same address is provided', async () => {
        await labelService.fetchEns('0xaddress');
        await labelService.fetchEns('0xaddress');

        expect(contractService.getSmolDomainInstance).toHaveBeenCalledTimes(1);
        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledTimes(1);
      });

      test('it should assign the smolDomain ens', async () => {
        await labelService.fetchEns('0xaddress');

        const ensNames = labelService.getEnsNames();
        const result = ensNames['0xaddress'];

        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledTimes(1);
        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledWith(['0xaddress']);
        expect(result).toEqual('smolEns');
      });
    });
  });

  describe('fetchManyEns', () => {
    const fetchEnsMock = jest.fn();

    beforeEach(() => {
      fetchEnsMock.mockResolvedValueOnce('ens1.eth').mockResolvedValueOnce('ens2.eth');
      labelService.fetchEns = fetchEnsMock;
    });

    test('it should not call fetchEns if receiving no addresses', async () => {
      await labelService.fetchManyEns([]);

      expect(fetchEnsMock).toHaveBeenCalledTimes(0);
    });

    test('calls fetchEns one time per address with the right parameters', async () => {
      await labelService.fetchManyEns(['0xaddress1', '0xaddress2']);

      expect(fetchEnsMock).toHaveBeenCalledTimes(2);
      expect(fetchEnsMock).toHaveBeenCalledWith('0xaddress1');
      expect(fetchEnsMock).toHaveBeenCalledWith('0xaddress2');
    });
  });

  describe('initialzeWalletEnsNames', () => {
    test('should call fetchManyEns with the correct addresses', async () => {
      accountService.getWallets.mockReturnValue(userMock.wallets);
      const fetchManyEnsMock = jest.fn();
      labelService.fetchManyEns = fetchManyEnsMock;

      await labelService.initializeWalletsEnsNames();

      expect(labelService.fetchManyEns).toHaveBeenCalledTimes(1);
      expect(labelService.fetchManyEns).toHaveBeenCalledWith(['0xaddress', '0xaddress2']);
    });
  });
});
