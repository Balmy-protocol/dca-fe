import { createMockInstance } from '@common/utils/tests';
import { emptyTokenWithAddress, toToken } from '@common/utils/currency';
import { NULL_ADDRESS } from '@constants';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { Address, PublicClient, WalletClient, formatUnits, maxUint256, encodeFunctionData } from 'viem';
import { NetworkStruct, PositionVersions, TokenType } from '@types';
import ProviderService from './providerService';
import ContractService from './contractService';
import WalletService from './walletService';

const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedContractService = jest.mocked(ContractService, { shallow: true });
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('viem', () => ({
  ...jest.requireActual('viem'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  encodeFunctionData: jest.fn(),
  hexToNumber: jest.fn(),
}));

const mockedEncodeFunctionData = jest.mocked(encodeFunctionData, { shallow: true });

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
    let getEnsName: jest.Mock;

    beforeEach(() => {
      getEnsName = jest.fn().mockImplementation((address: { address: string }) => `lookup-address-${address.address}`);
      providerService.getProvider.mockReturnValue({
        getEnsName,
      } as unknown as PublicClient);
    });

    test('it should return null if there no address is passed', async () => {
      const result = await walletService.getEns('' as Address);

      expect(result).toEqual(null);
    });

    describe('when on arbitrum', () => {
      beforeEach(() => {
        providerService.getNetwork.mockResolvedValue({ chainId: 42161 } as NetworkStruct);
      });

      test('it should return the smolDomain ens', async () => {
        const mockedSmolDomainInstance = {
          read: {
            getFirstDefaultDomain: jest.fn().mockResolvedValue('smolEns'),
          },
        };
        contractService.getSmolDomainInstance.mockResolvedValue(
          mockedSmolDomainInstance as unknown as ReturnType<ContractService['getSmolDomainInstance']>
        );
        const result = await walletService.getEns('0xaddress');

        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledTimes(1);
        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledWith(['0xaddress']);
        expect(result).toEqual('smolEns');
      });

      test('it should return the normal ens if the smolDomain call fails', async () => {
        const mockedSmolDomainInstance = {
          read: {
            getFirstDefaultDomain: jest.fn().mockImplementation(() => {
              throw new Error('blabalbla');
            }),
          },
        };
        contractService.getSmolDomainInstance.mockResolvedValue(
          mockedSmolDomainInstance as unknown as ReturnType<ContractService['getSmolDomainInstance']>
        );
        const result = await walletService.getEns('0xaddress');

        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledTimes(1);
        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).toHaveBeenCalledWith(['0xaddress']);
        expect(getEnsName).toHaveBeenCalledTimes(1);
        expect(getEnsName).toHaveBeenCalledWith({ address: '0xaddress' });
        expect(result).toEqual('lookup-address-0xaddress');
      });
    });

    describe('when not on arbitrum', () => {
      beforeEach(() => {
        providerService.getNetwork.mockResolvedValue({ chainId: 137 } as NetworkStruct);
      });
      test('it should not call smolDomain', async () => {
        const mockedSmolDomainInstance = {
          read: {
            getFirstDefaultDomain: jest.fn().mockResolvedValue('smolEns'),
          },
        };
        contractService.getSmolDomainInstance.mockResolvedValue(
          mockedSmolDomainInstance as unknown as ReturnType<ContractService['getSmolDomainInstance']>
        );
        await walletService.getEns('0xaddress');

        expect(mockedSmolDomainInstance.read.getFirstDefaultDomain).not.toHaveBeenCalled();
      });

      test('it should use the defaultProvider and return the lookupAddress', async () => {
        const result = await walletService.getEns('0xaddress');

        expect(providerService.getProvider).toHaveBeenCalledTimes(1);
        expect(providerService.getProvider).toHaveBeenCalledWith(1);
        expect(getEnsName).toHaveBeenCalledTimes(1);
        expect(getEnsName).toHaveBeenCalledWith({ address: '0xaddress' });
        expect(result).toEqual('lookup-address-0xaddress');
      });

      test('it should return null if the lookupAddress fails', async () => {
        getEnsName.mockImplementation(() => {
          throw new Error('damn');
        });
        const result = await walletService.getEns('0xaddress');

        expect(providerService.getProvider).toHaveBeenCalledTimes(1);
        expect(providerService.getProvider).toHaveBeenCalledWith(1);
        expect(getEnsName).toHaveBeenCalledTimes(1);
        expect(getEnsName).toHaveBeenCalledWith({ address: '0xaddress' });
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
      const result = await walletService.getManyEns(['0xaddress1', '0xaddress2']);

      expect(getEnsMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ '0xaddress1': 'ens1.eth', '0xaddress2': 'ens2.eth' });
    });
  });

  describe('changeNetwork', () => {
    beforeEach(() => {
      providerService.getNetwork.mockResolvedValue({ chainId: 10 } as NetworkStruct);
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
      providerService.getNetwork.mockResolvedValue({ chainId: 10 } as NetworkStruct);
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
    let multicallMock: jest.Mock;
    beforeEach(() => {
      multicallMock = jest
        .fn()
        .mockResolvedValue([{ result: 100n }, { result: 18 }, { result: 'name' }, { result: 'symbol' }]);
      providerService.getNetwork.mockResolvedValue({ chainId: 10 } as NetworkStruct);
      providerService.getProvider.mockReturnValue({
        multicall: multicallMock,
      } as unknown as PublicClient);
      contractService.getERC20TokenInstance.mockResolvedValue({ address: '0xerc20' } as unknown as ReturnType<
        ContractService['getERC20TokenInstance']
      >);
    });
    test('it should return null if the address is empty', async () => {
      const result = await walletService.getCustomToken('' as Address, '' as Address);

      expect(result).toEqual(undefined);
    });
    test('it should call the multicall contract and return the token data', async () => {
      const result = await walletService.getCustomToken('0xaddress', '0xaccount');

      expect(multicallMock).toHaveBeenCalledTimes(1);
      expect(multicallMock).toHaveBeenCalledWith({
        contracts: [
          {
            address: '0xerc20',
            functionName: 'balanceOf',
            args: ['0xaccount'],
          },
          {
            address: '0xerc20',
            functionName: 'decimals',
          },
          {
            address: '0xerc20',
            functionName: 'name',
          },
          {
            address: '0xerc20',
            functionName: 'symbol',
          },
        ],
      });

      expect(result).toEqual({
        token: toToken({ address: '0xaddress', decimals: 18, name: 'name', symbol: 'symbol', chainId: 10 }),
        balance: 100n,
      });
    });
  });

  describe('getBalance', () => {
    let getBalanceMock: jest.Mock;
    beforeEach(() => {
      providerService.getNetwork.mockResolvedValue({ chainId: 10 } as NetworkStruct);
      getBalanceMock = jest.fn().mockResolvedValue(10n);
      providerService.getBalance.mockResolvedValue(20n);
      contractService.getERC20TokenInstance.mockResolvedValue({
        read: { balanceOf: getBalanceMock },
      } as unknown as ReturnType<ContractService['getERC20TokenInstance']>);
    });

    test('it should return 0 if no account exists', async () => {
      const result = await walletService.getBalance({ account: undefined, address: '0xtoken' });

      expect(providerService.getBalance).not.toHaveBeenCalled();
      expect(getBalanceMock).not.toHaveBeenCalled();

      expect(result).toEqual(0n);
    });

    test('it should return 0 if no address is passed', async () => {
      const result = await walletService.getBalance({ account: undefined, address: undefined });

      expect(providerService.getBalance).not.toHaveBeenCalled();
      expect(getBalanceMock).not.toHaveBeenCalled();

      expect(result).toEqual(0n);
    });

    test('it should call the provider service if the address is the protocol address', async () => {
      const result = await walletService.getBalance({ account: '0xaccount', address: PROTOCOL_TOKEN_ADDRESS });

      expect(providerService.getBalance).toHaveBeenCalledTimes(1);
      expect(providerService.getBalance).toHaveBeenCalledWith('0xaccount', 10);
      expect(getBalanceMock).not.toHaveBeenCalled();
      expect(result).toEqual(20n);
    });

    test('it should call the erc20 contract and return the balance', async () => {
      const result = await walletService.getBalance({ account: '0xaccount', address: '0xtoken' });

      expect(getBalanceMock).toHaveBeenCalledTimes(1);
      expect(getBalanceMock).toHaveBeenCalledWith(['0xaccount']);
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
      contractService.getHUBAddress.mockReturnValue('0xhubAddress');
      const result = await walletService.getAllowance(
        toToken({ address: 'tokenAddress', chainId: 10 }),
        '0xaccount',
        false,
        PositionVersions.POSITION_VERSION_3
      );

      expect(contractService.getHUBAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBAddress).toHaveBeenCalledWith(10, PositionVersions.POSITION_VERSION_3);
      expect(getSpecificAllowanceMock).toHaveBeenCalledTimes(1);
      expect(getSpecificAllowanceMock).toHaveBeenCalledWith(
        toToken({ address: 'tokenAddress', chainId: 10 }),
        '0xhubAddress',
        '0xaccount'
      );
      expect(result).toEqual(10n);
    });

    test('it should call getSpecificAllowance with the companion address if it should check the companion', async () => {
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
      const result = await walletService.getAllowance(
        toToken({ address: 'tokenAddress', chainId: 10 }),
        '0xaccount',
        true,
        PositionVersions.POSITION_VERSION_3
      );

      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(10, PositionVersions.POSITION_VERSION_3);
      expect(getSpecificAllowanceMock).toHaveBeenCalledTimes(1);
      expect(getSpecificAllowanceMock).toHaveBeenCalledWith(
        toToken({ address: 'tokenAddress', chainId: 10 }),
        '0xcompanionAddress',
        '0xaccount'
      );
      expect(result).toEqual(10n);
    });
  });

  describe('getSpecificAllowance', () => {
    test('it should return the max amount if the address is of the protocol token', async () => {
      const result = await walletService.getSpecificAllowance(
        toToken({ address: PROTOCOL_TOKEN_ADDRESS, chainId: 10 }),
        '0xaddressToCheck',
        '0xaccount'
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
        '0xaccount'
      );

      expect(result).toEqual({
        token: toToken({ address: 'token', chainId: 10 }),
        allowance: formatUnits(maxUint256, 18),
      });
    });

    test('it should call the token contract and return the allowance', async () => {
      const allowanceMock = jest.fn().mockResolvedValue('10000000000000000000');
      contractService.getERC20TokenInstance.mockResolvedValue({
        read: {
          allowance: allowanceMock,
        },
      } as unknown as ReturnType<ContractService['getERC20TokenInstance']>);

      const result = await walletService.getSpecificAllowance(
        toToken({ address: 'token', chainId: 10 }),
        '0xaddressToCheck',
        '0xaccount'
      );

      expect(contractService.getERC20TokenInstance).toHaveBeenCalledTimes(1);
      expect(contractService.getERC20TokenInstance).toHaveBeenCalledWith({
        chainId: 10,
        readOnly: true,
        tokenAddress: 'token',
      });

      expect(allowanceMock).toHaveBeenCalledTimes(1);
      expect(allowanceMock).toHaveBeenCalledWith(['0xaccount', '0xaddressToCheck']);
      expect(result).toEqual({
        token: toToken({ address: 'token', chainId: 10 }),
        allowance: '10',
      });
    });
  });

  describe('buildApproveSpecificTokenTx', () => {
    let prepareTransactionRequestMock: jest.Mock;

    beforeEach(() => {
      prepareTransactionRequestMock = jest.fn().mockResolvedValue('populatedTransaction');
      mockedEncodeFunctionData.mockReturnValue('0xdata' as never);
      providerService.getSigner.mockResolvedValue({
        prepareTransactionRequest: prepareTransactionRequestMock,
      } as unknown as WalletClient);
      contractService.getERC20TokenInstance.mockResolvedValue({
        address: '0xerc20',
      } as unknown as ReturnType<ContractService['getERC20TokenInstance']>);
    });

    test('it should populate the transaction from the token contract', async () => {
      const result = await walletService.buildApproveSpecificTokenTx(
        '0xaccount',
        toToken({ address: 'token', chainId: 10 }),
        '0xaddressToApprove',
        10n
      );

      expect(contractService.getERC20TokenInstance).toHaveBeenCalledTimes(1);
      expect(contractService.getERC20TokenInstance).toHaveBeenCalledWith({
        chainId: 10,
        tokenAddress: 'token',
        readOnly: false,
        wallet: '0xaccount',
      });
      expect(mockedEncodeFunctionData).toHaveBeenCalledTimes(1);
      expect(mockedEncodeFunctionData).toHaveBeenCalledWith({
        address: '0xerc20',
        functionName: 'approve',
        args: ['0xaddressToApprove', 10n],
      });
      expect(prepareTransactionRequestMock).toHaveBeenCalledTimes(1);
      expect(prepareTransactionRequestMock).toHaveBeenCalledWith({
        to: '0xerc20',
        data: '0xdata',
        account: '0xaccount',
        chain: null,
      });
      expect(result).toEqual('populatedTransaction');
    });

    test('it should populate the transaction from the token contract with the max value if no amount is passed', async () => {
      const result = await walletService.buildApproveSpecificTokenTx(
        '0xaccount',
        toToken({ address: 'token', chainId: 10 }),
        '0xaddressToApprove'
      );

      expect(contractService.getERC20TokenInstance).toHaveBeenCalledTimes(1);
      expect(contractService.getERC20TokenInstance).toHaveBeenCalledWith({
        chainId: 10,
        tokenAddress: 'token',
        readOnly: false,
        wallet: '0xaccount',
      });
      expect(mockedEncodeFunctionData).toHaveBeenCalledTimes(1);
      expect(mockedEncodeFunctionData).toHaveBeenCalledWith({
        address: '0xerc20',
        functionName: 'approve',
        args: ['0xaddressToApprove', maxUint256],
      });
      expect(prepareTransactionRequestMock).toHaveBeenCalledTimes(1);
      expect(prepareTransactionRequestMock).toHaveBeenCalledWith({
        to: '0xerc20',
        data: '0xdata',
        account: '0xaccount',
        chain: null,
      });
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
      contractService.getHUBAddress.mockReturnValue('0xhubAddress');
      const result = await walletService.buildApproveTx(
        '0xaccount',
        toToken({ address: 'tokenAddress', chainId: 10 }),
        false,
        PositionVersions.POSITION_VERSION_3,
        10n
      );

      expect(contractService.getHUBAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBAddress).toHaveBeenCalledWith(10, PositionVersions.POSITION_VERSION_3);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledTimes(1);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledWith(
        '0xaccount',
        toToken({ address: 'tokenAddress', chainId: 10 }),
        '0xhubAddress',
        10n
      );
      expect(result).toEqual({ hash: 'transaction' });
    });

    test('it should call buildApproveSpecificTokenTx with the companion address if it should check the companion', async () => {
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
      const result = await walletService.buildApproveTx(
        '0xaccount',
        toToken({ address: 'tokenAddress', chainId: 10 }),
        true,
        PositionVersions.POSITION_VERSION_3,
        10n
      );

      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledTimes(1);
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(10, PositionVersions.POSITION_VERSION_3);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledTimes(1);
      expect(buildApproveSpecificTokenTxMock).toHaveBeenCalledWith(
        '0xaccount',
        toToken({ address: 'tokenAddress', chainId: 10 }),
        '0xcompanionAddress',
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
      contractService.getHUBAddress.mockReturnValue('0xhubAddress');
      const result = await walletService.approveToken(
        '0xaccount',
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
        '0xhubAddress',
        '0xaccount',
        10n
      );
      expect(result).toEqual({ hash: 'transaction' });
    });

    test('it should call approveSpecificToken with the companion address if it should check the companion', async () => {
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
      const result = await walletService.approveToken(
        '0xaccount',
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
        '0xcompanionAddress',
        '0xaccount',
        10n
      );
      expect(result).toEqual({ hash: 'transaction' });
    });
  });

  describe('approveSpecificToken', () => {
    let approveMock: jest.Mock;

    beforeEach(() => {
      approveMock = jest.fn().mockResolvedValue('0xhash');
      contractService.getERC20TokenInstance.mockResolvedValue({
        write: {
          approve: approveMock,
        },
      } as unknown as ReturnType<ContractService['getERC20TokenInstance']>);
    });

    test('it should call the approve method of the token contract', async () => {
      const result = await walletService.approveSpecificToken(
        toToken({ address: 'token' }),
        '0xaddressToApprove',
        '0xaccount',
        10n
      );

      expect(contractService.getERC20TokenInstance).toHaveBeenCalledTimes(1);
      expect(contractService.getERC20TokenInstance).toHaveBeenCalledWith({
        chainId: 1,
        tokenAddress: 'token',
        readOnly: false,
        wallet: '0xaccount',
      });
      expect(approveMock).toHaveBeenCalledTimes(1);
      expect(approveMock).toHaveBeenCalledWith(['0xaddressToApprove', 10n], {
        account: '0xaccount',
        chain: null,
      });
      expect(result).toEqual({
        hash: '0xhash',
        from: '0xaccount',
      });
    });

    test('it should call the approve method of the token contract with the max value if no amount is passed', async () => {
      const result = await walletService.approveSpecificToken(
        toToken({ address: 'token' }),
        '0xaddressToApprove',
        '0xaccount'
      );

      expect(contractService.getERC20TokenInstance).toHaveBeenCalledTimes(1);
      expect(contractService.getERC20TokenInstance).toHaveBeenCalledWith({
        chainId: 1,
        tokenAddress: 'token',
        readOnly: false,
        wallet: '0xaccount',
      });
      expect(approveMock).toHaveBeenCalledTimes(1);
      expect(approveMock).toHaveBeenCalledWith(['0xaddressToApprove', maxUint256], {
        account: '0xaccount',
        chain: null,
      });
      expect(result).toEqual({
        hash: '0xhash',
        from: '0xaccount',
      });
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
      } as unknown as WalletClient;
      providerService.getSigner.mockResolvedValue(mockedSigner);
    });

    test('it should not proceed if amount is not greater than zero', async () => {
      try {
        await walletService.transferToken({
          from: '0xfrom',
          to: '0xto',
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
      const transferFn = jest.fn().mockResolvedValue('0xtransfer');
      contractService.getERC20TokenInstance.mockResolvedValue({
        write: {
          transfer: transferFn,
        },
      } as unknown as ReturnType<ContractService['getERC20TokenInstance']>);

      const txResponse = await walletService.transferToken({
        from: '0xfrom',
        to: '0xto',
        token: erc20TokenMock,
        amount: 10n,
      });

      expect(contractService.getERC20TokenInstance).toHaveBeenCalledTimes(1);
      expect(contractService.getERC20TokenInstance).toHaveBeenCalledWith({
        chainId: 1,
        tokenAddress: 'token',
        readOnly: false,
        wallet: '0xfrom',
      });
      expect(txResponse).toEqual({
        hash: '0xtransfer',
        from: '0xfrom',
      });
      expect(transferFn).toHaveBeenCalledTimes(1);
      expect(transferFn).toHaveBeenCalledWith(['0xto', 10n], { account: '0xfrom', chain: null });
    });
    test('it should generate a transaction from the signer if the token is a protocol token', async () => {
      const txResponse = await walletService.transferToken({
        from: '0xfrom',
        to: '0xto',
        token: nativeTokenMock,
        amount: 10n,
      });

      expect(txResponse).toEqual({
        hash: 'sendTransaction',
        from: '0xfrom',
      });
      expect(signerSendTransaction).toHaveBeenCalledTimes(1);
      expect(signerSendTransaction).toHaveBeenCalledWith({
        account: '0xfrom',
        to: '0xto',
        value: 10n,
        chain: null,
      });
    });
    test('it should not proceed if token is not of type Native or ERC20', async () => {
      try {
        await walletService.transferToken({
          from: '0xfrom',
          to: '0xto',
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
          from: '0xfrom',
          to: '0xto',
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
        write: {
          transferFrom: transferFromFn,
        },
      } as unknown as ReturnType<ContractService['getERC721TokenInstance']>);

      const txResponse = await walletService.transferNFT({
        from: '0xfrom',
        to: '0xto',
        token: erc721TokenMock,
        tokenId: 1111n,
      });

      expect(contractService.getERC721TokenInstance).toHaveBeenCalledTimes(1);
      expect(contractService.getERC721TokenInstance).toHaveBeenCalledWith({
        chainId: 1,
        tokenAddress: 'nftToken',
        readOnly: false,
        wallet: '0xfrom',
      });
      expect(txResponse).toEqual({
        hash: 'transferFrom',
        from: '0xfrom',
      });
      expect(transferFromFn).toHaveBeenCalledTimes(1);
      expect(transferFromFn).toHaveBeenCalledWith(['0xfrom', '0xto', 1111n], { account: '0xfrom', chain: null });
    });
  });
});
