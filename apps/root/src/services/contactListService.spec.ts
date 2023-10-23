/* eslint-disable jest/expect-expect, jest/no-disabled-tests */

describe.skip('ContactList Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('addContact', () => {});

  describe('removeContact', () => {});

  describe('editContact', () => {});

  describe('getContacts', () => {
    test('it should return stored contactList', () => {});
  });

  describe('setContacts', () => {
    test('it should assign received value to contactList property');
  });
});

/* eslint-enable jest/expect-expect, jest/no-disabled-tests */
