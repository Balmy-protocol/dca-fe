import { JsonRpcSigner, Log, TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { ModuleMocker } from 'jest-mock';
import { DCAHubCompanion } from '@mean-finance/dca-v2-periphery/dist';
import { HubContract, TransactionEventTypes, TransactionsHistoryResponse, UserStatus } from '@types';
import TransactionService from './transactionService';
import ContractService from './contractService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import MeanApiService from './meanApiService';
import AccountService from './accountService';

jest.mock('./providerService');
jest.mock('./contractService');
jest.mock('./sdkService');

/**
 * Create mock instance of given class or function constructor
 *
 * @param cl Class constructor
 * @returns New mocked instance of given constructor with all methods mocked
 */

jest.useFakeTimers();

function createMockInstance<T, K>(cl: T) {
  const mocker = new ModuleMocker(global);

  const metadata = mocker.getMetadata(cl);

  if (!metadata) {
    throw new Error('Could not get metadata');
  }

  const Mock = mocker.generateFromMetadata<T>(metadata);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Mock() as jest.MockedObject<K>;
}

const MockedSdkService = jest.mocked(SdkService, { shallow: true });
const MockedContractService = jest.mocked(ContractService, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });
const MockedAccountService = jest.mocked(AccountService, { shallow: true });
describe('Transaction Service', () => {
  let transactionService: TransactionService;
  let sdkService: jest.MockedObject<SdkService>;
  let contractService: jest.MockedObject<ContractService>;
  let providerService: jest.MockedObject<ProviderService>;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let accountService: jest.MockedObject<AccountService>;

  beforeEach(() => {
    sdkService = createMockInstance(MockedSdkService);
    contractService = createMockInstance(MockedContractService);
    providerService = createMockInstance(MockedProviderService);
    meanApiService = createMockInstance(MockedMeanApiService);
    accountService = createMockInstance(MockedAccountService);

    transactionService = new TransactionService(
      contractService as unknown as ContractService,
      providerService as unknown as ProviderService,
      sdkService as unknown as SdkService,
      meanApiService as unknown as MeanApiService,
      accountService as unknown as AccountService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getTransactionReceipt', () => {
    test('it should call the sdk service and return the transaction receipt', async () => {
      sdkService.getTransactionReceipt.mockResolvedValue({ receipt: 'txReceipt' } as unknown as TransactionReceipt);

      const result = await transactionService.getTransactionReceipt('hash', 10);
      expect(sdkService.getTransactionReceipt).toHaveBeenCalledWith('hash', 10);
      expect(result).toEqual({ receipt: 'txReceipt' });
    });
  });

  describe('getTransaction', () => {
    test('it should call the sdk service and return the transaction', async () => {
      sdkService.getTransaction.mockResolvedValue({ transaction: 'transaction' } as unknown as TransactionResponse);

      const result = await transactionService.getTransaction('hash', 10);
      expect(sdkService.getTransaction).toHaveBeenCalledWith('hash', 10);
      expect(result).toEqual({ transaction: 'transaction' });
    });
  });

  describe('waitForTransaction', () => {
    test('it should call the provider service and return the transaction receipt', async () => {
      providerService.waitForTransaction.mockResolvedValue({ receipt: 'txReceipt' } as unknown as TransactionReceipt);

      const result = await transactionService.waitForTransaction('hash');
      expect(providerService.waitForTransaction).toHaveBeenCalledWith('hash');
      expect(result).toEqual({ receipt: 'txReceipt' });
    });
  });

  describe('getBlockNumber', () => {
    test('it should call the provider service and return the block number', async () => {
      providerService.getBlockNumber.mockResolvedValue(5);

      const result = await transactionService.getBlockNumber();
      expect(providerService.getBlockNumber).toHaveBeenCalled();
      expect(result).toEqual(5);
    });
  });

  describe('onBlock', () => {
    describe('when it is loaded as a safe app', () => {
      beforeEach(() => {
        transactionService.setLoadedAsSafeApp(true);
      });

      test('it should set an interval to call the providerService getBlockNumber', async () => {
        const callback = jest.fn();

        providerService.getBlockNumber.mockResolvedValue(10);

        const windowSpy = jest.spyOn(window, 'setInterval');

        await transactionService.onBlock(callback);

        expect(windowSpy).toHaveBeenCalledWith(expect.any(Function), 10000);
        expect(callback).not.toHaveBeenCalled();

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(10000);
        expect(providerService.getBlockNumber).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(expect.any(Promise));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const result = await (callback.mock.calls[0][0] as unknown as Promise<number>);
        expect(result).toEqual(10);
      });
    });
    describe('when it is not loaded as a safe app', () => {
      beforeEach(() => {
        transactionService.setLoadedAsSafeApp(false);
      });

      test('it should call the providerService on block', async () => {
        const callback = jest.fn();

        await transactionService.onBlock(callback);

        expect(providerService.on).toHaveBeenCalledWith('block', callback);
      });
    });
  });

  describe('removeOnBlock', () => {
    test('it should call the provider service to remove the block listener', async () => {
      await transactionService.removeOnBlock();
      expect(providerService.off).toHaveBeenCalledWith('block');
    });
  });

  describe('parseLog', () => {
    beforeEach(() => {
      contractService.getHUBAddress.mockReturnValue('hubAddress');
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
      contractService.getHubInstance.mockResolvedValue({
        interface: { parseLog: jest.fn().mockReturnValue({ name: 'hubLog' }) },
      } as unknown as HubContract);
      contractService.getHUBCompanionInstance.mockResolvedValue({
        interface: { parseLog: jest.fn().mockReturnValue({ name: 'companionLog' }) },
      } as unknown as DCAHubCompanion);
      providerService.getSigner.mockResolvedValue({
        getAddress: jest.fn().mockResolvedValue('account'),
      } as unknown as JsonRpcSigner);
    });

    it('should return the hub parsed log', async () => {
      const hubLog = {
        address: 'hubAddress',
      } as Log;

      const result = await transactionService.parseLog({
        logs: [hubLog],
        chainId: 1,
        eventToSearch: 'hubLog',
        ownerAddress: 'account',
      });

      expect(result).toEqual({ name: 'hubLog' });
    });

    it('should return the companion parsed log', async () => {
      const companionLog = {
        address: 'companionAddress',
      } as Log;

      const result = await transactionService.parseLog({
        logs: [companionLog],
        chainId: 1,
        eventToSearch: 'companionLog',
        ownerAddress: 'account',
      });

      expect(result).toEqual({ name: 'companionLog' });
    });

    it('should return undefined if no logs match the hub or the companion address', async () => {
      const companionLog = {
        address: 'anotherAddress',
      } as Log;

      const result = await transactionService.parseLog({
        logs: [companionLog],
        chainId: 1,
        eventToSearch: 'companionLog',
        ownerAddress: 'account',
      });

      expect(result).toEqual(undefined);
    });

    it('should return the first parsed log of the list', async () => {
      const hubLog = {
        address: 'hubAddress',
      } as Log;
      const companionLog = {
        address: 'anotherAddress',
      } as Log;

      contractService.getHubInstance.mockResolvedValue({
        interface: { parseLog: jest.fn().mockReturnValue({ name: 'event', from: 'hub' }) },
      } as unknown as HubContract);
      contractService.getHUBCompanionInstance.mockResolvedValue({
        interface: { parseLog: jest.fn().mockReturnValue({ name: 'event', from: 'companion' }) },
      } as unknown as DCAHubCompanion);

      const result = await transactionService.parseLog({
        logs: [hubLog, companionLog],
        chainId: 1,
        eventToSearch: 'event',
        ownerAddress: 'account',
      });

      expect(result).toEqual({ name: 'event', from: 'hub' });
    });

    it('should not fail on failing to parse a log', async () => {
      const hubLog = {
        address: 'hubAddress',
      } as Log;
      const companionLog = {
        address: 'anotherAddress',
      } as Log;

      contractService.getHubInstance.mockResolvedValue({
        interface: { parseLog: jest.fn().mockReturnValue({ name: 'event', from: 'hub' }) },
      } as unknown as HubContract);
      contractService.getHUBCompanionInstance.mockResolvedValue({
        interface: {
          parseLog: jest.fn().mockImplementation(() => {
            throw new Error('blabalbla');
          }),
        },
      } as unknown as DCAHubCompanion);

      const result = await transactionService.parseLog({
        logs: [hubLog, companionLog],
        chainId: 1,
        eventToSearch: 'event',
        ownerAddress: 'account',
      });

      expect(result).toEqual({ name: 'event', from: 'hub' });
    });
  });

  describe('fetchTransactionsHistory', () => {
    const userId = 'wallet:validUserId';
    const walletSignature = {
      message: 'signature',
      expiration: 'expiration',
      signer: 'signer',
    };

    const baseApprovalEvent = {
      chainId: 10,
      txHash: '0xTxHash',
      spentInGas: '100',
      nativePrice: 10,
      token: '0xToken',
      owner: '0xOwner',
      spender: '0xSpender',
      amount: '100',
    };

    const initialHistoryResponse: TransactionsHistoryResponse = {
      events: [
        {
          ...baseApprovalEvent,
          type: TransactionEventTypes.ERC20_APPROVAL,
          timestamp: 100,
        },
        {
          ...baseApprovalEvent,
          type: TransactionEventTypes.ERC20_APPROVAL,
          timestamp: 99,
        },
        {
          ...baseApprovalEvent,
          type: TransactionEventTypes.ERC20_APPROVAL,
          timestamp: 98,
        },
      ],
      indexing: {
        ['0xWallet01']: {
          [10]: {
            detectedUpTo: '100',
            processedUpTo: '100',
            target: '200',
          },
        },
      },
      pagination: {
        moreEvents: true,
      },
    };

    let mockGetHistoryApiCall: jest.Mock;

    beforeEach(() => {
      accountService.getUser.mockReturnValue({
        id: userId,
        wallets: [],
        status: UserStatus.loggedIn,
        label: 'validUser',
        signature: walletSignature,
      });
      accountService.getWalletVerifyingSignature.mockResolvedValue(walletSignature);

      mockGetHistoryApiCall = jest.fn();
      meanApiService.getAccountTransactionsHistory = mockGetHistoryApiCall;
      mockGetHistoryApiCall.mockResolvedValue(initialHistoryResponse);
    });

    test('should not assign transactionsHistory if no user is provided', async () => {
      accountService.getUser.mockReturnValue(undefined);
      await transactionService.fetchTransactionsHistory();

      const storedHistory = transactionService.getStoredTransactionsHistory();
      expect(storedHistory).toBeUndefined();
    });

    describe('when beforeTimestamp is not provided', () => {
      test('should make a request with the correct parameters', async () => {
        await transactionService.fetchTransactionsHistory();

        expect(mockGetHistoryApiCall).toHaveBeenCalledTimes(1);
        expect(mockGetHistoryApiCall).toHaveBeenCalledWith({
          accountId: userId,
          signature: walletSignature,
        });
      });

      test('should deep asign the response into the service store', async () => {
        await transactionService.fetchTransactionsHistory();
        const storedHistory = transactionService.getStoredTransactionsHistory();
        expect(storedHistory).toEqual(initialHistoryResponse);
      });
    });

    describe('when beforeTimestamp is provided', () => {
      test('should make a request with the correct parameters', async () => {
        await transactionService.fetchTransactionsHistory(500);

        expect(mockGetHistoryApiCall).toHaveBeenCalledTimes(1);
        expect(mockGetHistoryApiCall).toHaveBeenCalledWith({
          accountId: userId,
          signature: walletSignature,
          beforeTimestamp: 500,
        });
      });

      test('should updated indexing, pagination and append fetched events based on beforeTimestamp value', async () => {
        transactionService.transactionsHistory = initialHistoryResponse;
        const olderFetchedEvent = { ...baseApprovalEvent, type: TransactionEventTypes.ERC20_APPROVAL, timestamp: 97 };
        const newApiResponse = {
          events: [olderFetchedEvent],
          indexing: {
            ['0xWallet01']: {
              [10]: {
                processedUpTo: '50',
                detectedUpTo: '100',
                target: '100',
              },
            },
          },
          pagination: {
            moreEvents: false,
          },
        };
        mockGetHistoryApiCall.mockResolvedValueOnce(newApiResponse);

        const olderStoredTimestamp = initialHistoryResponse.events[initialHistoryResponse.events.length - 1].timestamp;
        await transactionService.fetchTransactionsHistory(olderStoredTimestamp);
        const storedHistory = transactionService.getStoredTransactionsHistory();

        expect(storedHistory).toEqual({
          ...newApiResponse,
          events: [...initialHistoryResponse.events, olderFetchedEvent],
        });
      });
    });
  });
});
