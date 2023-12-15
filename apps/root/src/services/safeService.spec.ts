import SafeAppsSDK from '@safe-global/safe-apps-sdk';

import SafeService from './safeService';

jest.mock('@safe-global/safe-apps-sdk');

/**
 * Create mock instance of given class or function constructor
 *
 * @param cl Class constructor
 * @returns New mocked instance of given constructor with all methods mocked
 */

jest.useFakeTimers();

const MockedSafeAppSdk = jest.mocked(SafeAppsSDK, { shallow: true });

describe('Safe Service', () => {
  let safeService: SafeService;
  let getBySafeTxHashMock: jest.Mock;
  let sendMock: jest.Mock;
  let getInfoMock: jest.Mock;

  beforeEach(() => {
    getBySafeTxHashMock = jest.fn().mockResolvedValue({ txHash: 'txHash' });
    sendMock = jest.fn().mockResolvedValue({ hash: 'sendHash' });
    getInfoMock = jest.fn().mockResolvedValue({ safeAddres: 'address' });
    MockedSafeAppSdk.mockImplementation(
      () =>
        ({
          txs: {
            getBySafeTxHash: getBySafeTxHashMock,
            send: sendMock,
          },
          safe: {
            getInfo: getInfoMock,
          },
        }) as unknown as SafeAppsSDK
    );

    safeService = new SafeService();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    test('it should create a safeAppSdk instance', () => {
      expect(MockedSafeAppSdk).toHaveBeenCalledTimes(1);
    });
  });

  describe('getHashFromSafeTxHash', () => {
    test('it should return the underlying tx hash based on the safe tx hash', async () => {
      const result = await safeService.getHashFromSafeTxHash('safeTxHash');

      expect(getBySafeTxHashMock).toHaveBeenCalledTimes(1);
      expect(getBySafeTxHashMock).toHaveBeenCalledWith('safeTxHash');
      expect(result).toEqual('txHash');
    });
  });

  describe('isSafeApp', () => {
    test('it should return false if its not on an iframe', async () => {
      const result = await safeService.isSafeApp();
      expect(result).toEqual(false);
    });

    test('it should return true if the info exists', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const windowSpy = jest.spyOn(window, 'parent', 'get');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      windowSpy.mockImplementation(() => undefined);
      const result = await safeService.isSafeApp();

      expect(getInfoMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(true);
    });

    test('it should return false if the info does not exist', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const windowSpy = jest.spyOn(window, 'parent', 'get');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      windowSpy.mockImplementation(() => undefined);
      getInfoMock.mockResolvedValue(undefined);
      const result = await safeService.isSafeApp();

      expect(getInfoMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(false);
    });

    test('it should return false if the timer ends before the sdk responds', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const windowSpy = jest.spyOn(window, 'parent', 'get');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      windowSpy.mockImplementation(() => undefined);

      getInfoMock.mockReturnValueOnce(new Promise((resolve) => setTimeout(resolve, 10000, { safeAddres: 'address' })));
      const resultPromise = safeService.isSafeApp();
      jest.advanceTimersByTime(3000);

      return resultPromise.then((result) => expect(result).toEqual(false));
    });
  });

  describe('submitMultipleTxs', () => {
    test('it should parse the value when sent as a string', async () => {
      const result = await safeService.submitMultipleTxs([
        {
          from: '0xfrom',
          to: '0xto',
          value: 10n,
          data: '0xdata',
        },
      ]);

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledWith({
        txs: [
          {
            from: '0xfrom',
            to: '0xto',
            value: 10n,
            data: '0xdata',
          },
        ],
      });
      expect(result).toEqual({ hash: 'sendHash' });
    });

    test('it should parse the value when sent as a bigint', async () => {
      const result = await safeService.submitMultipleTxs([
        {
          from: '0xfrom',
          to: '0xto',
          value: BigInt(9),
          data: '0xdata',
        },
      ]);

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledWith({
        txs: [
          {
            from: '0xfrom',
            to: '0xto',
            value: '9',
            data: '0xdata',
          },
        ],
      });
      expect(result).toEqual({ hash: 'sendHash' });
    });

    test('it should parse the value when sent as a number', async () => {
      const result = await safeService.submitMultipleTxs([
        {
          from: '0xfrom',
          to: '0xto',
          value: 11n,
          data: '0xdata',
        },
      ]);

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledWith({
        txs: [
          {
            from: '0xfrom',
            to: '0xto',
            value: '11',
            data: '0xdata',
          },
        ],
      });
      expect(result).toEqual({ hash: 'sendHash' });
    });

    test('it should set the value to 0 if it does not exist', async () => {
      const result = await safeService.submitMultipleTxs([
        {
          from: '0xfrom',
          to: '0xto',
          data: '0xdata',
        },
      ]);

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledWith({
        txs: [
          {
            from: '0xfrom',
            to: '0xto',
            value: '0',
            data: '0xdata',
          },
        ],
      });
      expect(result).toEqual({ hash: 'sendHash' });
    });

    test('it should extend the transaction request object', async () => {
      const result = await safeService.submitMultipleTxs([
        {
          from: '0xfrom',
          to: '0xto',
          value: 10n,
          data: '0xdata',
          nonce: 1,
        },
      ]);

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledWith({
        txs: [
          {
            from: '0xfrom',
            to: '0xto',
            value: '10',
            data: '0xdata',
            nonce: 1,
            gasLimit: 2,
          },
        ],
      });
      expect(result).toEqual({ hash: 'sendHash' });
    });
  });
});
