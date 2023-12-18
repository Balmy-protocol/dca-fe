import { createMockInstance } from '@common/utils/tests';
import { ethers } from 'ethers';
import { emptyTokenWithAddress, toToken } from '@common/utils/currency';
import { BaseProvider, JsonRpcSigner, Provider } from '@ethersproject/providers';
import { MULTICALL_ADDRESS, NULL_ADDRESS } from '@constants';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { formatUnits, maxUint256 } from 'viem';
import { ERC20Contract, ERC721Contract, PositionVersions, SmolDomainContract, TokenType } from '@types';
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
        providerService.getSigner.mockResolvedValue({
          getAddress: jest.fn().mockResolvedValue('address'),
        } as unknown as JsonRpcSigner);
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

  describe('getManyEns', () => {
    const getEnsMock = jest.fn();

    beforeEach(() => {
      getEnsMock.mockResolvedValueOnce('ens1.eth').mockResolvedValueOnce('ens2.eth');
      walletService.getEns = getEnsMock;
    });

    test('returns an empty object if receiving no addresses', async () => {
      const result = await walletService.getManyEns([]);
      expect(result).toEqual({});
    });

    test('calls getEns one time per address received and returns the correct value', async () => {
      const result = await walletService.getManyEns(['address1', 'address2']);

      expect(getEnsMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ address1: 'ens1.eth', address2: 'ens2.eth' });
    });
  });

  describe('changeNetwork', () => {
    beforeEach(() => {
      providerService.getNetwork.mockResolvedValue({ defaultProvider: true, chainId: 10 });
    });
    describe('when the new chain is not the current one', () => {
      test('it should call the wallet service with correct parameters to change the chain', async () => {
        const callback = jest.fn();
        await walletService.changeNetwork(1, 'account', callback);

        expect(providerService.attempToAutomaticallyChangeNetwork).toHaveBeenCalledTimes(1);
        expect(providerService.attempToAutomaticallyChangeNetwork).toHaveBeenCalledWith(1, 'account', callback, true);
      });
    });
    describe('when the new chain is the same as the current one', () => {
      test('it should do nothing', async () => {
        const callback = jest.fn();
        await walletService.changeNetwork(10, 'account', callback);

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
        await walletService.changeNetworkAutomatically(1, 'account', callback);

        expect(providerService.attempToAutomaticallyChangeNetwork).toHaveBeenCalledTimes(1);
        expect(providerService.attempToAutomaticallyChangeNetwork).toHaveBeenCalledWith(1, 'account', callback, false);
      });
    });
    describe('when the new chain is the same as the current one', () => {
      test('it should do nothing', async () => {
        const callback = jest.fn();
        await walletService.changeNetworkAutomatically(10, 'account', callback);

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
    test('it should return null if the address is empty', async () => {
      const result = await walletService.getCustomToken('', '');

      expect(result).toEqual(undefined);
    });
    test('it should call the multicall contract and return the token data', async () => {
      const result = await walletService.getCustomToken('Address', 'account');

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
        balance: 100n,
      });
    });
  });

  describe('getBalance', () => {
    let getBalanceMock: jest.Mock;
    beforeEach(() => {
      getBalanceMock = jest.fn().mockResolvedValue(10n);
      providerService.getBalance.mockResolvedValue(20n);
      providerService.getProvider.mockResolvedValue('provider' as unknown as Provider);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      MockedEthers.Contract.mockImplementation(() => ({
        balanceOf: getBalanceMock,
      }));
    });

    test('it should return 0 if no account exists', async () => {
      const result = await walletService.getBalance(undefined, 'token');

      expect(providerService.getBalance).not.toHaveBeenCalled();
      expect(getBalanceMock).not.toHaveBeenCalled();

      expect(result).toEqual(0n);
    });

    test('it should return 0 if no address is passed', async () => {
      const result = await walletService.getBalance();

      expect(providerService.getBalance).not.toHaveBeenCalled();
      expect(getBalanceMock).not.toHaveBeenCalled();

      expect(result).toEqual(0n);
    });

    test('it should use the set address if none passed', async () => {
      const result = await walletService.getBalance('set account', 'token');

      expect(getBalanceMock).toHaveBeenCalledTimes(1);
      expect(getBalanceMock).toHaveBeenCalledWith('set account');
      expect(result).toEqual(10n);
    });

    test('it should call the provider service if the address is the protocol address', async () => {
      const result = await walletService.getBalance('account', PROTOCOL_TOKEN_ADDRESS);

      expect(providerService.getBalance).toHaveBeenCalledTimes(1);
      expect(providerService.getBalance).toHaveBeenCalledWith('account');
      expect(getBalanceMock).not.toHaveBeenCalled();
      expect(result).toEqual(20n);
    });

    test('it should call the erc20 contract and return the balance', async () => {
      const result = await walletService.getBalance('account', 'token');

      expect(getBalanceMock).toHaveBeenCalledTimes(1);
      expect(getBalanceMock).toHaveBeenCalledWith('account');
      expect(providerService.getBalance).not.toHaveBeenCalled();
      expect(result).toEqual(10n);
    });
  });

  describe('getAllowance', () => {
    let getSpecificAllowanceMock: jest.Mock;
    beforeEach(() => {
      getSpecificAllowanceMock = jest.fn().mockResolvedValue(10n);
      walletService.getSpecificAllowance = getSpecificAllowanceMock;
    });

    test('it should call getSpecificAllowance with the hub address if it should not check the companion', async () => {
      contractService.getHUBAddress.mockReturnValue('hubAddress');
      const result = await walletService.getAllowance(
        toToken({ address: 'tokenAddress', chainId: 10 }),
        'account',
        false,
        PositionVersions.POSITION_VERSION_3
      );

      expect(contractService.getHUBAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBAddress).toHaveBeenCalledWith(10, PositionVersions.POSITION_VERSION_3);
      expect(getSpecificAllowanceMock).toHaveBeenCalledTimes(1);
      expect(getSpecificAllowanceMock).toHaveBeenCalledWith(
        toToken({ address: 'tokenAddress', chainId: 10 }),
        'hubAddress',
        'account'
      );
      expect(result).toEqual(10n);
    });

    test('it should call getSpecificAllowance with the companion address if it should check the companion', async () => {
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
      const result = await walletService.getAllowance(
        toToken({ address: 'tokenAddress', chainId: 10 }),
        'account',
        true,
        PositionVersions.POSITION_VERSION_3
      );

      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(10, PositionVersions.POSITION_VERSION_3);
      expect(getSpecificAllowanceMock).toHaveBeenCalledTimes(1);
      expect(getSpecificAllowanceMock).toHaveBeenCalledWith(
        toToken({ address: 'tokenAddress', chainId: 10 }),
        'companionAddress',
        'account'
      );
      expect(result).toEqual(10n);
    });
  });

  describe('getSpecificAllowance', () => {
    test('it should return the max amount if the address is of the protocol token', async () => {
      const result = await walletService.getSpecificAllowance(
        toToken({ address: PROTOCOL_TOKEN_ADDRESS, chainId: 10 }),
        'addressToCheck',
        'account'
      );

      expect(result).toEqual({
        token: toToken({ address: PROTOCOL_TOKEN_ADDRESS, chainId: 10 }),
        allowance: formatUnits(maxUint256, 18),
      });
    });

    test('it should return the max amount if the address is of the null token', async () => {
      const result = await walletService.getSpecificAllowance(
        toToken({ address: 'token', chainId: 10 }),
        NULL_ADDRESS,
        'account'
      );

      expect(result).toEqual({
        token: toToken({ address: 'token', chainId: 10 }),
        allowance: formatUnits(maxUint256, 18),
      });
    });

    test('it should call the token contract and return the allowance', async () => {
      const allowanceMock = jest.fn().mockResolvedValue('10000000000000000000');
      contractService.getERC20TokenInstance.mockResolvedValue({
        allowance: allowanceMock,
      } as unknown as ERC20Contract);

      const result = await walletService.getSpecificAllowance(
        toToken({ address: 'token', chainId: 10 }),
        'addressToCheck',
        'account'
      );

      expect(contractService.getERC20TokenInstance).toHaveBeenCalledTimes(1);
      expect(contractService.getERC20TokenInstance).toHaveBeenCalledWith(10, 'token', 'account');

      expect(allowanceMock).toHaveBeenCalledTimes(1);
      expect(allowanceMock).toHaveBeenCalledWith('account', 'addressToCheck');
      expect(result).toEqual({
        token: toToken({ address: 'token', chainId: 10 }),
        allowance: '10.0',
      });
    });
  });

  describe('buildApproveSpecificTokenTx', () => {
    let approveMock: jest.Mock;

    beforeEach(() => {
      approveMock = jest.fn().mockResolvedValue('populatedTransaction');

      contractService.getERC20TokenInstance.mockResolvedValue({
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
        10n
      );

      expect(approveMock).toHaveBeenCalledTimes(1);
      expect(approveMock).toHaveBeenCalledWith('addressToApprove', 10n);
      expect(result).toEqual('populatedTransaction');
    });

    test('it should populate the transaction from the token contract with the max value if no amount is passed', async () => {
      const result = await walletService.buildApproveSpecificTokenTx(
        'account',
        toToken({ address: 'token' }),
        'addressToApprove'
      );

      expect(approveMock).toHaveBeenCalledTimes(1);
      expect(approveMock).toHaveBeenCalledWith('addressToApprove', maxUint256);
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
        toToken({ address: 'tokenAddress', chainId: 10 }),
        false,
        PositionVersions.POSITION_VERSION_3,
        10n
      );

      expect(contractService.getHUBAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBAddress).toHaveBeenCalledWith(10, PositionVersions.POSITION_VERSION_3);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledTimes(1);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledWith(
        'account',
        toToken({ address: 'tokenAddress', chainId: 10 }),
        'hubAddress',
        10n
      );
      expect(result).toEqual({ hash: 'transaction' });
    });

    test('it should call buildApproveSpecificTokenTx with the companion address if it should check the companion', async () => {
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
      const result = await walletService.buildApproveTx(
        'account',
        toToken({ address: 'tokenAddress', chainId: 10 }),
        true,
        PositionVersions.POSITION_VERSION_3,
        10n
      );

      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(10, PositionVersions.POSITION_VERSION_3);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledTimes(1);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledWith(
        'account',
        toToken({ address: 'tokenAddress', chainId: 10 }),
        'companionAddress',
        10n
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
        toToken({ address: 'tokenAddress', chainId: 10 }),
        false,
        PositionVersions.POSITION_VERSION_3,
        10n
      );

      expect(contractService.getHUBAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBAddress).toHaveBeenCalledWith(10, PositionVersions.POSITION_VERSION_3);
      expect(approveSpecificTokenTxMock).toHaveBeenCalledTimes(1);
      expect(approveSpecificTokenTxMock).toHaveBeenCalledWith(
        toToken({ address: 'tokenAddress', chainId: 10 }),
        'hubAddress',
        'account',
        10n
      );
      expect(result).toEqual({ hash: 'transaction' });
    });

    test('it should call approveSpecificToken with the companion address if it should check the companion', async () => {
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
      const result = await walletService.approveToken(
        'account',
        toToken({ address: 'tokenAddress', chainId: 10 }),
        true,
        PositionVersions.POSITION_VERSION_3,
        10n
      );

      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(10, PositionVersions.POSITION_VERSION_3);
      expect(approveSpecificTokenTxMock).toHaveBeenCalledTimes(1);
      expect(approveSpecificTokenTxMock).toHaveBeenCalledWith(
        toToken({ address: 'tokenAddress', chainId: 10 }),
        'companionAddress',
        'account',
        10n
      );
      expect(result).toEqual({ hash: 'transaction' });
    });
  });

  describe('approveSpecificToken', () => {
    let approveMock: jest.Mock;

    beforeEach(() => {
      approveMock = jest.fn().mockResolvedValue('populatedTransaction');

      contractService.getERC20TokenInstance.mockResolvedValue({
        approve: approveMock,
      } as unknown as ERC20Contract);
    });

    test('it should call the approve method of the token contract', async () => {
      const result = await walletService.approveSpecificToken(
        toToken({ address: 'token' }),
        'addressToApprove',
        'account',
        10n
      );

      expect(approveMock).toHaveBeenCalledTimes(1);
      expect(approveMock).toHaveBeenCalledWith('addressToApprove', Number.from(10));
      expect(result).toEqual('populatedTransaction');
    });

    test('it should call the approve method of the token contract with the max value if no amount is passed', async () => {
      const result = await walletService.approveSpecificToken(
        toToken({ address: 'token' }),
        'addressToApprove',
        'account'
      );

      expect(approveMock).toHaveBeenCalledTimes(1);
      expect(approveMock).toHaveBeenCalledWith('addressToApprove', maxUint256);
      expect(result).toEqual('populatedTransaction');
    });
  });

  describe('transferToken', () => {
    const erc20TokenMock = emptyTokenWithAddress('token', TokenType.ERC20_TOKEN);
    const nativeTokenMock = emptyTokenWithAddress('nativeToken', TokenType.NATIVE);
    const erc721TokenMock = emptyTokenWithAddress('nftToken', TokenType.ERC721_TOKEN);
    const signerSendTransaction = jest.fn();

    beforeEach(() => {
      const mockedSigner = {
        sendTransaction: signerSendTransaction.mockResolvedValue('sendTransaction'),
      } as unknown as jest.Mocked<JsonRpcSigner>;
      providerService.getSigner.mockResolvedValue(mockedSigner);
    });

    test('it should not proceed if amount is not greater than zero', async () => {
      try {
        await walletService.transferToken({
          from: 'from',
          to: 'to',
          token: nativeTokenMock,
          amount: 0n,
        });
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Amount must be greater than zero'));
      }
    });
    test("it should transfer tokens using the ERC20 interface if it's an ERC20 token", async () => {
      const transferFn = jest.fn().mockResolvedValue('transfer');
      contractService.getERC20TokenInstance.mockResolvedValue({
        transfer: transferFn,
      } as unknown as ERC20Contract);

      const txResponse = await walletService.transferToken({
        from: 'from',
        to: 'to',
        token: erc20TokenMock,
        amount: 10n,
      });

      expect(txResponse).toEqual('transfer');
      expect(transferFn).toHaveBeenCalledTimes(1);
      expect(transferFn).toHaveBeenCalledWith('to', 10n);
    });
    test('it should generate a transaction from the signer if the token is a protocol token', async () => {
      const txResponse = await walletService.transferToken({
        from: 'from',
        to: 'to',
        token: nativeTokenMock,
        amount: 10n,
      });

      expect(txResponse).toEqual('sendTransaction');
      expect(signerSendTransaction).toHaveBeenCalledTimes(1);
      expect(signerSendTransaction).toHaveBeenCalledWith({
        from: 'from',
        to: 'to',
        value: 10n,
      });
    });
    test('it should not proceed if token is not of type Native or ERC20', async () => {
      try {
        await walletService.transferToken({
          from: 'from',
          to: 'to',
          token: erc721TokenMock,
          amount: 10n,
        });
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Token must be of type Native or ERC20'));
      }
    });
  });

  describe('transferNFT', () => {
    const erc20TokenMock = emptyTokenWithAddress('token', TokenType.ERC20_TOKEN);
    const erc721TokenMock = emptyTokenWithAddress('nftToken', TokenType.ERC721_TOKEN);

    test('it should not proceed if token is not of type ERC721', async () => {
      try {
        await walletService.transferNFT({
          from: 'from',
          to: 'to',
          token: erc20TokenMock,
          tokenId: 1111n,
        });
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Token must be of type ERC721'));
      }
    });
    test("it should transfer token using the ERC721 interface if it's an ERC721 token", async () => {
      const transferFromFn = jest.fn().mockResolvedValue('transferFrom');
      contractService.getERC721TokenInstance.mockResolvedValue({
        transferFrom: transferFromFn,
      } as unknown as ERC721Contract);

      const txResponse = await walletService.transferNFT({
        from: 'from',
        to: 'to',
        token: erc721TokenMock,
        tokenId: 1111n,
      });

      expect(txResponse).toEqual('transferFrom');
      expect(transferFromFn).toHaveBeenCalledTimes(1);
      expect(transferFromFn).toHaveBeenCalledWith('from', 'to', 1111n);
    });
  });
});
