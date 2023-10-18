/* eslint-disable jest/expect-expect, jest/no-disabled-tests */

describe.skip('Label Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getStoredLabels', () => {
    test('it should return an empty object as initialized value', async () => {});
    test('it should return the correct value after a successfull fetch', async () => {});
  });

  describe('fetchLabels', () => {
    test('it should not make a request if no user is present', async () => {});
    test('it should make a request with meanApiService and assign the result to the labels property if successfull', async () => {});
    test('it should not change the value of labels if the request fails', async () => {});
  });

  describe('postLabels', () => {
    test('it should not make a request if no user is present', async () => {});
    test('it should update the labels data and then make a request with meanApiService', async () => {});
    test('it should retain the original value of labels if the API call fails', async () => {});
  });

  describe('setWalletsLabels', () => {
    test('it should call setWalletsLabels from accountService with local labels property', () => {});
  });

  describe('initializeLabels', () => {
    test('it should execute fetchLabels and setWalletsLabels local methods', async () => {});
  });
});

/* eslint-enable jest/expect-expect, jest/no-disabled-tests */
