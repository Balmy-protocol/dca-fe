describe('Provider Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('setProviderInfo', () => {
    describe('when its wallet connect', () => {
      test('it should set the peermeta as the name', async () => {});
    });
  });

  describe('sendTransactionWithGasLimit', () => {
    test('it should add 30% more gas to the gasLimit', async () => {});
  });

  describe('getNetwork', () => {
    describe('when the provider does not exist', () => {
      test('it should return the default network', async () => {});
    });

    describe('when the getNetwork property exist', () => {
      test('it should call and return the getNetwork result', async () => {});
    });

    describe('when the getNetwork property does not exist and the provider has chainId', () => {
      test('it should return the chainId and set the defaultProvider', async () => {});
    });
  });

  describe('getProvider', () => {
    describe('when the signer is defined', () => {
      test('it should return the signer', async () => {});
    });

    describe('when the signer is not defined', () => {
      test('it should return the baseProvider', async () => {});
    });
  });

  describe('getBaseProvider', () => {
    describe('when the provider is defined', () => {
      test('it should return the provider', async () => {});
    });

    describe('when the provider is not defined', () => {
      describe('when network is passed', () => {
        test('it should return the defaultProvider', async () => {});

        test('it should try to detect the eth provider of the browser when the defaultProvider fails', async () => {});
      });

      describe('when the network is not passed', () => {
        test('it should try to detect the eth provider of the browser', async () => {});
      });
    });
  });

  describe('handleChainChanged', () => {
    describe('when the location is the root or create is defined', () => {
      test('it should push to the history with the new chainId', async () => {});
    });

    describe('when the wallet does not support automatically changing the provider=', () => {
      test('it should reload the page', async () => {});
    });
  });

  describe('addEventListeners', () => {
    describe('when the provider does not exist', () => {
      test('it should do nothing', async () => {});
    });

    describe('when the provider exists', () => {
      test('it should set the accountsChange method to handleAccountsChanged', async () => {});

      test('it should set the chainChanged method to handleChainChanged', async () => {});

      describe('when the provider is metamask', () => {
        test('it should set the accountsChange method of window.ethereum to handleAccountsChanged', async () => {});

        test('it should set the chainChanged method of window.ethereum to handleChainChanged', async () => {});
      });
    });
  });

  describe('addNetwork', () => {
    describe('when its an unkown network', () => {
      test('it should do nothing', () => {});
    });

    describe('when its a known network', () => {
      test('it should call the provider methods to add and switch the chain', () => {});

      test('it should reload the page if it is not a wallet that supports changing providers', () => {});

      test('it should call the callback if defined', () => {});
    });
  });

  describe('changeNetwork', () => {
    test('it should call the provider methods to switch the chain', () => {});

    test('it should reload the page if it is not a wallet that supports changing providers', () => {});

    test('it should call the callback if defined', () => {});

    test('it should only call addNetwork if the network is not added to the wallet', () => {});
  });

  describe('attempToAutomaticallyChangeNetwork', () => {
    test('it should call changeNetwork if the wallet supports automatically changing networks', () => {});

    test('it should do nothing if the wallet does not support automatically changing networks', () => {});
  });
});
