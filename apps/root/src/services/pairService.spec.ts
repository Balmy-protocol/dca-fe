/* eslint-disable jest/expect-expect, jest/no-disabled-tests */

describe.skip('Pair Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('fetchAvailablePairs', () => {
    test('it should fetch and parse all the available pairs from graphql', async () => {});
  });

  describe('availablePairExists', () => {
    test('it should return true or false if a pair exists or not', async () => {});
  });

  describe('canSupportPair', () => {
    test('it should return true if the pair exists in the allowed pairs', async () => {});

    test('it should return false if the pair does not exists in the allowed pairs', async () => {});
  });
});

/* eslint-enable jest/expect-expect, jest/no-disabled-tests */
