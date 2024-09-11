/* eslint-disable @typescript-eslint/unbound-method, jest/no-commented-out-tests */
import { createMockInstance } from '@common/utils/tests';
import AccountService, { WALLET_SIGNATURE_KEY } from './accountService';
import Web3Service from './web3Service';
import { Wallet, WalletStatus, WalletType, User, UserStatus, Account, WalletSignature } from '@types';
import { toWallet } from '@common/utils/accounts';
import { IProviderInfo } from '@common/utils/provider-info/types';
import MeanApiService from './meanApiService';
import { getConnectorData, getChainIdFromWalletClient } from '@common/utils/wagmi';
import { Connector } from 'wagmi';
import { WalletClient } from 'viem';

jest.mock('./web3Service');
jest.mock('@common/utils/provider-info', () => ({
  getProviderInfo: jest.fn(),
}));
jest.mock('@common/utils/wagmi', () => ({
  getConnectorData: jest.fn(),
  getChainIdFromWalletClient: jest.fn(),
}));

const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });
const MockedWeb3Service = jest.mocked(Web3Service, { shallow: true });
const mockedGetConnectorData = jest.mocked(getConnectorData, { shallow: true });
const mockedGetChainIdFromWalletClient = jest.mocked(getChainIdFromWalletClient, { shallow: true });

