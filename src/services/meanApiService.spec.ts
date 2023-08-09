/* eslint-disable jest/expect-expect, jest/no-disabled-tests */

describe.skip('Mean API Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getDeadlineSlippageDefault', () => {
    test('it should return the default deadline and slippage when its a safe app', async () => {});

    test('it should return an empty object when its not a safe app', async () => {});
  });

  describe('getUnderlyingTokens', () => {
    test('it should filter tokens that dont have an underlying and return the underlying data from the api', async () => {});
  });

  describe('migratePosition', () => {
    test('it should call the mean api and send the transaction', async () => {});
  });

  describe('getAllowedPairs', () => {
    test('it should call the mean api and map the tokens to the Token object', async () => {});
  });

  describe('logError', () => {
    test('it should call the mean api to log the error', async () => {});
  });

  describe('logFeedback', () => {
    test('it should call the mean api to log the feedback', async () => {});
  });

  describe('trackEvent', () => {
    test('it should call the mean api to track the event', async () => {});
  });

  describe('simulateTransaction', () => {
    test('it should call the mean api to simulate the transaction', async () => {});
  });

  describe('getCampaigns', () => {
    describe('Optimism campaing', () => {
      test('it should call the mean api to get the user proof and return the campaign', async () => {});
    });
  });
});
/* eslint-enable jest/expect-expect, jest/no-disabled-tests */
