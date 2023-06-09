/* eslint-disable jest/expect-expect, jest/no-disabled-tests */

describe.skip('Price Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getUsdHistoricPrice', () => {
    describe('when date was passed', () => {
      test('it should fetch all the token prices from the historical endpoint of defillama and map the results', async () => {});
    });

    describe('when date was not passed', () => {
      test('it should fetch all the token prices from the current endpoint of defillama and map the results', async () => {});
    });
  });

  describe('getProtocolHistoricPrices', () => {
    test('it should make one call for each of the dates passed to get the protocol token price', async () => {});
  });

  describe('getZrxGasSwapQuote', () => {
    describe('when its on optimism', () => {
      test('it should return the quote estimated gas', async () => {});
    });
    describe('when its not on optimism', () => {
      test('it should return the quote estimated gas', async () => {});
    });
  });

  describe('getPriceForGraph', () => {
    describe('when token A is a stable coin', () => {
      test('it should return the prices based on token A', async () => {});
    });

    describe('when token B is a stable coin', () => {
      test('it should return the prices based on token B', async () => {});
    });

    describe('when no token is a stable coin', () => {
      test('it should return the prices based on token A', async () => {});
    });
  });
});

/* eslint-enable jest/expect-expect, jest/no-disabled-tests */
