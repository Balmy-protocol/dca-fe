import { createMockInstance } from '@common/utils/tests';
import { BigNumber, ethers } from 'ethers';
import { toToken } from '@common/utils/currency';
import { BaseProvider, Provider } from '@ethersproject/providers';
import { MULTICALL_ADDRESS, NULL_ADDRESS } from '@constants';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { formatUnits } from '@ethersproject/units';
import { MaxUint256 } from '@ethersproject/constants';
import { ERC20Contract, PositionVersions, SmolDomainContract } from '@types';
import ProviderService from './providerService';
import ContractService from './contractService';
import WalletService from './walletService';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ethers: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ...jest.requireActual('ethers').ethers,
    getDefaultProvider: jest.fn(),
    Contract: jest.fn(),
  },
}));

const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedContractService = jest.mocked(ContractService, { shallow: true });
const MockedEthers = jest.mocked(ethers, { shallow: true });

describe('Wallet Service', () => {
  let walletService: WalletService;
  let providerService: jest.MockedObject<ProviderService>;
  let contractService: jest.MockedObject<ContractService>;

  beforeEach(() => {
    providerService = createMockInstance(MockedProviderService);
    contractService = createMockInstance(MockedContractService);

    walletService = new WalletService(
      contractService as unknown as ContractService,
      providerService as unknown as ProviderService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('setAccount', () => {
    test('it should set the passed account as the account of the service', () => {
      walletService.setAccount('new account');

      expect(walletService.getAccount()).toEqual('new account');
    });

    test('it should call the callback with the new account', () => {
      const mockFunction = jest.fn();

      walletService.setAccount('new account', mockFunction);

      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockFunction).toHaveBeenCalledWith('new account');
    });

    test('it should call the callback with an empty account if none was set', () => {
      const mockFunction = jest.fn();

      walletService.setAccount(undefined, mockFunction);

      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockFunction).toHaveBeenCalledWith('');
    });
  });

  describe('getAccount', () => {
    test('it should return the set account', () => {
      walletService.account = 'account';
      expect(walletService.getAccount()).toEqual('account');
    });

    test('it should return an empty string if no account is set', () => {
      expect(walletService.getAccount()).toEqual('');
    });
  });

  describe('getEns', () => {
    let lookupMock: jest.Mock;

    beforeEach(() => {
      lookupMock = jest.fn().mockImplementation((address: string) => `lookup-address-${address}`);
      MockedEthers.getDefaultProvider.mockReturnValue({
        lookupAddress: lookupMock,
      } as unknown as BaseProvider);
    });

    test('it should return null if there no address is passed', async () => {
      const result = await walletService.getEns('');

      expect(result).toEqual(null);
    });

    describe('when on arbitrum', () => {
      beforeEach(() => {
        providerService.getNetwork.mockResolvedValue({ defaultProvider: true, chainId: 42161 });
      });

      test('it should return the smolDomain ens', async () => {
        const mockedSmolDomainInstance = {
          getFirstDefaultDomain: jest.fn().mockResolvedValue('smolEns'),
        };
        contractService.getSmolDomainInstance.mockResolvedValue(
          mockedSmolDomainInstance as unknown as SmolDomainContract
        );
        const result = await walletService.getEns('address');

        expect(mockedSmolDomainInstance.getFirstDefaultDomain).toHaveBeenCalledTimes(1);
        expect(mockedSmolDomainInstance.getFirstDefaultDomain).toHaveBeenCalledWith('address');
        expect(result).toEqual('smolEns');
      });

      test('it should return the normal ens if the smolDomain call fails', async () => {
        const mockedSmolDomainInstance = {
          getFirstDefaultDomain: jest.fn().mockImplementation(() => {
            throw new Error('blabalbla');
          }),
        };
        contractService.getSmolDomainInstance.mockResolvedValue(
          mockedSmolDomainInstance as unknown as SmolDomainContract
        );
        const result = await walletService.getEns('address');

        expect(mockedSmolDomainInstance.getFirstDefaultDomain).toHaveBeenCalledTimes(1);
        expect(mockedSmolDomainInstance.getFirstDefaultDomain).toHaveBeenCalledWith('address');

        expect(result).toEqual('lookup-address-address');
      });
    });

    describe('when not on arbitrum', () => {
      beforeEach(() => {
        providerService.getNetwork.mockResolvedValue({ defaultProvider: true, chainId: 137 });
      });
      test('it should not call smolDomain', async () => {
        const mockedSmolDomainInstance = {
          getFirstDefaultDomain: jest.fn().mockResolvedValue('smolEns'),
        };
        contractService.getSmolDomainInstance.mockResolvedValue(
          mockedSmolDomainInstance as unknown as SmolDomainContract
        );
        await walletService.getEns('address');

        expect(mockedSmolDomainInstance.getFirstDefaultDomain).not.toHaveBeenCalled();
      });

      test('it should use the defaultProvider and return the lookupAddress', async () => {
        const result = await walletService.getEns('address');

        expect(MockedEthers.getDefaultProvider).toHaveBeenCalledTimes(1);
        expect(MockedEthers.getDefaultProvider).toHaveBeenCalledWith('homestead', expect.any(Object));
        expect(lookupMock).toHaveBeenCalledTimes(1);
        expect(lookupMock).toHaveBeenCalledWith('address');
        expect(result).toEqual('lookup-address-address');
      });

      test('it should return null if the defaultProvider fails', async () => {
        MockedEthers.getDefaultProvider.mockImplementation(() => {
          throw new Error('damn');
        });
        const result = await walletService.getEns('address');

        expect(MockedEthers.getDefaultProvider).toHaveBeenCalledTimes(1);
        expect(MockedEthers.getDefaultProvider).toHaveBeenCalledWith('homestead', expect.any(Object));
        expect(result).toEqual(null);
      });

      test('it should return null if the lookupAddress fails', async () => {
        lookupMock.mockImplementation(() => {
          throw new Error('damn');
        });
        const result = await walletService.getEns('address');

        expect(MockedEthers.getDefaultProvider).toHaveBeenCalledTimes(1);
        expect(MockedEthers.getDefaultProvider).toHaveBeenCalledWith('homestead', expect.any(Object));
        expect(lookupMock).toHaveBeenCalledTimes(1);
        expect(lookupMock).toHaveBeenCalledWith('address');
        expect(result).toEqual(null);
      });
    });
  });

  describe('changeNetwork', () => {
    beforeEach(() => {
      providerService.getNetwork.mockResolvedValue({ defaultProvider: true, chainId: 10 });
    });
    describe('when the new chain is not the current one', () => {
      test('it should call the wallet service with correct parameters to change the chain', async () => {
        const callback = jest.fn();
        await walletService.changeNetwork(1, callback);

        expect(providerService.attempToAutomaticallyChangeNetwork).toHaveBeenCalledTimes(1);
        expect(providerService.attempToAutomaticallyChangeNetwork).toHaveBeenCalledWith(1, callback, true);
      });
    });
    describe('when the new chain is the same as the current one', () => {
      test('it should do nothing', async () => {
        const callback = jest.fn();
        await walletService.changeNetwork(10, callback);

        expect(providerService.attempToAutomaticallyChangeNetwork).not.toHaveBeenCalled();
      });
    });
  });

  describe('changeNetworkAutomatically', () => {
    beforeEach(() => {
      providerService.getNetwork.mockResolvedValue({ defaultProvider: true, chainId: 10 });
    });
    describe('when the new chain is not the current one', () => {
      test('it should call the wallet service with correct parameters to change the chain', async () => {
        const callback = jest.fn();
        await walletService.changeNetworkAutomatically(1, callback);

        expect(providerService.attempToAutomaticallyChangeNetwork).toHaveBeenCalledTimes(1);
        expect(providerService.attempToAutomaticallyChangeNetwork).toHaveBeenCalledWith(1, callback, false);
      });
    });
    describe('when the new chain is the same as the current one', () => {
      test('it should do nothing', async () => {
        const callback = jest.fn();
        await walletService.changeNetworkAutomatically(10, callback);

        expect(providerService.attempToAutomaticallyChangeNetwork).not.toHaveBeenCalled();
      });
    });
  });

  describe('getCustomToken', () => {
    let aggregate3Mock: jest.Mock;
    let balanceOfMock: jest.Mock;
    let decimalsMock: jest.Mock;
    let symbolMock: jest.Mock;
    let nameMock: jest.Mock;
    beforeEach(() => {
      aggregate3Mock = jest
        .fn()
        .mockResolvedValue([
          { returnData: ethers.utils.defaultAbiCoder.encode(['uint256'], ['100']) },
          { returnData: ethers.utils.defaultAbiCoder.encode(['uint8'], ['18']) },
          { returnData: ethers.utils.defaultAbiCoder.encode(['string'], ['name']) },
          { returnData: ethers.utils.defaultAbiCoder.encode(['string'], ['symbol']) },
        ]);
      balanceOfMock = jest.fn().mockResolvedValue({
        to: 'balanceOfTo',
        data: 'balanceOfData',
      });
      decimalsMock = jest.fn().mockResolvedValue({
        to: 'decimalsTo',
        data: 'decimalsData',
      });
      nameMock = jest.fn().mockResolvedValue({
        to: 'nameTo',
        data: 'nameData',
      });
      symbolMock = jest.fn().mockResolvedValue({
        to: 'symbolTo',
        data: 'symbolData',
      });
      providerService.getNetwork.mockResolvedValue({ defaultProvider: true, chainId: 10 });
      providerService.getProvider.mockResolvedValue('provider' as unknown as Provider);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      MockedEthers.Contract.mockImplementation(() => ({
        populateTransaction: {
          balanceOf: balanceOfMock,
          decimals: decimalsMock,
          name: nameMock,
          symbol: symbolMock,
        },
        callStatic: {
          aggregate3: aggregate3Mock,
        },
      }));
    });
    test('it should return null if the account is not connected', async () => {
      const result = await walletService.getCustomToken('address');

      expect(result).toEqual(undefined);
    });
    test('it should return null if the address is empty', async () => {
      const result = await walletService.getCustomToken('');

      expect(result).toEqual(undefined);
    });
    test('it should call the multicall contract and return the token data', async () => {
      walletService.setAccount('account');
      const result = await walletService.getCustomToken('Address');

      expect(symbolMock).toHaveBeenCalledTimes(1);
      expect(nameMock).toHaveBeenCalledTimes(1);
      expect(decimalsMock).toHaveBeenCalledTimes(1);
      expect(balanceOfMock).toHaveBeenCalledTimes(1);
      expect(balanceOfMock).toHaveBeenCalledWith('account');

      expect(aggregate3Mock).toHaveBeenCalledTimes(1);
      expect(aggregate3Mock).toHaveBeenCalledWith([
        {
          target: 'balanceOfTo',
          callData: 'balanceOfData',
          allowFailure: true,
        },
        {
          target: 'decimalsTo',
          callData: 'decimalsData',
          allowFailure: true,
        },
        {
          target: 'nameTo',
          callData: 'nameData',
          allowFailure: true,
        },
        {
          target: 'symbolTo',
          callData: 'symbolData',
          allowFailure: true,
        },
      ]);

      expect(MockedEthers.Contract).toHaveBeenNthCalledWith(1, 'Address', expect.any(Object), 'provider');
      expect(MockedEthers.Contract).toHaveBeenNthCalledWith(2, MULTICALL_ADDRESS[10], expect.any(Object), 'provider');

      expect(result).toEqual({
        token: toToken({ address: 'address', decimals: 18, name: 'name', symbol: 'symbol', chainId: 10 }),
        balance: BigNumber.from('100'),
      });
    });
  });

  describe('getBalance', () => {
    let getBalanceMock: jest.Mock;
    beforeEach(() => {
      getBalanceMock = jest.fn().mockResolvedValue(BigNumber.from(10));
      providerService.getBalance.mockResolvedValue(BigNumber.from(20));
      providerService.getProvider.mockResolvedValue('provider' as unknown as Provider);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      MockedEthers.Contract.mockImplementation(() => ({
        balanceOf: getBalanceMock,
      }));
    });

    test('it should return 0 if no account exists', async () => {
      const result = await walletService.getBalance('token');

      expect(providerService.getBalance).not.toHaveBeenCalled();
      expect(getBalanceMock).not.toHaveBeenCalled();

      expect(result).toEqual(BigNumber.from(0));
    });

    test('it should return 0 if no address is passed', async () => {
      const result = await walletService.getBalance();

      expect(providerService.getBalance).not.toHaveBeenCalled();
      expect(getBalanceMock).not.toHaveBeenCalled();

      expect(result).toEqual(BigNumber.from(0));
    });

    test('it should use the set address if none passed', async () => {
      walletService.setAccount('set account');

      const result = await walletService.getBalance('token');

      expect(getBalanceMock).toHaveBeenCalledTimes(1);
      expect(getBalanceMock).toHaveBeenCalledWith('set account');
      expect(result).toEqual(BigNumber.from(10));
    });

    test('it should call the provider service if the address is the protocol address', async () => {
      walletService.setAccount('set account');

      const result = await walletService.getBalance(PROTOCOL_TOKEN_ADDRESS, 'account');

      expect(providerService.getBalance).toHaveBeenCalledTimes(1);
      expect(providerService.getBalance).toHaveBeenCalledWith('account');
      expect(getBalanceMock).not.toHaveBeenCalled();
      expect(result).toEqual(BigNumber.from(20));
    });

    test('it should call the erc20 contract and return the balance', async () => {
      walletService.setAccount('set account');

      const result = await walletService.getBalance('token', 'account');

      expect(getBalanceMock).toHaveBeenCalledTimes(1);
      expect(getBalanceMock).toHaveBeenCalledWith('account');
      expect(providerService.getBalance).not.toHaveBeenCalled();
      expect(result).toEqual(BigNumber.from(10));
    });
  });

  describe('getAllowance', () => {
    let getSpecificAllowanceMock: jest.Mock;
    beforeEach(() => {
      getSpecificAllowanceMock = jest.fn().mockResolvedValue(BigNumber.from(10));
      walletService.getSpecificAllowance = getSpecificAllowanceMock;
    });

    test('it should call getSpecificAllowance with the hub address if it should not check the companion', async () => {
      contractService.getHUBAddress.mockReturnValue('hubAddress');
      const result = await walletService.getAllowance(
        toToken({ address: 'tokenAddress' }),
        'account',
        false,
        PositionVersions.POSITION_VERSION_3
      );

      expect(contractService.getHUBAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBAddress).toHaveBeenCalledWith(PositionVersions.POSITION_VERSION_3);
      expect(getSpecificAllowanceMock).toHaveBeenCalledTimes(1);
      expect(getSpecificAllowanceMock).toHaveBeenCalledWith(toToken({ address: 'tokenAddress' }), 'hubAddress');
      expect(result).toEqual(BigNumber.from(10));
    });

    test('it should call getSpecificAllowance with the companion address if it should check the companion', async () => {
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
      const result = await walletService.getAllowance(
        toToken({ address: 'tokenAddress' }),
        'account',
        true,
        PositionVersions.POSITION_VERSION_3
      );

      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(PositionVersions.POSITION_VERSION_3);
      expect(getSpecificAllowanceMock).toHaveBeenCalledTimes(1);
      expect(getSpecificAllowanceMock).toHaveBeenCalledWith(toToken({ address: 'tokenAddress' }), 'companionAddress');
      expect(result).toEqual(BigNumber.from(10));
    });
  });

  describe('getSpecificAllowance', () => {
    beforeEach(() => {
      walletService.setAccount('account');
    });

    test('it should return the max amount if there is no set account', async () => {
      walletService.setAccount('');
      const result = await walletService.getSpecificAllowance(
        toToken({ address: 'token' }),
        'addressToCheck',
        'account'
      );

      expect(result).toEqual({
        token: toToken({ address: 'token' }),
        allowance: formatUnits(MaxUint256, 18),
      });
    });

    test('it should return the max amount if the address is of the protocol token', async () => {
      const result = await walletService.getSpecificAllowance(
        toToken({ address: PROTOCOL_TOKEN_ADDRESS }),
        'addressToCheck',
        'account'
      );

      expect(result).toEqual({
        token: toToken({ address: PROTOCOL_TOKEN_ADDRESS }),
        allowance: formatUnits(MaxUint256, 18),
      });
    });

    test('it should return the max amount if the address is of the null token', async () => {
      const result = await walletService.getSpecificAllowance(toToken({ address: 'token' }), NULL_ADDRESS, 'account');

      expect(result).toEqual({
        token: toToken({ address: 'token' }),
        allowance: formatUnits(MaxUint256, 18),
      });
    });

    test('it should call the token contract and return the allowance', async () => {
      const allowanceMock = jest.fn().mockResolvedValue('10000000000000000000');
      contractService.getTokenInstance.mockResolvedValue({
        allowance: allowanceMock,
      } as unknown as ERC20Contract);

      const result = await walletService.getSpecificAllowance(
        toToken({ address: 'token' }),
        'addressToCheck',
        'account'
      );

      expect(contractService.getTokenInstance).toHaveBeenCalledTimes(1);
      expect(contractService.getTokenInstance).toHaveBeenCalledWith('token');

      expect(allowanceMock).toHaveBeenCalledTimes(1);
      expect(allowanceMock).toHaveBeenCalledWith('account', 'addressToCheck');
      expect(result).toEqual({
        token: toToken({ address: 'token' }),
        allowance: '10.0',
      });
    });
  });

  describe('buildApproveSpecificTokenTx', () => {
    let approveMock: jest.Mock;

    beforeEach(() => {
      walletService.setAccount('account');
      approveMock = jest.fn().mockResolvedValue('populatedTransaction');

      contractService.getTokenInstance.mockResolvedValue({
        populateTransaction: {
          approve: approveMock,
        },
      } as unknown as ERC20Contract);
    });

    test('it should populate the transaction from the token contract', async () => {
      const result = await walletService.buildApproveSpecificTokenTx(
        'account',
        toToken({ address: 'token' }),
        'addressToApprove',
        BigNumber.from(10)
      );

      expect(approveMock).toHaveBeenCalledTimes(1);
      expect(approveMock).toHaveBeenCalledWith('addressToApprove', BigNumber.from(10));
      expect(result).toEqual('populatedTransaction');
    });

    test('it should populate the transaction from the token contract with the max value if no amount is passed', async () => {
      const result = await walletService.buildApproveSpecificTokenTx(
        'account',
        toToken({ address: 'token' }),
        'addressToApprove'
      );

      expect(approveMock).toHaveBeenCalledTimes(1);
      expect(approveMock).toHaveBeenCalledWith('addressToApprove', MaxUint256);
      expect(result).toEqual('populatedTransaction');
    });
  });

  describe('buildApproveTx', () => {
    let buildApproveSpecificTokenTxMock: jest.Mock;
    beforeEach(() => {
      buildApproveSpecificTokenTxMock = jest.fn().mockResolvedValue({ hash: 'transaction' });
      walletService.buildApproveSpecificTokenTx = buildApproveSpecificTokenTxMock;
    });

    test('it should call buildApproveSpecificTokenTx with the hub address if it should not check the companion', async () => {
      contractService.getHUBAddress.mockReturnValue('hubAddress');
      const result = await walletService.buildApproveTx(
        'account',
        toToken({ address: 'tokenAddress' }),
        false,
        PositionVersions.POSITION_VERSION_3,
        BigNumber.from(10)
      );

      expect(contractService.getHUBAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBAddress).toHaveBeenCalledWith(PositionVersions.POSITION_VERSION_3);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledTimes(1);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledWith(
        toToken({ address: 'tokenAddress' }),
        'hubAddress',
        BigNumber.from(10)
      );
      expect(result).toEqual({ hash: 'transaction' });
    });

    test('it should call buildApproveSpecificTokenTx with the companion address if it should check the companion', async () => {
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
      const result = await walletService.buildApproveTx(
        'account',
        toToken({ address: 'tokenAddress' }),
        true,
        PositionVersions.POSITION_VERSION_3,
        BigNumber.from(10)
      );

      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(PositionVersions.POSITION_VERSION_3);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledTimes(1);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledWith(
        toToken({ address: 'tokenAddress' }),
        'companionAddress',
        BigNumber.from(10)
      );
      expect(result).toEqual({ hash: 'transaction' });
    });
  });

  describe('approveToken', () => {
    let approveSpecificTokenTxMock: jest.Mock;
    beforeEach(() => {
      approveSpecificTokenTxMock = jest.fn().mockResolvedValue({ hash: 'transaction' });
      walletService.approveSpecificToken = approveSpecificTokenTxMock;
    });

    test('it should call approveSpecificToken with the hub address if it should not check the companion', async () => {
      contractService.getHUBAddress.mockReturnValue('hubAddress');
      const result = await walletService.approveToken(
        'account',
        toToken({ address: 'tokenAddress' }),
        false,
        PositionVersions.POSITION_VERSION_3,
        BigNumber.from(10)
      );

      expect(contractService.getHUBAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBAddress).toHaveBeenCalledWith(PositionVersions.POSITION_VERSION_3);
      expect(approveSpecificTokenTxMock).toHaveBeenCalledTimes(1);
      expect(approveSpecificTokenTxMock).toHaveBeenCalledWith(
        toToken({ address: 'tokenAddress' }),
        'hubAddress',
        BigNumber.from(10)
      );
      expect(result).toEqual({ hash: 'transaction' });
    });

    test('it should call approveSpecificToken with the companion address if it should check the companion', async () => {
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
      const result = await walletService.approveToken(
        'account',
        toToken({ address: 'tokenAddress' }),
        true,
        PositionVersions.POSITION_VERSION_3,
        BigNumber.from(10)
      );

      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(PositionVersions.POSITION_VERSION_3);
      expect(approveSpecificTokenTxMock).toHaveBeenCalledTimes(1);
      expect(approveSpecificTokenTxMock).toHaveBeenCalledWith(
        toToken({ address: 'tokenAddress' }),
        'companionAddress',
        BigNumber.from(10)
      );
      expect(result).toEqual({ hash: 'transaction' });
    });
  });

  describe('approveSpecificToken', () => {
    let approveMock: jest.Mock;

    beforeEach(() => {
      walletService.setAccount('account');
      approveMock = jest.fn().mockResolvedValue('populatedTransaction');

      contractService.getTokenInstance.mockResolvedValue({
        approve: approveMock,
      } as unknown as ERC20Contract);
    });

    test('it should call the approve method of the token contract', async () => {
      const result = await walletService.approveSpecificToken(
        toToken({ address: 'token' }),
        'addressToApprove',
        'account',
        BigNumber.from(10)
      );

      expect(approveMock).toHaveBeenCalledTimes(1);
      expect(approveMock).toHaveBeenCalledWith('addressToApprove', BigNumber.from(10));
      expect(result).toEqual('populatedTransaction');
    });

    test('it should call the approve method of the token contract with the max value if no amount is passed', async () => {
      const result = await walletService.approveSpecificToken(
        toToken({ address: 'token' }),
        'addressToApprove',
        'account'
      );

      expect(approveMock).toHaveBeenCalledTimes(1);
      expect(approveMock).toHaveBeenCalledWith('addressToApprove', MaxUint256);
      expect(result).toEqual('populatedTransaction');
    });
  });
});
