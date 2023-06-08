describe('Sdk Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getSwapOption', () => {
    test('it should fetch a specific swap option', async () => {});
  });

  describe('getSwapOptions', () => {
    describe('when the takerAddress is defined', () => {
      test('it should getAllQuotes', async () => {});
    });

    describe('when the takerAddress is not defined', () => {
      test('it should estimate the quotes', async () => {});
    });
  });

  describe('getCustomToken', () => {
    describe('when the token is not a valid address', () => {
      test('it should return undefined', () => {});
    });

    describe('when the token chain is the same as the connected one', () => {
      test('it should call the walletService getCustomToken method', () => {});
    });

    test('it should get the token from the sdk and return it with the balance', () => {});

    test('it should return false if the sdk cannot fetch the token', () => {});
  });

  describe('getMultipleBalances', () => {
    test('it should return the mapped balances into BigNumbers', () => {});
  });

  describe('getMultipleAllowances', () => {
    test('it should return the mapped allowances into BigNumbers', () => {});
  });
});
