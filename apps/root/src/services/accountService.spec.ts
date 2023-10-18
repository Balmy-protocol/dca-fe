/* eslint-disable @typescript-eslint/unbound-method */
import { createMockInstance } from '@common/utils/tests';
import AccountService from './accountService';
import Web3Service from './web3Service';
import { UserType, Wallet, WalletType } from '@types';

jest.mock('./web3Service');
const MockedWeb3Service = jest.mocked(Web3Service, { shallow: true });

describe('Position Service', () => {
  let web3Service: jest.MockedObject<Web3Service>;
  let accountService: AccountService;
  let activeWallet;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let activeWalletProvider;

  beforeEach(() => {
    web3Service = createMockInstance(MockedWeb3Service);

    accountService = new AccountService(web3Service);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    activeWalletProvider = jest.fn().mockResolvedValue({
      getNetwork: jest.fn(),
      getSigner: jest.fn().mockResolvedValue('active signer'),
    });

    activeWallet = {
      type: WalletType.embedded,
      address: '0x123',
      label: 'Embedded Wallet',
      getProvider: activeWalletProvider,
    };

    accountService.user = {
      id: 'privy-123',
      wallets: [activeWallet as unknown as Wallet],
      type: UserType.privy,
      privyUser: {
        id: 'privy-123',
        createdAt: new Date(),
        linkedAccounts: [],
      },
    };

    accountService.activeWallet = activeWallet as unknown as Wallet;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('setActiveWallet', () => {
    it('should call the connect method of the web3Service', async () => {
      await accountService.setActiveWallet('0x123');

      expect(web3Service.connect).toHaveBeenCalledTimes(1);
      expect(web3Service.connect).toHaveBeenCalledWith('provider', undefined, undefined, true);
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

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(provider).toEqual(activeWalletProvider);
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
        const provider = await accountService.getActiveWalletProvider();

        expect(provider).toEqual('signer');
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

  describe('setUser', () => {});
  describe('setWalletsLabels', () => {});
});
/* eslint-enable @typescript-eslint/unbound-method */
