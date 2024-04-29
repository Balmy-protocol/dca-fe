import { Address, Log, Transaction, decodeEventLog } from 'viem';
import { ModuleMocker } from 'jest-mock';
import { TransactionEventTypes, TransactionsHistoryResponse, UserStatus, TransactionReceipt } from '@types';
import TransactionService from './transactionService';
import ContractService from './contractService';
import ProviderService from './providerService';
import SdkService from './sdkService';
import MeanApiService from './meanApiService';
import AccountService from './accountService';

jest.mock('./providerService');
jest.mock('./accountService');
jest.mock('./meanApiService');
jest.mock('./contractService');
jest.mock('./sdkService');

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('viem', () => ({
  ...jest.requireActual('viem'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  decodeEventLog: jest.fn(),
}));

const mockedDecodeEventLog = jest.mocked(decodeEventLog, { shallow: true });
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

      const result = await transactionService.getTransactionReceipt('0xhash', 10);
      expect(sdkService.getTransactionReceipt).toHaveBeenCalledWith('0xhash', 10);
      expect(result).toEqual({ receipt: 'txReceipt' });
    });
  });

  describe('getTransaction', () => {
    test('it should call the sdk service and return the transaction', async () => {
      sdkService.getTransaction.mockResolvedValue({ transaction: 'transaction' } as unknown as Transaction);

      const result = await transactionService.getTransaction('0xhash', 10);
      expect(sdkService.getTransaction).toHaveBeenCalledWith('0xhash', 10);
      expect(result).toEqual({ transaction: 'transaction' });
    });
  });

  describe('waitForTransaction', () => {
    test('it should call the provider service and return the transaction receipt', async () => {
      providerService.waitForTransaction.mockResolvedValue({ receipt: 'txReceipt' } as unknown as TransactionReceipt);

      const result = await transactionService.waitForTransaction('0xhash', 10);
      expect(providerService.waitForTransaction).toHaveBeenCalledWith('0xhash', 10);
      expect(result).toEqual({ receipt: 'txReceipt' });
    });
  });

  describe('getBlockNumber', () => {
    test('it should call the provider service and return the block number', async () => {
      providerService.getBlockNumber.mockResolvedValue(5n);

      const result = await transactionService.getBlockNumber(1);
      expect(providerService.getBlockNumber).toHaveBeenCalled();
      expect(providerService.getBlockNumber).toHaveBeenCalledWith(1);
      expect(result).toEqual(5n);
    });
  });

  describe('onBlock', () => {
    describe('when it is loaded as a safe app', () => {
      beforeEach(() => {
        transactionService.setLoadedAsSafeApp(true);
      });

      test('it should set an interval to call the providerService getBlockNumber', async () => {
        const callback = jest.fn();

        providerService.getBlockNumber.mockResolvedValue(10n);

        const windowSpy = jest.spyOn(window, 'setInterval');

        transactionService.onBlock(10, callback);

        expect(windowSpy).toHaveBeenCalledWith(expect.any(Function), 10000);
        expect(callback).not.toHaveBeenCalled();

        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(10000);
        expect(providerService.getBlockNumber).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(expect.any(Promise));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const result = await (callback.mock.calls[0][0] as unknown as Promise<number>);
        expect(result).toEqual(10n);
      });
    });
    describe('when it is not loaded as a safe app', () => {
      beforeEach(() => {
        transactionService.setLoadedAsSafeApp(false);
      });

      test('it should call the providerService on block', () => {
        const callback = jest.fn();

        transactionService.onBlock(10, callback);

        expect(providerService.onBlock).toHaveBeenCalledWith(10, callback);
      });
    });
  });

  describe('removeOnBlock', () => {
    let removeCallbackMock: jest.Mock;
    beforeEach(() => {
      removeCallbackMock = jest.fn();
      transactionService.onBlockCallbacks = {
        10: removeCallbackMock,
      };
    });
    test('it should call the callback to remove the listener', () => {
      transactionService.removeOnBlock(10);

      expect(removeCallbackMock).toHaveBeenCalled();
    });

    test('it should do nothing if there is no callback', () => {
      transactionService.removeOnBlock(20);

      expect(removeCallbackMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('parseLog', () => {
    beforeEach(() => {
      contractService.getHUBAddress.mockReturnValue('0xhubAddress');
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
      contractService.getHubInstance.mockResolvedValue({
        contractAddress: '0xhubAddress',
      } as unknown as ReturnType<ContractService['getHubInstance']>);
      contractService.getHUBCompanionInstance.mockResolvedValue({
        contractAddress: '0xcompanionAddress',
      } as unknown as ReturnType<ContractService['getHUBCompanionInstance']>);
    });

    it('should return the hub parsed log', async () => {
      mockedDecodeEventLog.mockReturnValue({ eventName: 'hubLog', args: { address: '0xhubAddress' } });
      const hubLog = {
        address: '0xhubAddress',
      } as unknown as Log;

      const result = await transactionService.parseLog({
        logs: [hubLog],
        chainId: 1,
        eventToSearch: 'hubLog',
      });

      expect(mockedDecodeEventLog).toHaveBeenCalledTimes(1);
      expect(mockedDecodeEventLog).toHaveBeenCalledWith({
        address: '0xhubAddress',
        contractAddress: '0xhubAddress',
      });
      expect(result).toEqual({ eventName: 'hubLog', args: { address: '0xhubAddress' } });
    });

    it('should return the companion parsed log', async () => {
      mockedDecodeEventLog.mockReturnValue({ eventName: 'companionLog', args: { address: '0xcompanionAddress' } });

      const companionLog = {
        address: '0xcompanionAddress',
      } as unknown as Log;

      const result = await transactionService.parseLog({
        logs: [companionLog],
        chainId: 1,
        eventToSearch: 'companionLog',
      });

      expect(mockedDecodeEventLog).toHaveBeenCalledTimes(1);
      expect(mockedDecodeEventLog).toHaveBeenCalledWith({
        address: '0xcompanionAddress',
        contractAddress: '0xcompanionAddress',
      });
      expect(result).toEqual({ eventName: 'companionLog', args: { address: '0xcompanionAddress' } });
    });

    it('should return undefined if no logs match the hub or the companion address', async () => {
      const companionLog = {
        address: 'anotherAddress',
      } as unknown as Log;

      const result = await transactionService.parseLog({
        logs: [companionLog],
        chainId: 1,
        eventToSearch: 'companionLog',
      });

      expect(result).toEqual(undefined);
    });

    it('should return the first parsed log of the list', async () => {
      const hubLog = {
        address: '0xhubAddress',
      } as unknown as Log;
      const companionLog = {
        address: '0xcompanionAddress',
      } as unknown as Log;

      mockedDecodeEventLog
        .mockReturnValueOnce({ eventName: 'event', args: { address: '0xhubAddress' } })
        .mockReturnValueOnce({ eventName: 'event', args: { address: '0xcompanionAddress' } });

      const result = await transactionService.parseLog({
        logs: [hubLog, companionLog],
        chainId: 1,
        eventToSearch: 'event',
      });

      expect(result).toEqual({ eventName: 'event', args: { address: '0xhubAddress' } });
    });

    it('should not fail on failing to parse a log', async () => {
      const hubLog = {
        address: '0xhubAddress',
      } as unknown as Log;
      const companionLog = {
        address: 'anotherAddress',
      } as unknown as Log;

      mockedDecodeEventLog
        .mockReturnValueOnce({ eventName: 'event', args: { address: '0xhubAddress' } })
        // @ts-expect-error we want to return the error
        .mockReturnValueOnce(new Error('lol'));

      const result = await transactionService.parseLog({
        logs: [hubLog, companionLog],
        chainId: 1,
        eventToSearch: 'event',
      });

      expect(result).toEqual({ eventName: 'event', args: { address: '0xhubAddress' } });
    });
  });

  describe('fetchTransactionsHistory', () => {
    const userId = 'wallet:validUserId';
    const walletSignature = {
      message: 'signature',
      expiration: 'expiration',
      signer: '0xsigner' as Address,
      wallet: 'wallet',
      chainId: 10,
    };

    const baseApprovalEvent = {
      tx: {
        chainId: 10,
        txHash: '0xTxHash' as Address,
        spentInGas: '100',
        nativePrice: 10,
        initiatedBy: '0xfrom' as Address,
      },
      data: {
        token: '0xToken' as Address,
        owner: '0xOwner' as Address,
        spender: '0xSpender' as Address,
        amount: '100',
      },
    };

    const initialHistoryResponse: TransactionsHistoryResponse = {
      events: [
        {
          ...baseApprovalEvent,
          tx: {
            ...baseApprovalEvent.tx,
            timestamp: 100,
          },
          type: TransactionEventTypes.ERC20_APPROVAL,
        },
        {
          ...baseApprovalEvent,
          tx: {
            ...baseApprovalEvent.tx,
            timestamp: 99,
          },
          type: TransactionEventTypes.ERC20_APPROVAL,
        },
        {
          ...baseApprovalEvent,
          tx: {
            ...baseApprovalEvent.tx,
            timestamp: 98,
          },
          type: TransactionEventTypes.ERC20_APPROVAL,
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
      try {
        await transactionService.fetchTransactionsHistory();
        expect(1).toEqual(2);
      } catch (e) {
        const storedHistory = transactionService.getStoredTransactionsHistory();
        // eslint-disable-next-line jest/no-conditional-expect
        expect(storedHistory.history).toBeUndefined();
        // eslint-disable-next-line jest/no-conditional-expect
        expect(storedHistory.isLoading).toBe(false);
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toBeInstanceOf(Error);
      }
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
        expect(storedHistory.history).toEqual(initialHistoryResponse);
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
        transactionService.transactionsHistory.history = initialHistoryResponse;
        const olderFetchedEvent = {
          ...baseApprovalEvent,
          type: TransactionEventTypes.ERC20_APPROVAL,
          tx: { ...baseApprovalEvent.tx, timestamp: 97 },
        };
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

        const olderStoredTimestamp =
          initialHistoryResponse.events[initialHistoryResponse.events.length - 1].tx.timestamp;
        await transactionService.fetchTransactionsHistory(olderStoredTimestamp);
        const storedHistory = transactionService.getStoredTransactionsHistory();

        expect(storedHistory.history).toEqual({
          ...newApiResponse,
          events: [...initialHistoryResponse.events, olderFetchedEvent],
        });
      });

      test('should not assign non-indexed addresses to service data', async () => {
        mockGetHistoryApiCall.mockResolvedValueOnce({
          ...initialHistoryResponse,
          indexing: {
            '0xWallet1': { [1]: { processedUpTo: 100, detectedUpTo: 100, target: 100 } },
            '0xWalletError': { error: 'This wallet is not being indexed' },
          },
        });

        await transactionService.fetchTransactionsHistory();

        const storedHistory = transactionService.getStoredTransactionsHistory();

        expect(storedHistory.history?.indexing['0xWallet1']).toEqual({
          [1]: { processedUpTo: 100, detectedUpTo: 100, target: 100 },
        });
        expect(storedHistory.history?.indexing['0xWalletError']).toBeUndefined();
      });
    });
  });
});