describe('Account Service', () => {
  let web3Service: jest.MockedObject<Web3Service>;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let accountService: AccountService;
  let activeWallet: Wallet;
  let user: User;
  let accounts: Account[];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let activeWalletProvider: WalletClient;
  const mockedTodaySeconds = 1642439808;
  let setAccountCallbackMock: jest.Mock;
  let onUpdateConfigMock: jest.Mock;
  let signMessageMock: jest.Mock;

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    const mockedToday = new Date(mockedTodaySeconds * 1000);
    jest.useFakeTimers();
    jest.setSystemTime(mockedToday);

    web3Service = createMockInstance(MockedWeb3Service);

    meanApiService = createMockInstance(MockedMeanApiService);

    mockedGetChainIdFromWalletClient.mockResolvedValue(10);

    accountService = new AccountService(web3Service, meanApiService);

    signMessageMock = jest.fn().mockResolvedValue('signature');

    activeWalletProvider = {
      signMessage: signMessageMock,
    } as unknown as WalletClient;

    setAccountCallbackMock = jest.fn();

    onUpdateConfigMock = jest.fn();

    web3Service.setAccountCallback = setAccountCallbackMock;
    web3Service.onUpdateConfig = onUpdateConfigMock;

    activeWallet = {
      type: WalletType.external,
      address: '0xaddress',
      label: 'External wallet',
      walletClient: activeWalletProvider,
      status: WalletStatus.connected,
      isAuth: true,
      providerInfo: {
        id: 'metamask',
        type: 'metamask',
        check: 'false',
        name: 'Metamask',
        logo: '',
      },
      chainId: 10,
    };

    accounts = [
      {
        id: '377ecf0f-008e-446a-8839-980deba4cee7',
        label: 'User label',
        labels: {},
        contacts: [],
        wallets: [
          {
            address: '0xaddress',
            isAuth: true,
          },
          {
            address: '0xsecondaddress',
            isAuth: false,
          },
        ],
      },
      {
        id: '50f9ef37-7c9a-4e28-a421-d73288e75236',
        label: 'Work user label',
        labels: {},
        contacts: [],
        wallets: [
          {
            address: '0xaddress',
            isAuth: true,
          },
        ],
      },
    ];

    user = {
      id: '377ecf0f-008e-446a-8839-980deba4cee7',
      wallets: [activeWallet, toWallet({ address: '0xsecondaddress', status: WalletStatus.disconnected })],
      status: UserStatus.loggedIn,
      label: 'User label',
    };

    accountService.user = user;

    accountService.activeWallet = activeWallet;

    accountService.accounts = accounts;

    accountService.signedWith = activeWallet;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('setActiveWallet', () => {
    it('should call the connect method of the web3Service', () => {
      accountService.setActiveWallet('0xaddress');

      expect(web3Service.setAccount).toHaveBeenCalledTimes(1);
      expect(web3Service.setAccount).toHaveBeenCalledWith('0xaddress');
      expect(web3Service.arcXConnect).toHaveBeenCalledTimes(1);
      expect(web3Service.arcXConnect).toHaveBeenCalledWith('0xaddress', 1);
    });
  });

  describe('getActiveWalletSigner', () => {
    describe('when there is no active wallet', () => {
      it('should return undefined', () => {
        accountService.activeWallet = undefined;
        const provider = accountService.getActiveWalletSigner();

        expect(provider).toEqual(undefined);
      });
    });

    describe('when there is an active wallet', () => {
      it('should return the activeWalletSigner', () => {
        const provider = accountService.getActiveWalletSigner();
        expect(JSON.stringify(provider)).toEqual(JSON.stringify(activeWalletProvider));
      });
    });
  });

  describe('unlinkWallet', () => {
    beforeEach(() => {
      meanApiService.unlinkWallet.mockResolvedValue(true);
      accountService.getWalletVerifyingSignature = jest.fn().mockResolvedValue('signature');
    });
    it('should throw an error if the user does not exist', async () => {
      accountService.user = undefined;
      try {
        await accountService.unlinkWallet('0xaddress');
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Cant delete a wallet from a non-existen user'));
      }
    });
    it('should throw an error if there is only one wallet on the user', async () => {
      accountService.user!.wallets = [activeWallet];
      try {
        await accountService.unlinkWallet('0xaddress');
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Cant delete the only wallet from a user'));
      }
    });
    it('should throw an error if the wallet does not exist on the user', async () => {
      try {
        await accountService.unlinkWallet('0xunknownWallet');
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('The wallet is not in the current user'));
      }
    });
    it('should throw an error if trying to remove the only auth wallet of a user', async () => {
      try {
        await accountService.unlinkWallet('0xaddress');
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Cannot remove the only admin wallet of a user'));
      }
    });

    it('should call the meanApiService and modify the accounts, user and active wallet', async () => {
      const walletToRemove = toWallet({
        address: '0xaddresstoremove',
        status: WalletStatus.connected,
        walletClient: activeWalletProvider,
        providerInfo: {
          id: 'metamask',
          type: 'metamask',
          check: 'false',
          name: 'Metamask',
          logo: '',
        },
      });
      const previousUser = {
        ...accountService.user,
      };

      const previousAccounts = [...accountService.accounts];

      accountService.activeWallet = walletToRemove;
      accountService.user!.wallets = [...accountService.user!.wallets, walletToRemove];
      accountService.accounts[0].wallets = [...accountService.accounts[0].wallets, walletToRemove];

      await accountService.unlinkWallet(walletToRemove.address);

      expect(accountService.user).toEqual({
        ...previousUser,
        wallets: [activeWallet, toWallet({ address: '0xsecondaddress', status: WalletStatus.disconnected })],
      });
      expect(accountService.accounts[0]).toEqual({
        ...previousAccounts[0],
        wallets: [activeWallet, toWallet({ address: '0xsecondaddress', status: WalletStatus.disconnected })],
      });
      expect(meanApiService.unlinkWallet).toHaveBeenCalledTimes(1);
      expect(meanApiService.unlinkWallet).toHaveBeenCalledWith({
        address: walletToRemove.address,
        accountId: previousUser.id,
        signature: 'signature',
      });
      expect(accountService.activeWallet).toEqual(activeWallet);
    });
  });
  describe('getWalletSigner', () => {
    describe('when the wallet is not to be found', () => {
      it('should throw an error', () => {
        try {
          accountService.getWalletSigner('unknown wallet');
          expect(1).toEqual(2);
        } catch (e) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(e).toEqual(Error('Cannot find wallet'));
        }
      });
    });

    describe('when the wallet is found', () => {
      it('should return the provider', () => {
        const provider = accountService.getWalletSigner('0xaddress');

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(JSON.stringify(provider)).toEqual(JSON.stringify(activeWalletProvider));
      });
    });
  });

  describe('getStoredWalletSignature', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let localStorageGetItemSpy: jest.SpyInstance<string | null, [key: string], any>;
    let getWalletSignerMock: jest.Mock;
    let tomorrow: Date;
    let today: Date;

    beforeEach(() => {
      signMessageMock = jest.fn().mockResolvedValue('signature');
      getWalletSignerMock = jest.fn().mockReturnValue({
        signMessage: signMessageMock,
      });
      localStorageGetItemSpy = jest.spyOn(Storage.prototype, 'getItem');
      accountService.getWalletSigner = getWalletSignerMock;

      today = new Date();

      tomorrow = new Date();

      tomorrow.setDate(today.getDate() + 1);

      user = {
        id: '377ecf0f-008e-446a-8839-980deba4cee7',
        wallets: [activeWallet],
        status: UserStatus.loggedIn,
        label: 'User label',
      };

      accountService.user = user;

      localStorageGetItemSpy.mockReturnValue(null);
    });

    it('should return the user signature if it is defined', () => {
      accountService.user!.signature = 'signature' as unknown as WalletSignature;

      const result = accountService.getStoredWalletSignature();

      expect(result).toEqual('signature');
    });

    it('should return the stored signature', () => {
      localStorageGetItemSpy.mockReturnValue(
        JSON.stringify({
          signer: '0xaddress',
          message: 'saved signature',
        })
      );

      const result = accountService.getStoredWalletSignature();

      expect(localStorageGetItemSpy).toHaveBeenCalledTimes(1);
      expect(localStorageGetItemSpy).toHaveBeenCalledWith(WALLET_SIGNATURE_KEY);
      expect(result).toEqual({
        signer: '0xaddress',
        message: 'saved signature',
      });
    });

    it('should return undefined if there is no stored signature', () => {
      const result = accountService.getStoredWalletSignature();

      expect(result).toEqual(undefined);
    });
  });

  describe('getWalletVerifyingSignature', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let localStorageSetItemSpy: jest.SpyInstance<void, [key: string, value: string], any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let getWalletSignerMock: jest.Mock;
    let getStoredWalletSignatureMock: jest.Mock;

    beforeEach(() => {
      signMessageMock = jest.fn().mockResolvedValue('signature');
      getWalletSignerMock = jest.fn().mockReturnValue({
        signMessage: signMessageMock,
      });
      getStoredWalletSignatureMock = jest.fn().mockReturnValue(undefined);
      localStorageSetItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      accountService.getWalletSigner = getWalletSignerMock;
      accountService.getStoredWalletSignature = getStoredWalletSignatureMock;

      user = {
        id: '377ecf0f-008e-446a-8839-980deba4cee7',
        wallets: [activeWallet],
        status: UserStatus.loggedIn,
        label: 'User label',
      };

      accountService.user = user;
    });

    afterEach(() => {
      localStorageSetItemSpy.mockRestore();
    });

    describe('when there is a saved signature', () => {
      beforeEach(() => {
        getStoredWalletSignatureMock.mockReturnValue('signature');
      });

      it('should use the saved signature', async () => {
        const signature = await accountService.getWalletVerifyingSignature({ address: '0xaddress' });

        expect(getStoredWalletSignatureMock).toHaveBeenCalledTimes(1);
        expect(signMessageMock).toHaveBeenCalledTimes(0);

        expect(signature).toEqual('signature');
      });

      it('should update the user signature', async () => {
        const signature = await accountService.getWalletVerifyingSignature({
          address: '0xaddress',
          updateSignature: true,
        });

        expect(getStoredWalletSignatureMock).toHaveBeenCalledTimes(1);
        expect(signMessageMock).toHaveBeenCalledTimes(0);

        expect(accountService.user?.signature).toEqual('signature');
        expect(signature).toEqual('signature');
      });
    });

    describe('when there is no saved signature', () => {
      describe('when updateSignature is false', () => {
        it('should ask for the user signature and save it by default', async () => {
          jest.useRealTimers();
          await accountService.getWalletVerifyingSignature({ address: '0xaddress', updateSignature: false });

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(accountService.user.signature).toEqual(undefined);

          expect(signMessageMock).toHaveBeenCalledTimes(1);
          expect(signMessageMock).toHaveBeenCalledWith({
            account: '0xaddress',
            message:
              'Welcome to Balmy! Sign in securely to your Balmy account by authenticating with your primary wallet.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication will remain active, allowing you to seamlessly access your account and explore the world of decentralized home banking.',
          });
        });
      });

      it('should ask for the user signature and save it by default', async () => {
        jest.useRealTimers();
        await accountService.getWalletVerifyingSignature({ address: '0xaddress' });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(accountService.user.signature.message).toEqual('signature');

        expect(signMessageMock).toHaveBeenCalledTimes(1);
        expect(signMessageMock).toHaveBeenCalledWith({
          account: '0xaddress',
          message:
            'Welcome to Balmy! Sign in securely to your Balmy account by authenticating with your primary wallet.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication will remain active, allowing you to seamlessly access your account and explore the world of decentralized home banking.',
        });
        expect(localStorageSetItemSpy).toHaveBeenCalledTimes(1);
        expect(localStorageSetItemSpy).toHaveBeenCalledWith(
          WALLET_SIGNATURE_KEY,
          JSON.stringify({
            message: 'signature',
            signer: '0xaddress',
          })
        );
      });
    });
  });

  // describe('getWalletLinkSignature', () => {
  //   let getWalletSignerMock: jest.Mock;
  //   let tomorrow: Date;
  //   let today: Date;

  //   beforeEach(() => {
  //     signMessageMock = jest.fn().mockResolvedValue('signature');
  //     getWalletSignerMock = jest.fn().mockReturnValue({
  //       signMessage: signMessageMock,
  //     });
  //     accountService.getWalletSigner = getWalletSignerMock;

  //     today = new Date();

  //     tomorrow = new Date();

  //     tomorrow.setMinutes(today.getMinutes() + 30);

  //     user = {
  //       id: '377ecf0f-008e-446a-8839-980deba4cee7',
  //       wallets: [activeWallet],
  //       status: UserStatus.loggedIn,
  //       label: 'User label',
  //     };

  //     accountService.user = user;
  //   });

  //   describe('when there is no user', () => {
  //     it('should throw an error', async () => {
  //       accountService.user = undefined;
  //       try {
  //         await accountService.getWalletLinkSignature({
  //           address: '0xsecondaddress',
  //         });
  //         expect(1).toEqual(2);
  //       } catch (e) {
  //         // eslint-disable-next-line jest/no-conditional-expect
  //         expect(e).toEqual(Error('User not defined'));
  //       }
  //     });
  //   });

  //   it('should ask for the user signature', async () => {
  //     const signature = await accountService.getWalletLinkSignature({ address: '0xsecondaddress' });

  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     expect(signature.expiration).toEqual(tomorrow.toString());
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     expect(signature.message).toEqual('signature');

  //     expect(signMessageMock).toHaveBeenCalledTimes(1);
  //     expect(signMessageMock).toHaveBeenCalledWith({
  //       account: '0xsecondaddress',
  //       message: `By signing this message you are authorizing the account User label (377ecf0f-008e-446a-8839-980deba4cee7) to add this wallet to it. This signature will expire on ${tomorrow.toString()}.`,
  //     });
  //   });
  // });

  // describe('changeWalletAdmin', () => {
  //   let getWalletLinkSignature: jest.Mock;
  //   let getWalletVerifyingSignature: jest.Mock;
  //   let tomorrow: Date;
  //   let today: Date;

  //   beforeEach(() => {
  //     today = new Date();

  //     tomorrow = new Date();

  //     tomorrow.setMinutes(today.getMinutes() + 30);

  //     getWalletLinkSignature = jest.fn().mockResolvedValue({
  //       expiration: tomorrow.toString(),
  //       message: 'signature',
  //     });
  //     getWalletVerifyingSignature = jest.fn().mockResolvedValue('veryfing-signature');
  //     accountService.getWalletLinkSignature = getWalletLinkSignature;
  //     accountService.getWalletVerifyingSignature = getWalletVerifyingSignature;
  //   });

  //   describe('when the user cannot be found', () => {
  //     it('should throw an error', async () => {
  //       accountService.user = undefined;
  //       try {
  //         await accountService.changeWalletAdmin({
  //           address: '0xanother',
  //           userId: '377ecf0f-008e-446a-8839-980deba4cee7',
  //           isAuth: true,
  //         });
  //         expect(1).toEqual(2);
  //       } catch (e) {
  //         // eslint-disable-next-line jest/no-conditional-expect
  //         expect(e).toEqual(Error('Wallet not found'));
  //       }
  //     });
  //   });

  //   describe('when the wallet cannot be found', () => {
  //     it('should throw an error', async () => {
  //       accountService.user = undefined;
  //       try {
  //         await accountService.changeWalletAdmin({
  //           address: '0xsecondaddress',
  //           userId: 'another id',
  //           isAuth: true,
  //         });
  //         expect(1).toEqual(2);
  //       } catch (e) {
  //         // eslint-disable-next-line jest/no-conditional-expect
  //         expect(e).toEqual(Error('Account not found'));
  //       }
  //     });
  //   });

  //   describe('when setting a wallet as auth method', () => {
  //     it('should send the request to the api and modify the local wallet', async () => {
  //       await accountService.changeWalletAdmin({
  //         address: '0xsecondaddress',
  //         isAuth: true,
  //         userId: '377ecf0f-008e-446a-8839-980deba4cee7',
  //       });

  //       expect(meanApiService.modifyWallet).toHaveBeenCalledTimes(1);
  //       expect(meanApiService.modifyWallet).toHaveBeenCalledWith({
  //         address: '0xsecondaddress',
  //         walletConfig: {
  //           isAuth: true,
  //           signature: 'signature',
  //           expiration: tomorrow.toString(),
  //         },
  //         accountId: '377ecf0f-008e-446a-8839-980deba4cee7',
  //         signature: 'veryfing-signature',
  //       });
  //       expect(getWalletLinkSignature).toHaveBeenCalledTimes(1);
  //       expect(getWalletLinkSignature).toHaveBeenCalledWith({ address: '0xsecondaddress' });

  //       expect(accountService.user?.wallets[1].isAuth).toEqual(true);
  //       expect(accountService.accounts[0].wallets[1].isAuth).toEqual(true);
  //     });
  //   });

  //   describe('when removing a wallet as auth method', () => {
  //     it('should send the request to the api and modify the local wallet', async () => {
  //       await accountService.changeWalletAdmin({
  //         address: '0xsecondaddress',
  //         isAuth: false,
  //         userId: '377ecf0f-008e-446a-8839-980deba4cee7',
  //       });

  //       expect(meanApiService.modifyWallet).toHaveBeenCalledTimes(1);
  //       expect(meanApiService.modifyWallet).toHaveBeenCalledWith({
  //         address: '0xsecondaddress',
  //         walletConfig: { isAuth: false },
  //         accountId: '377ecf0f-008e-446a-8839-980deba4cee7',
  //         signature: 'veryfing-signature',
  //       });
  //       expect(getWalletLinkSignature).toHaveBeenCalledTimes(0);

  //       expect(accountService.user?.wallets[1].isAuth).toEqual(false);
  //       expect(accountService.accounts[0].wallets[1].isAuth).toEqual(false);
  //     });
  //   });
  // });

  describe('updateWallet', () => {
    let connector: Connector | undefined;

    beforeEach(() => {
      connector = {} as unknown as Connector;

      accountService.activeWallet = activeWallet;
      mockedGetConnectorData.mockResolvedValue({
        walletClient: 'wallet-client',
        providerInfo: 'walletProviderInfo' as unknown as IProviderInfo,
        address: '0xsecondaddress',
      } as unknown as Awaited<ReturnType<typeof getConnectorData>>);
    });

    it('should thow if the connector is not existent', async () => {
      try {
        await accountService.updateWallet({});
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Connector not defined'));
      }
    });

    it('should thow if there is no logged in user', async () => {
      accountService.user = undefined;
      try {
        await accountService.updateWallet({});
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('User is not connected'));
      }
    });

    it('should update the user wallet', async () => {
      await accountService.updateWallet({ connector });

      expect(accountService.user?.wallets[1]).toEqual(
        toWallet({
          address: '0xsecondaddress',
          status: WalletStatus.connected,
          providerInfo: 'walletProviderInfo' as unknown as IProviderInfo,
          isAuth: false,
          // @ts-expect-error test
          walletClient: 'wallet-client',
          chainId: 10,
        })
      );
    });
  });

  describe('linkWallet', () => {
    let connector: Connector | undefined;
    let getWalletVerifyingSignature: jest.Mock;
    let walletClientMock: WalletClient;
    let tomorrow: Date;
    let today: Date;

    beforeEach(() => {
      connector = {} as unknown as Connector;

      today = new Date();

      tomorrow = new Date();

      tomorrow.setMinutes(today.getMinutes() + 30);

      signMessageMock = jest.fn().mockResolvedValue('signature');

      walletClientMock = {
        signMessage: signMessageMock,
      } as unknown as WalletClient;

      mockedGetConnectorData.mockResolvedValue({
        providerInfo: 'walletProviderInfo' as unknown as IProviderInfo,
        address: '0xThirdAddress',
        walletClient: walletClientMock,
      } as unknown as Awaited<ReturnType<typeof getConnectorData>>);

      getWalletVerifyingSignature = jest.fn().mockResolvedValue('veryfing-signature');
      accountService.getWalletVerifyingSignature = getWalletVerifyingSignature;
    });

    it('should thow if the connector is not existent', async () => {
      try {
        await accountService.linkWallet({
          isAuth: false,
        });
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('Connector not defined'));
      }
    });

    it('should thow if there is no logged in user', async () => {
      accountService.user = undefined;
      try {
        await accountService.linkWallet({
          isAuth: false,
        });
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('User is not connected'));
      }
    });

    describe('when setting the wallet as auth method', () => {
      it('should make the wallet sign a message, call the api and link the wallet', async () => {
        await accountService.linkWallet({ connector, isAuth: true });

        expect(signMessageMock).toHaveBeenCalledTimes(1);
        expect(signMessageMock).toHaveBeenCalledWith({
          message: `By signing this message you are authorizing the account User label (377ecf0f-008e-446a-8839-980deba4cee7) to add this wallet to it. This signature will expire on ${tomorrow.toString()}.`,
        });

        expect(meanApiService.linkWallet).toHaveBeenCalledTimes(1);
        expect(meanApiService.linkWallet).toHaveBeenCalledWith({
          accountId: '377ecf0f-008e-446a-8839-980deba4cee7',
          wallet: {
            address: '0xThirdAddress',
            isAuth: true,
            signature: 'signature',
            expiration: tomorrow.toString(),
          },
          signature: 'veryfing-signature',
        });
        expect(accountService.user?.wallets[2]).toEqual(
          toWallet({
            address: '0xThirdAddress',
            status: WalletStatus.connected,
            providerInfo: 'walletProviderInfo' as unknown as IProviderInfo,
            isAuth: true,
            walletClient: walletClientMock,
            chainId: 10,
          })
        );
        expect(accountService.accounts[0].wallets[2]).toEqual({
          address: '0xThirdAddress',
          isAuth: true,
        });
      });
    });

    describe('when not setting the wallet as auth method', () => {
      it('should not make the wallet sing, call the api and link the wallet', async () => {
        await accountService.linkWallet({ connector, isAuth: false });

        expect(meanApiService.linkWallet).toHaveBeenCalledTimes(1);
        expect(meanApiService.linkWallet).toHaveBeenCalledWith({
          accountId: '377ecf0f-008e-446a-8839-980deba4cee7',
          wallet: {
            address: '0xThirdAddress',
            isAuth: false,
          },
          signature: 'veryfing-signature',
        });

        expect(accountService.user?.wallets[2]).toEqual(
          toWallet({
            address: '0xThirdAddress',
            status: WalletStatus.connected,
            providerInfo: 'walletProviderInfo' as unknown as IProviderInfo,
            isAuth: false,
            walletClient: walletClientMock,
            chainId: 10,
          })
        );
        expect(accountService.accounts[0].wallets[2]).toEqual({
          address: '0xThirdAddress',
          isAuth: false,
        });
      });
    });
  });

  describe('createUser', () => {
    let changeUserMock: jest.Mock;

    beforeEach(() => {
      meanApiService.createAccount.mockResolvedValue({ accountId: 'new-id' });

      changeUserMock = jest.fn();

      accountService.changeUser = changeUserMock;
    });

    it('should create a user and set it on the service', async () => {
      await accountService.createUser({
        label: 'new user',
        signature: {
          signer: '0xanother id',
          message: 'saved signature',
        },
      });

      expect(meanApiService.createAccount).toHaveBeenCalledTimes(1);
      expect(meanApiService.createAccount).toHaveBeenCalledWith({
        label: 'new user',
        signature: {
          message: 'saved signature',
          signer: '0xanother id',
        },
      });

      expect(changeUserMock).toHaveBeenCalledTimes(1);
      expect(changeUserMock).toHaveBeenCalledWith(
        'new-id',
        { message: 'saved signature', signer: '0xanother id' },
        {
          address: '0xanother id',
          isAuth: true,
          status: WalletStatus.disconnected,
          type: WalletType.external,
        }
      );
      expect(accountService.accounts[2]).toEqual({
        id: 'new-id',
        label: 'new user',
        labels: {},
        contacts: [],
        wallets: [
          {
            address: '0xanother id',
            isAuth: true,
            status: WalletStatus.disconnected,
            type: WalletType.external,
          },
        ],
      });
      expect(accountService.accounts[2].wallets[0]).toEqual({
        address: '0xanother id',
        isAuth: true,
        status: WalletStatus.disconnected,
        type: WalletType.external,
      });
    });
  });

  describe('logInUser', () => {
    let connector: Connector | undefined;
    let setActiveWalletMock: jest.Mock;
    let getWalletVerifyingSignature: jest.Mock;
    let getStoredWalletSignature: jest.Mock;
    let createUserMock: jest.Mock;

    beforeEach(() => {
      connector = {} as unknown as Connector;

      setActiveWalletMock = jest.fn();
      createUserMock = jest.fn();

      mockedGetConnectorData.mockResolvedValue({
        walletClient: activeWalletProvider,
        providerInfo: {
          id: 'metamask',
          type: 'metamask',
          check: 'false',
          name: 'Metamask',
          logo: '',
        },
        address: '0xaddress',
      } as unknown as Awaited<ReturnType<typeof getConnectorData>>);

      accountService.user = undefined;
      accountService.activeWallet = undefined;
      accountService.accounts = [];

      getStoredWalletSignature = jest.fn().mockReturnValue('veryfing-signature');
      getWalletVerifyingSignature = jest.fn().mockResolvedValue('veryfing-signature');
      accountService.getWalletVerifyingSignature = getWalletVerifyingSignature;
      accountService.getStoredWalletSignature = getStoredWalletSignature;
      accountService.setActiveWallet = setActiveWalletMock;
      accountService.createUser = createUserMock;
    });

    it('should do nothing if the connector is not existent and there is not store signature', async () => {
      getStoredWalletSignature.mockReturnValue(undefined);
      await accountService.logInUser();

      expect(accountService.user).toEqual(undefined);
      expect(accountService.accounts).toEqual([]);
      expect(setActiveWalletMock).toHaveBeenCalledTimes(0);
    });

    describe('when the wallet has accounts on the DB', () => {
      beforeEach(() => {
        meanApiService.getAccounts.mockResolvedValue({
          accounts: [
            {
              id: '377ecf0f-008e-446a-8839-980deba4cee7',
              label: 'User label',
              labels: {},
              contacts: [],
              wallets: [
                {
                  address: '0xaddress',
                  isAuth: true,
                },
                {
                  address: '0xsecondaddress',
                  isAuth: false,
                },
              ],
              config: {},
            },
            {
              id: '50f9ef37-7c9a-4e28-a421-d73288e75236',
              label: 'Work user label',
              labels: {},
              contacts: [],
              config: {},
              wallets: [
                {
                  address: '0xaddress',
                  isAuth: true,
                },
              ],
            },
          ],
        });
      });

      it('should ask for a signature if there is none stored', async () => {
        getStoredWalletSignature.mockReturnValue(undefined);
        await accountService.logInUser(connector);

        expect(getWalletVerifyingSignature).toHaveBeenCalledTimes(1);
        expect(getWalletVerifyingSignature).toHaveBeenCalledWith({ walletClient: activeWalletProvider });
      });

      it('should not ask for a signature if there is none stored', async () => {
        await accountService.logInUser(connector);

        expect(getWalletVerifyingSignature).toHaveBeenCalledTimes(0);
      });

      it('should log in the wallet and set the account', async () => {
        await accountService.logInUser(connector);

        expect(setActiveWalletMock).toHaveBeenCalledTimes(1);
        expect(setActiveWalletMock).toHaveBeenCalledWith('0xaddress');

        expect(meanApiService.getAccounts).toHaveBeenCalledTimes(1);
        expect(meanApiService.getAccounts).toHaveBeenCalledWith({
          signature: 'veryfing-signature',
        });
        expect(accountService.accounts).toEqual([
          {
            id: '377ecf0f-008e-446a-8839-980deba4cee7',
            label: 'User label',
            labels: {},
            config: {},
            contacts: [],
            wallets: [
              {
                address: '0xaddress',
                isAuth: true,
              },
              {
                address: '0xsecondaddress',
                isAuth: false,
              },
            ],
          },
          {
            id: '50f9ef37-7c9a-4e28-a421-d73288e75236',
            label: 'Work user label',
            labels: {},
            contacts: [],
            config: {},
            wallets: [
              {
                address: '0xaddress',
                isAuth: true,
              },
            ],
          },
        ]);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const walletProvider = accountService.user?.wallets[0].walletClient;

        expect(walletProvider).toEqual(activeWalletProvider);
      });
    });

    describe('when the wallet does not have accounts on the DB', () => {
      beforeEach(() => {
        meanApiService.getAccounts.mockResolvedValue({ accounts: [] });
      });
      it('should go to create the user', async () => {
        await accountService.logInUser(connector);

        expect(meanApiService.getAccounts).toHaveBeenCalledTimes(1);
        expect(meanApiService.getAccounts).toHaveBeenCalledWith({
          signature: 'veryfing-signature',
        });
        expect(createUserMock).toHaveBeenCalledTimes(1);
        expect(createUserMock).toHaveBeenCalledWith({
          label: 'Personal',
          signature: 'veryfing-signature',
          wallet: {
            walletClient: activeWalletProvider,
            providerInfo: {
              id: 'metamask',
              type: 'metamask',
              check: 'false',
              name: 'Metamask',
              logo: '',
            },
            chainId: 10,
            address: '0xaddress',
            isAuth: true,
            type: WalletType.external,
            status: WalletStatus.connected,
          },
        });
      });
    });
  });

  describe('changeUser', () => {
    let setActiveWalletMock: jest.Mock;

    beforeEach(() => {
      setActiveWalletMock = jest.fn();

      accountService.setActiveWallet = setActiveWalletMock;
    });

    it('should thow if the user is not found', () => {
      try {
        accountService.changeUser('non-existent-id');
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('User is not connected'));
      }
    });

    describe('when the active wallet is in the new user wallets', () => {
      it('should not change the active wallet', () => {
        accountService.changeUser('50f9ef37-7c9a-4e28-a421-d73288e75236');

        expect(setActiveWalletMock).toHaveBeenCalledTimes(0);
      });
    });

    describe('when the active wallet is not in the new user wallets', () => {
      beforeEach(() => {
        accountService.activeWallet = toWallet({ address: '0xsecondaddress', status: WalletStatus.disconnected });
      });

      it('should change the active wallet to the signin wallet', () => {
        accountService.changeUser('50f9ef37-7c9a-4e28-a421-d73288e75236');

        expect(setActiveWalletMock).toHaveBeenCalledTimes(1);
        expect(setActiveWalletMock).toHaveBeenCalledWith('0xaddress');
      });
    });

    it('change the current user', () => {
      accountService.changeUser('50f9ef37-7c9a-4e28-a421-d73288e75236');

      expect(accountService.user).toEqual({
        id: '50f9ef37-7c9a-4e28-a421-d73288e75236',
        wallets: [activeWallet],
        status: UserStatus.loggedIn,
        label: 'Work user label',
      });
    });
  });
});
/* eslint-enable @typescript-eslint/unbound-method, jest/no-commented-out-tests */
