/* eslint-disable @typescript-eslint/unbound-method */
import { createMockInstance } from '@common/utils/tests';
import AccountService, { LAST_LOGIN_KEY, WALLET_SIGNATURE_KEY } from './accountService';
import Web3Service from './web3Service';
import { UserType, Wallet, WalletStatus, WalletType, User } from '@types';
import { Web3Provider } from '@ethersproject/providers';
import { ConnectedWallet, User as PrivyUser } from '@privy-io/react-auth';
import { getProviderInfo } from '@common/utils/provider-info';
import { IProviderInfo } from '@common/utils/provider-info/types';
import { Connector } from 'wagmi';
import { ethers } from 'ethers';

jest.mock('./web3Service');
jest.mock('@common/utils/provider-info', () => ({
  getProviderInfo: jest.fn(),
}));
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ethers: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ...jest.requireActual('ethers').ethers,
    providers: {
      Web3Provider: jest.fn(),
    },
  },
}));

const MockedWeb3Service = jest.mocked(Web3Service, { shallow: true });

const MockedProviderInfo = jest.mocked(getProviderInfo, { shallow: true });

const MockedEthers = jest.mocked(ethers, { shallow: false });

describe('Position Service', () => {
  let web3Service: jest.MockedObject<Web3Service>;
  let accountService: AccountService;
  let activeWallet: Wallet;
  let user: User;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let activeWalletProvider: Web3Provider;
  let getActiveWalletProvider;
  const mockedTodaySeconds = 1642439808;

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    const mockedToday = new Date(mockedTodaySeconds * 1000);
    jest.useFakeTimers();
    jest.setSystemTime(mockedToday);

    web3Service = createMockInstance(MockedWeb3Service);

    accountService = new AccountService(web3Service);

    activeWalletProvider = {
      getNetwork: jest.fn(),
      getSigner: jest.fn().mockResolvedValue('active signer'),
    } as unknown as Web3Provider;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    getActiveWalletProvider = jest.fn().mockResolvedValue(activeWalletProvider);

    activeWallet = {
      type: WalletType.embedded,
      address: '0x123',
      label: 'Embedded Wallet',
      getProvider: getActiveWalletProvider,
      status: WalletStatus.connected,
      providerInfo: {
        id: 'privy',
        type: 'privy',
        check: 'false',
        name: 'privy',
        logo: '',
      },
    };

    user = {
      id: 'privy:123',
      wallets: [activeWallet],
      type: UserType.privy,
      privyUser: {
        id: 'privy:123',
        createdAt: new Date(),
        linkedAccounts: [],
      },
    };

    accountService.user = user;

    accountService.activeWallet = activeWallet;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('setActiveWallet', () => {
    it('should call the connect method of the web3Service', async () => {
      await accountService.setActiveWallet('0x123');

      expect(web3Service.connect).toHaveBeenCalledTimes(1);
      expect(web3Service.connect).toHaveBeenCalledWith(activeWalletProvider, undefined, undefined);
    });
  });

  describe('getActiveWalletProvider', () => {
    describe('when there is no active wallet', () => {
      it('should return undefined', async () => {
        accountService.activeWallet = undefined;
        const provider = await accountService.getActiveWalletProvider();

        expect(provider).toEqual(undefined);
      });
    });

    describe('when there is an active wallet', () => {
      it('should return the activeWalletProvider', async () => {
        const provider = await accountService.getActiveWalletProvider();
        expect(JSON.stringify(provider)).toEqual(JSON.stringify(activeWalletProvider));
      });
    });
  });

  describe('getActiveWalletSigner', () => {
    describe('when there is no active wallet', () => {
      it('should return undefined', async () => {
        accountService.activeWallet = undefined;
        const provider = await accountService.getActiveWalletSigner();

        expect(provider).toEqual(undefined);
      });
    });

    describe('when there is an active wallet', () => {
      it('should return the activeWalletProvider', async () => {
        const provider = await accountService.getActiveWalletSigner();

        expect(provider).toEqual('active signer');
      });
    });
  });

  describe('getWalletProvider', () => {
    describe('when the wallet is not to be found', () => {
      it('should throw an error', async () => {
        try {
          await accountService.getWalletProvider('unknown wallet');
          expect(1).toEqual(2);
        } catch (e) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(e).toEqual(Error('Cannot find wallet'));
        }
      });
    });

    describe('when the wallet is found', () => {
      it('should call the getNetwork method of the provider', async () => {
        await accountService.getWalletProvider('0x123');

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(activeWalletProvider.getNetwork).toHaveBeenCalledTimes(1);
      });

      it('should return the provider', async () => {
        const provider = await accountService.getWalletProvider('0x123');

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(provider).toEqual(activeWalletProvider);
      });
    });
  });

  describe('getWalletSigner', () => {
    describe('when the wallet is not to be found', () => {
      it('should throw an error', async () => {
        try {
          await accountService.getWalletSigner('unknown wallet');
          expect(1).toEqual(2);
        } catch (e) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(e).toEqual(Error('Cannot find wallet'));
        }
      });
    });

    describe('when the wallet is found', () => {
      it('should return the provider', async () => {
        const provider = await accountService.getWalletSigner('0x123');

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(provider).toEqual('active signer');
      });
    });
  });

  describe('setUser', () => {
    it('should set user and active wallet to undefined if not passed either a user or wallets', async () => {
      await accountService.setUser();

      expect(accountService.activeWallet).toEqual(undefined);
      expect(accountService.user).toEqual(undefined);
    });

    it('should set user and active wallet to undefined if no wallets are passsed', async () => {
      await accountService.setUser({
        id: 'bla',
        createdAt: new Date(),
        linkedAccounts: [],
      });

      expect(accountService.activeWallet).toEqual(undefined);
      expect(accountService.user).toEqual(undefined);
    });

    describe('when the user is valid', () => {
      let privyUser: PrivyUser | undefined;
      let privyProvider: { provider: string };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let privyWalletGetProvider: jest.Mock<any, any, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let metamaskWalletGetProvider: jest.Mock<any, any, any>;

      beforeEach(() => {
        privyUser = {
          id: 'bla',
          createdAt: new Date(),
          linkedAccounts: [
            {
              type: 'wallet',
              walletClientType: 'privy',
              address: '0xprivy',
            },
            {
              type: 'wallet',
              walletClientType: 'metamask',
              address: '0xmetamask',
            },
            {
              type: 'wallet',
              walletClientType: 'unconnected',
              address: '0xunconnected',
            },
            {
              type: 'discord_oauth',
            },
          ] as unknown as PrivyUser['linkedAccounts'],
        };

        privyProvider = {
          provider: 'privyProvider',
        };

        privyWalletGetProvider = jest.fn().mockResolvedValue(privyProvider);
        metamaskWalletGetProvider = jest.fn().mockResolvedValue({
          provider: {
            walletProvider: {
              walletProvider: 'metamaskProvider',
            },
          },
        });

        MockedProviderInfo.mockReturnValueOnce('privyProviderInfo' as unknown as IProviderInfo).mockReturnValueOnce(
          'metamaskProviderInfo' as unknown as IProviderInfo
        );
      });

      it('should not change the activeWallet if there is one defined', async () => {
        await accountService.setUser(privyUser, [
          {
            getEthersProvider: privyWalletGetProvider,
            address: '0xprivy',
          },
          {
            getEthersProvider: metamaskWalletGetProvider,
            address: '0xmetamask',
          },
        ] as unknown as ConnectedWallet[]);

        expect(accountService.user).toEqual({
          id: 'privy:bla',
          type: UserType.privy,
          privyUser,
          wallets: [
            {
              type: WalletType.embedded,
              address: '0xprivy',
              status: WalletStatus.connected,
              getProvider: privyWalletGetProvider,
              providerInfo: 'privyProviderInfo',
            },
            {
              type: WalletType.external,
              address: '0xmetamask',
              status: WalletStatus.connected,
              getProvider: metamaskWalletGetProvider,
              providerInfo: 'metamaskProviderInfo',
            },
            {
              type: WalletType.external,
              address: '0xunconnected',
              status: WalletStatus.disconnected,
              getProvider: undefined,
              providerInfo: undefined,
            },
          ],
        });

        expect(accountService.activeWallet).toEqual(activeWallet);
      });

      it('should set the user and parse the wallets', async () => {
        accountService.activeWallet = undefined;
        await accountService.setUser(privyUser, [
          {
            getEthersProvider: privyWalletGetProvider,
            address: '0xprivy',
          },
          {
            getEthersProvider: metamaskWalletGetProvider,
            address: '0xmetamask',
          },
        ] as unknown as ConnectedWallet[]);

        expect(accountService.user).toEqual({
          id: 'privy:bla',
          type: UserType.privy,
          privyUser,
          wallets: [
            {
              type: WalletType.embedded,
              address: '0xprivy',
              status: WalletStatus.connected,
              getProvider: privyWalletGetProvider,
              providerInfo: 'privyProviderInfo',
            },
            {
              type: WalletType.external,
              address: '0xmetamask',
              status: WalletStatus.connected,
              getProvider: metamaskWalletGetProvider,
              providerInfo: 'metamaskProviderInfo',
            },
            {
              type: WalletType.external,
              address: '0xunconnected',
              status: WalletStatus.disconnected,
              getProvider: undefined,
              providerInfo: undefined,
            },
          ],
        });

        expect(accountService.activeWallet).toEqual({
          type: WalletType.embedded,
          address: '0xprivy',
          status: WalletStatus.connected,
          getProvider: privyWalletGetProvider,
          providerInfo: 'privyProviderInfo',
        });

        expect(MockedProviderInfo).toHaveBeenCalledTimes(2);
        expect(MockedProviderInfo).toHaveBeenCalledWith('metamaskProvider', false);
        expect(MockedProviderInfo).toHaveBeenCalledWith(privyProvider, true);
      });

      it('should set the first wallet as active if there is no embedded one', async () => {
        accountService.activeWallet = undefined;

        privyUser = {
          id: 'bla',
          createdAt: new Date(),
          linkedAccounts: [
            {
              type: 'wallet',
              walletClientType: 'metamask',
              address: '0xmetamask',
            },
            {
              type: 'wallet',
              walletClientType: 'unconnected',
              address: '0xunconnected',
            },
            {
              type: 'discord_oauth',
            },
          ] as unknown as PrivyUser['linkedAccounts'],
        };

        const metamaskWalletGetProvicer = jest.fn().mockResolvedValue({
          provider: {
            walletProvider: {
              walletProvider: 'metamaskProvider',
            },
          },
        });

        MockedProviderInfo.mockReturnValueOnce('metamaskProviderInfo' as unknown as IProviderInfo);

        await accountService.setUser(privyUser, [
          {
            getEthersProvider: metamaskWalletGetProvicer,
            address: '0xmetamask',
          },
        ] as unknown as ConnectedWallet[]);

        expect(accountService.activeWallet).toEqual({
          type: WalletType.external,
          address: '0xmetamask',
          status: WalletStatus.connected,
          getProvider: metamaskWalletGetProvicer,
          providerInfo: 'privyProviderInfo',
        });
      });
    });
  });

  describe('setExternalUser', () => {
    let connector: Connector | undefined;
    let baseProvider: { provider: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let web3ProviderMocked: Web3Provider;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let walletGetProvider: jest.Mock<any, any, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let getWalletVerifyingSignatureMock: jest.Mock<any, any, any>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let localStorageSpy: jest.SpyInstance<void, [key: string, value: string], any>;

    beforeEach(() => {
      baseProvider = {
        provider: 'baseProvider',
      };

      localStorageSpy = jest.spyOn(Storage.prototype, 'setItem');

      walletGetProvider = jest.fn().mockResolvedValue(baseProvider);

      connector = {
        getProvider: walletGetProvider,
      } as unknown as Connector;

      MockedProviderInfo.mockReturnValueOnce('walletProviderInfo' as unknown as IProviderInfo);

      web3ProviderMocked = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xexternal'),
        }),
      } as unknown as Web3Provider;

      MockedEthers.providers.Web3Provider.mockImplementation(() => web3ProviderMocked);

      getWalletVerifyingSignatureMock = jest.fn();

      accountService.getWalletVerifyingSignature = getWalletVerifyingSignatureMock;
    });

    afterEach(() => {
      localStorageSpy.mockRestore();
    });

    it('should do nothing if the connector is not existent', async () => {
      await accountService.setExternalUser();

      expect(accountService.user).toEqual(user);
      expect(accountService.activeWallet).toEqual(activeWallet);
      expect(getWalletVerifyingSignatureMock).toHaveBeenCalledTimes(0);
      expect(localStorageSpy).toHaveBeenCalledTimes(0);
    });

    it('should set the user and parse the wallets', async () => {
      accountService.activeWallet = undefined;
      await accountService.setExternalUser(connector);

      const tomorrow = new Date();

      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(accountService.user).toEqual({
        id: 'wallet:0xexternal',
        type: UserType.wallet,
        signature: {
          message: '0x',
          expiration: tomorrow.toDateString(),
        },
        wallets: [
          {
            type: WalletType.external,
            address: '0xexternal',
            status: WalletStatus.connected,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            getProvider: expect.any(Function),
            providerInfo: 'walletProviderInfo',
          },
        ],
      });

      expect(accountService.activeWallet).toEqual({
        type: WalletType.external,
        address: '0xexternal',
        status: WalletStatus.connected,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        getProvider: expect.any(Function),
        providerInfo: 'walletProviderInfo',
      });

      const activeProvider = await accountService.activeWallet!.getProvider();
      expect(activeProvider).toEqual(web3ProviderMocked);
      expect(MockedProviderInfo).toHaveBeenCalledTimes(1);
      expect(MockedProviderInfo).toHaveBeenCalledWith(baseProvider);
      expect(getWalletVerifyingSignatureMock).toHaveBeenCalledTimes(1);
      expect(getWalletVerifyingSignatureMock).toHaveBeenCalledWith('0xexternal', tomorrow.toDateString());
      expect(localStorageSpy).toHaveBeenCalledTimes(1);
      expect(localStorageSpy).toHaveBeenCalledWith(LAST_LOGIN_KEY, UserType.wallet);
    });

    it('should modify the active wallet if it is different than the connected one', async () => {
      await accountService.setExternalUser(connector);

      const tomorrow = new Date();

      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(accountService.user).toEqual({
        id: 'wallet:0xexternal',
        type: UserType.wallet,
        signature: {
          message: '0x',
          expiration: tomorrow.toDateString(),
        },
        wallets: [
          {
            type: WalletType.external,
            address: '0xexternal',
            status: WalletStatus.connected,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            getProvider: expect.any(Function),
            providerInfo: 'walletProviderInfo',
          },
        ],
      });

      expect(accountService.activeWallet).toEqual({
        type: WalletType.external,
        address: '0xexternal',
        status: WalletStatus.connected,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        getProvider: expect.any(Function),
        providerInfo: 'walletProviderInfo',
      });

      const activeProvider = await accountService.activeWallet!.getProvider();
      expect(activeProvider).toEqual(web3ProviderMocked);
      expect(MockedProviderInfo).toHaveBeenCalledTimes(1);
      expect(MockedProviderInfo).toHaveBeenCalledWith(baseProvider);
      expect(getWalletVerifyingSignatureMock).toHaveBeenCalledTimes(1);
      expect(getWalletVerifyingSignatureMock).toHaveBeenCalledWith('0xexternal', tomorrow.toDateString());
      expect(localStorageSpy).toHaveBeenCalledTimes(1);
      expect(localStorageSpy).toHaveBeenCalledWith(LAST_LOGIN_KEY, UserType.wallet);
    });
  });
  describe('getWalletVerifyingSignature', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let localStorageSetItemSpy: jest.SpyInstance<void, [key: string, value: string], any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let localStorageGetItemSpy: jest.SpyInstance<string | null, [key: string], any>;
    let getWalletSignerMock: jest.Mock;
    let signMessageMock: jest.Mock;
    let tomorrow: Date;
    let today: Date;

    beforeEach(() => {
      signMessageMock = jest.fn().mockResolvedValue('signature');
      getWalletSignerMock = jest.fn().mockResolvedValue({
        signMessage: signMessageMock,
      });
      localStorageSetItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      localStorageGetItemSpy = jest.spyOn(Storage.prototype, 'getItem');
      accountService.getWalletSigner = getWalletSignerMock;

      today = new Date();

      tomorrow = new Date();

      tomorrow.setDate(today.getDate() + 1);
      user = {
        id: 'wallet:0xaddress',
        wallets: [activeWallet],
        type: UserType.wallet,
        signature: {
          message: '0x',
          expiration: '',
        },
      };

      accountService.user = user;

      localStorageGetItemSpy.mockReturnValue(null);
    });

    afterEach(() => {
      localStorageSetItemSpy.mockRestore();
      localStorageGetItemSpy.mockRestore();
    });

    it('should do nothing if the user is not on wallet', async () => {
      accountService.user!.type = UserType.privy;

      await accountService.getWalletVerifyingSignature('0xaddress', tomorrow.toDateString());

      expect(signMessageMock).toHaveBeenCalledTimes(0);
      expect(localStorageGetItemSpy).toHaveBeenCalledTimes(0);
      expect(localStorageSetItemSpy).toHaveBeenCalledTimes(0);
    });

    describe('when there is a saved signature', () => {
      beforeEach(() => {
        localStorageGetItemSpy.mockReturnValue(
          JSON.stringify({
            id: accountService.user?.id,
            expiration: tomorrow.toDateString(),
            message: 'saved signature',
          })
        );
      });

      it('should use the saved signature', async () => {
        await accountService.getWalletVerifyingSignature('0xaddress', tomorrow.toDateString());

        expect(localStorageGetItemSpy).toHaveBeenCalledTimes(1);
        expect(localStorageGetItemSpy).toHaveBeenCalledWith(WALLET_SIGNATURE_KEY);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(accountService.user.signature.expiration).toEqual(tomorrow.toDateString());
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(accountService.user.signature.message).toEqual('saved signature');

        expect(signMessageMock).toHaveBeenCalledTimes(0);
        expect(localStorageSetItemSpy).toHaveBeenCalledTimes(0);
      });

      it('should not use the saved signature if the user id does not match', async () => {
        localStorageGetItemSpy.mockReturnValue(
          JSON.stringify({
            id: 'another id',
            expiration: tomorrow.toDateString(),
            message: 'saved signature',
          })
        );

        await accountService.getWalletVerifyingSignature('0xaddress', tomorrow.toDateString());

        expect(localStorageGetItemSpy).toHaveBeenCalledTimes(1);
        expect(localStorageGetItemSpy).toHaveBeenCalledWith(WALLET_SIGNATURE_KEY);
        expect(signMessageMock).toHaveBeenCalledTimes(1);
      });

      it('should not use the saved signature if the signature is expired', async () => {
        tomorrow.setDate(tomorrow.getDate() - 2);
        localStorageGetItemSpy.mockReturnValue(
          JSON.stringify({
            id: 'another id',
            expiration: tomorrow.toDateString(),
            message: 'saved signature',
          })
        );

        await accountService.getWalletVerifyingSignature('0xaddress', tomorrow.toDateString());

        expect(localStorageGetItemSpy).toHaveBeenCalledTimes(1);
        expect(localStorageGetItemSpy).toHaveBeenCalledWith(WALLET_SIGNATURE_KEY);
        expect(signMessageMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('when there is no saved signature', () => {
      it('should ask for the user signature', async () => {
        await accountService.getWalletVerifyingSignature('0xaddress', tomorrow.toDateString());

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(accountService.user.signature.expiration).toEqual(tomorrow.toDateString());
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(accountService.user.signature.message).toEqual('signature');

        expect(signMessageMock).toHaveBeenCalledTimes(1);
        expect(signMessageMock).toHaveBeenCalledWith(`Sign in until ${tomorrow.toDateString()}`);
        expect(localStorageSetItemSpy).toHaveBeenCalledTimes(1);
        expect(localStorageSetItemSpy).toHaveBeenCalledWith(
          WALLET_SIGNATURE_KEY,
          JSON.stringify({
            id: user.id,
            expiration: tomorrow.toDateString(),
            message: 'signature',
          })
        );
      });
    });
  });
});
/* eslint-enable @typescript-eslint/unbound-method */
