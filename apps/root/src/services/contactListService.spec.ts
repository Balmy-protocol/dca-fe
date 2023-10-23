/* eslint-disable jest/expect-expect, jest/no-disabled-tests */

describe.skip('ContactList Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('addContact', () => {
    test('it should not make a request if no user is present', async () => {});
    test('it should update the contactList and then make a request with meanApiService', async () => {});
    test('it should retain the original value of contactList if the API call fails', async () => {});
  });

  describe('removeContact', () => {
    test('it should not make a request if no user is present', async () => {});
    test('it should update the contactList and then make a request with meanApiService', async () => {});
    test('it should retain the original value of contactList if the API call fails', async () => {});
  });

  describe('editContact', () => {
    test('it should not make a request if no user OR no label is present', async () => {});
    test('it should not make a request if contact was not found in contactList', async () => {});
    test('it should update the contactList and then make a request with meanApiService', async () => {});
    test('it should retain the original value of contactList if the API call fails', async () => {});
  });

  describe('getContacts', () => {
    test('it should return stored contactList', () => {});
  });

  describe('setContacts', () => {
    test('it should assign received value to contactList property', () => {});
  });
});

/* eslint-enable jest/expect-expect, jest/no-disabled-tests */
