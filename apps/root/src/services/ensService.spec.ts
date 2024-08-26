import { createMockInstance } from '@common/utils/tests';
import { NetworkStruct, User, UserStatus, Wallet } from '@types';

import AccountService from './accountService';
import ProviderService from './providerService';
import ContractService from './contractService';
import EnsService from './ensService';
import { PublicClient } from 'viem';

jest.mock('./contractService.ts');
jest.mock('./providerService');
jest.mock('./accountService');

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

describe('ContactList Service', () => {
  let contractService: jest.MockedObject<ContractService>;
  let providerService: jest.MockedObject<ProviderService>;
  let accountService: jest.MockedObject<AccountService>;
  let ensService: EnsService;

  beforeEach(() => {
    accountService = createMockInstance(MockedAccountService);
    providerService = createMockInstance(MockedProviderService);
    contractService = createMockInstance(MockedContractService);
    ensService = new EnsService(contractService, providerService, accountService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('fetchEns', () => {
    let getEnsName: jest.Mock;

    beforeEach(() => {
      getEnsName = jest.fn().mockImplementation((address: { address: string }) => `lookup-address-${address.address}`);
      providerService.getProvider.mockReturnValue({
        getEnsName,
      } as unknown as PublicClient);
    });

    describe('when on arbitrum', () => {
      let mockedSmolDomainInstance: {
        read: {
          getFirstDefaultDomain: jest.Mock;
        };
      };
      beforeEach(() => {
        providerService.getNetwork.mockResolvedValue({ chainId: 42161 } as NetworkStruct);
        mockedSmolDomainInstance = {
          read: {
            getFirstDefaultDomain: jest.fn().mockResolvedValue('smolEns'),
          },
        };
        contractService.getSmolDomainInstance.mockResolvedValue(
          mockedSmolDomainInstance as unknown as ReturnType<ContractService['getSmolDomainInstance']>
        );
      });

      test('it should fetch once for ens name if same address is provided', async () => {
        await ensService.fetchEns('0xaddress');
        await ensService.fetchEns('0xaddress');

        expect(contractService.getSmolDomainInstance).toHaveBeenCalledTimes(1);
        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledTimes(1);
      });

      test('it should assign the smolDomain ens', async () => {
        await ensService.fetchEns('0xaddress');

        const ensNames = ensService.getEnsNames();
        const result = ensNames['0xaddress'];

        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledTimes(1);
        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledWith(['0xaddress']);
        expect(result).toEqual('smolEns');
      });

      test('it should return the normal ens if the smolDomain call fails', async () => {
        mockedSmolDomainInstance.read.getFirstDefaultDomain = jest.fn().mockImplementation(() => {
          throw new Error('blabalbla');
        });
        contractService.getSmolDomainInstance.mockResolvedValue(
          mockedSmolDomainInstance as unknown as ReturnType<ContractService['getSmolDomainInstance']>
        );
        await ensService.fetchEns('0xaddress');

        const ensNames = ensService.getEnsNames();
        const result = ensNames['0xaddress'];

        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledTimes(1);
        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledWith(['0xaddress']);
        expect(getEnsName).toHaveBeenCalledTimes(1);
        expect(getEnsName).toHaveBeenCalledWith({
          address: '0xaddress',
          universalResolverAddress: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62',
        });
        expect(result).toEqual('lookup-address-0xaddress');
      });
    });

    describe('when not on arbitrum', () => {
      beforeEach(() => {
        providerService.getNetwork.mockResolvedValue({ chainId: 137 } as NetworkStruct);
      });

      test('it should fetch once for ens name if same address is provided', async () => {
        void ensService.fetchEns('0xaddress');
        await ensService.fetchEns('0xaddress');

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
        await ensService.fetchEns('0xaddress');

        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).not.toHaveBeenCalled();
      });

      test('it should use the defaultProvider and return the lookupAddress', async () => {
        await ensService.fetchEns('0xaddress');

        const ensNames = ensService.getEnsNames();
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
        getEnsName.mockImplementation(() => {
          throw new Error('damn');
        });
        await ensService.fetchEns('0xaddress');

        const ensNames = ensService.getEnsNames();
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
  });

  describe('fetchManyEns', () => {
    const fetchEnsMock = jest.fn();

    beforeEach(() => {
      fetchEnsMock.mockResolvedValueOnce('ens1.eth').mockResolvedValueOnce('ens2.eth');
      ensService.fetchEns = fetchEnsMock;
    });

    test('it should not call fetchEns if receiving no addresses', async () => {
      await ensService.fetchManyEns([]);

      expect(fetchEnsMock).toHaveBeenCalledTimes(0);
    });

    test('calls fetchEns one time per address with the right parameters', async () => {
      await ensService.fetchManyEns(['0xaddress1', '0xaddress2']);

      expect(fetchEnsMock).toHaveBeenCalledTimes(2);
      expect(fetchEnsMock).toHaveBeenCalledWith('0xaddress1', undefined);
      expect(fetchEnsMock).toHaveBeenCalledWith('0xaddress2', undefined);
    });
  });

  describe('initialzeWalletEnsNames', () => {
    test('should call fetchManyEns with the correct addresses', async () => {
      accountService.user = userMock;
      const fetchManyEnsMock = jest.fn();
      ensService.fetchManyEns = fetchManyEnsMock;

      await ensService.initializeWalletsEnsNames();

      expect(ensService.fetchManyEns).toHaveBeenCalledTimes(1);
      expect(ensService.fetchManyEns).toHaveBeenCalledWith(['0xaddress', '0xaddress2']);
    });
  });
});
