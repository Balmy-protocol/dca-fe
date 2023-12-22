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
});

/* eslint-enable jest/expect-expect, jest/no-disabled-tests */
