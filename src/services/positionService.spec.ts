/* eslint-disable jest/expect-expect, jest/no-disabled-tests */

import { TransactionTypes } from '@types';

describe.skip('Position Service', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getCurrentPositions', () => {
    test('it should return all positions ordered by startDate', async () => {});
  });

  describe('fetchCurrentPositions', () => {
    test('it should fetch positions from all chains', async () => {});

    test('it fetch the underlying balances of each of the tokens that are wrapped', async () => {});

    test('it should set the current positions of the current users', () => {});
  });

  describe('getSignatureForPermission', () => {
    describe('when an address is passed', () => {
      test('it should use the specific permission manager address for the signature', () => {});
    });

    describe('when the erc712 name is passed', () => {
      test('it should use the specific name address for the signature', () => {});
    });

    test('it should build a signature by extending the position permissions', () => {});
  });

  describe('migrateYieldPosition', () => {
    describe('when the companion does not have terminate permissions', () => {
      test('it should ask for a signature before calling the meanApiService', () => {});
    });

    describe('when the companion does have terminate permissions', () => {
      test('it should not ask for a signature before calling the meanApiService', () => {});
    });
  });

  describe('companionHasPermission', () => {
    test('it should use the latest companion to call the permission manager to get the permission', () => {});
  });

  describe('modifyPermissions', () => {
    test('it should call the modify of the permissionManager with the new permissions', () => {});
  });

  describe('transfer', () => {
    test('it should call the transferFrom of the permissionManager for the new user', () => {});
  });

  describe('getTokenNFT', () => {
    test('it should call the tokenUri of the permissionManager and parse the json result', () => {});
  });

  describe('buildDepositParams', () => {
    describe('when the amount of swaps is higher than the max', () => {
      test('it should throw an error', () => {});
    });

    describe('when the from has yield', () => {
      test('it should add the increase, reduce and terminate permissions', () => {});
    });

    describe('when the to has yield', () => {
      test('it should add the withdraw and terminate permissions', () => {});
    });

    describe('when no token has yield', () => {
      test('it should not add any permission to the position', () => {});
    });
  });

  describe('buildDepositTx', () => {
    describe('when the from has yield', () => {
      test('it should get the transaction from the mean api', () => {});
    });

    describe('when the from is the protocol token', () => {
      test('it should get the transaction from the mean api', () => {});
    });

    test('it should populate the transaction from the hub', () => {});
  });

  describe('approveAndDepositSafe', () => {
    test('it should call the safeService with the bundled approve and deposit transactions', () => {});
  });

  describe('deposit', () => {
    test('it should get the tx from buildDepositTx and submit it', () => {});
  });

  describe('withdraw', () => {
    describe('when the to is not the protocol token, nor the wrapped token and useProtocolToken is sent', () => {
      test('it should throw an error', () => {});
    });

    describe('when the TO doesnt have yield and is not protocol token', () => {
      test('it should call the hub instance directly', () => {});
    });

    describe('when the TO has yield', () => {
      describe('when the companion doesnt have permissions', () => {
        test('it should not ask for a signature', () => {});
      });

      describe('when the companion has withdraw permission', () => {
        test('it should ask for a permission signature', () => {});
      });
    });

    describe('when the TO is the protocol token', () => {
      describe('when useProtocol token is false', () => {
        it('should call the hub instance directly', () => {});
      });

      describe('when the companion doesnt have permissions', () => {
        test('it should not ask for a signature', () => {});
      });

      describe('when the companion has withdraw permission', () => {
        test('it should ask for a permission signature', () => {});
      });
    });
  });

  describe('terminate', () => {
    describe('when the TO or FROM are not the protocol token, nor the wrapped token and useProtocolToken is sent', () => {
      test('it should throw an error', () => {});
    });

    describe('when the TO and FROM dont have yield and is not protocol token', () => {
      test('it should call the hub instance directly', () => {});
    });

    describe('when the TO or FROM has yield', () => {
      describe('when the companion doesnt have permissions', () => {
        test('it should not ask for a signature', () => {});
      });

      describe('when the companion has terminate permission', () => {
        test('it should ask for a permission signature', () => {});
      });
    });

    describe('when the TO or FROM are the protocol token', () => {
      describe('when useProtocol token is false', () => {
        it('should call the hub instance directly', () => {});
      });

      describe('when the companion doesnt have permissions', () => {
        test('it should not ask for a signature', () => {});
      });

      describe('when the companion has terminate permission', () => {
        test('it should ask for a permission signature', () => {});
      });
    });
  });

  describe('terminateManyRaw', () => {
    describe('when there are positions on different chains', () => {
      test('it should throw an error', () => {});
    });

    test('it should call the companion multicall with all the terminate transactions', () => {});
  });

  describe('givePermissionToMultiplePositions', () => {
    describe('when there are positions on different chains', () => {
      test('it should throw an error', () => {});
    });

    test('it should call the permission manager with the modify many transactions', () => {});
  });

  describe('buildModifyRateAndSwapsParams', () => {
    describe('when the from isnt protocol or wrapped token and useWrappedProtocolToken was passed', () => {
      test('it should throw an error', () => {});
    });

    describe('when the amount of swaps is higher than the max', () => {
      test('it should throw an error', () => {});
    });

    test('it should build the parameters for the modify', () => {});
  });

  describe('getModifyRateAndSwapsSignature', () => {
    test('it should build the signature to add the permissions for increaase', () => {});

    test('it should build the signature to add the permissions for reduce', () => {});
  });

  describe('buildModifyRateAndSwapsTx', () => {
    describe('when its increasing the position', () => {
      describe('when the from has yield', () => {
        test('it should get the transaction from the mean api', () => {});

        test('it should get the signature if the companion does not has permissions', () => {});
      });

      describe('when the from is the protocol token', () => {
        test('it should get the transaction from the mean api', () => {});

        test('it should get the signature if the companion does not has permissions', () => {});
      });

      test('it should populate the transaction from the hub', () => {});
    });

    describe('when its reducing the position', () => {
      describe('when the from has yield', () => {
        test('it should get the transaction from the mean api', () => {});

        test('it should get the signature if the companion does not has permissions', () => {});
      });

      describe('when the from is the protocol token', () => {
        test('it should get the transaction from the mean api', () => {});

        test('it should get the signature if the companion does not has permissions', () => {});
      });

      test('it should populate the transaction from the hub', () => {});
    });
  });

  describe('approveAndModifyRateAndSwapsSafe', () => {
    test('it should call the safeService with the bundled approve and modify transactions', () => {});
  });

  describe('modifyRateAndSwaps', () => {
    test('it should get the tx from buildModifyRateAndSwapsTx and submit it', () => {});
  });

  describe('setPendingTransaction', () => {
    [
      { type: TransactionTypes.newPair },
      { type: TransactionTypes.approveToken },
      { type: TransactionTypes.approveTokenExact },
      { type: TransactionTypes.swap },
      { type: TransactionTypes.wrap },
      { type: TransactionTypes.claimCampaign },
      { type: TransactionTypes.unwrap },
      { type: TransactionTypes.wrapEther },
    ].forEach((tx) => {
      test(`it should do nothing for ${tx.type} transactions`, () => {});
    });

    describe('when the traction is for a new position', () => {
      test('it should add the new position to the currentPositions object', () => {});
    });

    [{ type: TransactionTypes.eulerClaimPermitMany }, { type: TransactionTypes.eulerClaimTerminateMany }].forEach(
      (tx) => {
        test(`it should update all the positions for the ${tx.type} transaction`, () => {});
      }
    );

    test('it should add the position from the transaction if it doesnt exist', () => {});

    test('it should set the position as pending', () => {});
  });

  describe('handleTransactionRejection', () => {
    [
      { type: TransactionTypes.newPair },
      { type: TransactionTypes.approveToken },
      { type: TransactionTypes.approveTokenExact },
      { type: TransactionTypes.swap },
      { type: TransactionTypes.wrap },
      { type: TransactionTypes.claimCampaign },
      { type: TransactionTypes.unwrap },
      { type: TransactionTypes.wrapEther },
    ].forEach((tx) => {
      test(`it should do nothing for ${tx.type} transactions`, () => {});
    });

    describe('when the traction is for a new position', () => {
      test('it should delete the pending position', () => {});
    });

    [{ type: TransactionTypes.eulerClaimPermitMany }, { type: TransactionTypes.eulerClaimTerminateMany }].forEach(
      (tx) => {
        test(`it should update all the positions for the ${tx.type} transaction`, () => {});
      }
    );

    test('it should remove the pending status of the position', () => {});
  });

  describe('handleTransaction', () => {
    [
      { type: TransactionTypes.newPair },
      { type: TransactionTypes.approveToken },
      { type: TransactionTypes.approveTokenExact },
      { type: TransactionTypes.swap },
      { type: TransactionTypes.wrap },
      { type: TransactionTypes.claimCampaign },
      { type: TransactionTypes.unwrap },
      { type: TransactionTypes.wrapEther },
    ].forEach((tx) => {
      test(`it should do nothing for ${tx.type} transactions`, () => {});
    });

    [
      { expected: {}, transaction: { type: TransactionTypes.newPosition } },
      { expected: {}, transaction: { type: TransactionTypes.terminatePosition } },
      { expected: {}, transaction: { type: TransactionTypes.eulerClaimTerminateMany } },
      { expected: {}, transaction: { type: TransactionTypes.migratePosition } },
      { expected: {}, transaction: { type: TransactionTypes.migratePositionYield } },
      { expected: {}, transaction: { type: TransactionTypes.withdrawPosition } },
      { expected: {}, transaction: { type: TransactionTypes.addFundsPosition } },
      { expected: {}, transaction: { type: TransactionTypes.resetPosition } },
      { expected: {}, transaction: { type: TransactionTypes.removeFunds } },
      { expected: {}, transaction: { type: TransactionTypes.modifySwapsPosition } },
      { expected: {}, transaction: { type: TransactionTypes.modifyRateAndSwapsPosition } },
      { expected: {}, transaction: { type: TransactionTypes.withdrawFunds } },
      { expected: {}, transaction: { type: TransactionTypes.transferPosition } },
      { expected: {}, transaction: { type: TransactionTypes.modifyPermissions } },
      { expected: {}, transaction: { type: TransactionTypes.eulerClaimPermitMany } },
    ].forEach((testItem) => {
      test(`it should do update the position as expecteed for ${testItem.transaction.type} transactions`, () => {});
    });
  });
});

/* eslint-enable jest/expect-expect, jest/no-disabled-tests */
