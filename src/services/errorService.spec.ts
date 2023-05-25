import { createMockInstance } from '@common/utils/tests';
import ErrorService from './errorService';
import MeanApiService from './meanApiService';

jest.mock('./meanApiService');

const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });

describe('Transaction Service', () => {
  let errorService: ErrorService;
  let meanApiService: jest.MockedObject<MeanApiService>;

  beforeEach(() => {
    meanApiService = createMockInstance(MockedMeanApiService);
    errorService = new ErrorService(meanApiService as unknown as MeanApiService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('logError', () => {
    test('it should call the meanApiService and send the error and extra data', async () => {
      await errorService.logError('Some error', 'Some error message', { someProp: 'someValue' });
      expect(meanApiService.logError).toHaveBeenCalledTimes(1);
      expect(meanApiService.logError).toHaveBeenCalledWith('Some error', 'Some error message', {
        someProp: 'someValue',
      });
    });
  });
});
