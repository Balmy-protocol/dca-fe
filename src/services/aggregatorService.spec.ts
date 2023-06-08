describe('Aggregator Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('addGasLimit', () => {
    test('it should add 30% more to the gaslimit than the gas used', async () => {});
  });

  describe('swap', () => {
    test('it should send the transaction', async () => {});
  });

  describe('approveAndSwapSafe', () => {
    test('it should build the transaction by calling the wallet service and submit the transaction to the safeService', async () => {});
  });

  describe('getSwapOptions', () => {
    describe('when its a buy order', () => {
      test('it should call the sdk service, filter failed options and return the full list of options', async () => {});
    });

    describe('when its a sell order', () => {
      test('it should not validate the tx when the balance is under what it wants to sell', async () => {});

      test('it should call the sdk service, filter failed options and return the full list of options', async () => {});
    });
    test('it should', async () => {});
  });

  describe('getSwapOption', () => {
    describe('when its a buy order', () => {
      test('it should call the sdk service and return the specific option', async () => {});
    });

    describe('when its a sell order', () => {
      test('it should not validate the tx when the balance is under what it wants to sell', async () => {});

      test('it should call the sdk service and return the specific option', async () => {});
    });
  });

  describe('findTransferValue', () => {
    test('it should call find logs for transfer, withdraw and deposit and return the mapped array', async () => {});
  });

  describe('findLogs', () => {
    test('it should go through each topic, and return the ones that match the topic', async () => {});

    test('it should use the filter passed to filter logs', async () => {});
  });
});
