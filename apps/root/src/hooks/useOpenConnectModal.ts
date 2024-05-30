import { useConnectModal } from '@rainbow-me/rainbowkit';
import React from 'react';
import useUser from './useUser';
import { UserStatus } from 'common-types';
import { defineMessage, useIntl } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import { useDisconnect } from 'wagmi';

const useOpenConnectModal = (showReconnectOptions?: boolean) => {
  const { openConnectModal: openRainbowConnectModal } = useConnectModal();
  const user = useUser();
  const intl = useIntl();
  const mode = useThemeMode();

  const openConnectModalCb = React.useCallback(() => {
    if (!openRainbowConnectModal) return;

    openRainbowConnectModal();

    setTimeout(() => {
      // Change the theme as much as we can;

      // Main container
      const container = document.querySelector(
        'div.iekbcc0.ju367v84.ju367v6d.ju367v6y.ju367v7j > div.iekbcc0.ju367va.ju367v14'
      );

      if (container) {
        container.className = `${container.className} rainBowKitContainer`;
      }

      const textsContainer = document.querySelector('div.iekbcc0.ju367v4.ju367vf0.ju367va.ju367v15.ju367v2m.ju367v2s');

      if (textsContainer) {
        textsContainer.className = `${textsContainer.className} rainBowKitTextsContainer ${mode}`;
        let loginText = defineMessage({
          defaultMessage: 'Log in with your wallet',
          description: 'RainbowLogInWithYourWallet',
        });
        let loginSubText = defineMessage({
          defaultMessage:
            "Log in with the first wallet you registered to access your account, including any other wallets and contacts you've added.",
          description: 'RainbowLogInWithYourWalletSubText',
        });
        let loginDisclaimer = defineMessage({
          defaultMessage: 'Logging in with a different wallet creates a new account without your existing data.',
          description: 'RainbowLogInDisclaimer',
        });
        let loginWalletTitle = defineMessage({
          defaultMessage: 'Select your Wallet to Log In.',
          description: 'RainbowWalletTitle',
        });

        if (showReconnectOptions) {
          loginText = defineMessage({
            defaultMessage: 'Switch to Correct Wallet',
            description: 'RainbowReconnectCorrectWallet',
          });
          loginSubText = defineMessage({
            defaultMessage: 'Please switch to one of the following addresses in your wallet provider:',
            description: 'RainbowReconnectNewWalletSubText',
          });
          loginDisclaimer = defineMessage({
            defaultMessage: 'Reconnect to be able to operate with your Balmy account!',
            description: 'RainbowReconnectWalletDisclaimer',
          });
          loginWalletTitle = defineMessage({
            defaultMessage: 'Select your Wallet to reconnect to.',
            description: 'RainbowReconnectWalletTitle',
          });
        } else if (user?.status === UserStatus.loggedIn) {
          loginText = defineMessage({
            defaultMessage: 'Link a new wallet',
            description: 'RainbowLinkANewWallet',
          });
          loginSubText = defineMessage({
            defaultMessage: 'Connect another wallet to your already logged-in wallet',
            description: 'RainbowLinkANewWalletSubText',
          });
          loginDisclaimer = defineMessage({
            defaultMessage: 'Linking wallets allows you to track more than one!',
            description: 'RainbowLinkWalletDisclaimer',
          });
          loginWalletTitle = defineMessage({
            defaultMessage: 'Select your Wallet to link it.',
            description: 'RainbowLinkWalletTitle',
          });
        }

        const titleContainer = document.querySelector('[data-testid="rk-connect-header-label"]');

        if (titleContainer) {
          titleContainer.innerHTML = intl.formatMessage(loginWalletTitle);
        }

        textsContainer.innerHTML = `
          <div class="rainBowKitTextsTitleContainer">
            <div>
              ${
                mode === 'dark'
                  ? '<svg class="MuiSvgIcon-root-ksXwJf gbiJCy MuiSvgIcon-root MuiSvgIcon-fontSizeMedium" focusable="false" aria-hidden="true" viewBox="0 0 112 32" style="font-size: 110px; height: 32px;"><g clip-path="url(#clip0_4513_4367)"><path fill-rule="evenodd" clip-rule="evenodd" d="M41.8513 5.19141H33.043V25.9476H42.3783C44.2899 25.9476 45.8407 25.411 47.0307 24.3375C48.2206 23.264 48.8155 21.8882 48.8155 20.2098C48.8155 18.9996 48.4741 17.9458 47.7915 17.0481C47.1086 16.1504 46.2114 15.555 45.0994 15.2623C46.0162 14.9304 46.7576 14.3744 47.3232 13.5937C47.8888 12.7935 48.1717 11.8567 48.1717 10.7832C48.1717 9.12423 47.6061 7.77766 46.4747 6.74326C45.3435 5.70887 43.8023 5.19167 41.8515 5.19167L41.8513 5.19141ZM41.3833 13.9739H36.3812V8.91283C36.3812 8.84423 36.3639 8.77642 36.3312 8.71606C36.2592 8.58363 36.1206 8.5012 35.9699 8.5012H35.8808C35.7478 8.5012 35.6247 8.43047 35.5574 8.31533L35.4271 8.09196H41.2953C42.3488 8.09196 43.1678 8.44057 43.7531 8.96734C44.3577 9.4747 44.6601 10.1775 44.6601 11.0752C44.6601 11.9729 44.3676 12.6561 43.7823 13.1831C43.197 13.7101 42.3975 13.9736 41.3833 13.9736V13.9739ZM41.7635 22.9614H36.3812V16.9308H41.8805C42.9341 16.9308 43.7531 17.2138 44.3383 17.7799C44.943 18.3263 45.2454 19.0581 45.2454 19.9755C45.2454 20.8929 44.9233 21.6247 44.2798 22.1712C43.6555 22.6982 42.8168 22.9614 41.7635 22.9614Z" fill="#FBFAFF"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M53.1503 25.6809C53.9693 26.0322 54.896 26.2079 55.9299 26.2079C56.3311 26.2079 56.7007 26.1856 57.0387 26.1412C58.6315 25.992 60.4809 24.9382 61.2909 24.0809L60.846 25.0281V26.0367H63.3618V16.4594C63.3618 14.7028 62.8252 13.3464 61.7525 12.3901C60.6796 11.4337 59.2067 10.9555 57.3341 10.9555C56.1248 10.9555 55.0909 11.1507 54.2326 11.5411C54.0664 11.6169 53.9058 11.6972 53.7518 11.7825C52.5422 12.4521 51.6091 13.6793 51.5636 15.0617H54.2461C54.4277 14.7384 54.6575 14.4528 54.9348 14.205C55.4813 13.717 56.2514 13.4732 57.3049 13.4732C58.3584 13.4732 59.1383 13.7269 59.6457 14.2342C60.1531 14.7416 60.4065 15.4149 60.4065 16.2541V17.1909H56.0176C54.9641 17.1909 54.0182 17.3568 53.1793 17.6887C52.36 18.0205 51.7064 18.5183 51.219 19.1818C50.7507 19.8258 50.5167 20.665 50.5167 21.6409C50.5167 22.6168 50.7507 23.4462 51.219 24.1293C51.7067 24.8124 52.3504 25.3296 53.1503 25.6809ZM59.2944 22.695C58.5533 23.3781 57.5777 23.7195 56.3684 23.7195V23.7198C55.4909 23.7198 54.7982 23.5246 54.2911 23.1343C53.7837 22.7439 53.5303 22.2171 53.5303 21.5534C53.5303 20.8897 53.7741 20.3922 54.2618 20.0603C54.7498 19.7091 55.3933 19.5333 56.1931 19.5333H60.4065V19.8261C60.4065 21.036 60.0358 21.9924 59.2944 22.695Z" fill="#FBFAFF"></path><path d="M76.1423 25.9862H72.7775V11.8426H76.0253V12.3856C76.0253 12.9198 75.7286 13.4102 75.2555 13.6577H75.6041C75.8639 13.6577 76.099 13.5133 76.2492 13.3014C76.6274 12.7677 77.1379 12.3399 77.7809 12.0184C78.5805 11.628 79.4 11.4329 80.2387 11.4329C81.1944 11.4329 82.053 11.6474 82.8135 12.0769C83.5743 12.5063 84.1399 13.1307 84.5108 13.9505C85.5056 12.2721 87.0466 11.4329 89.1337 11.4329C90.538 11.4329 91.7279 11.8915 92.7033 12.8087C93.6789 13.7261 94.1663 15.0726 94.1663 16.8487V25.9864H90.8895V17.4049C90.8895 16.5266 90.6552 15.8241 90.1872 15.2971C89.7386 14.7506 89.0555 14.4773 88.1389 14.4773C87.2223 14.4773 86.5493 14.7799 86.0028 15.3848C85.4567 15.9898 85.1836 16.7412 85.1836 17.6389V25.9862H81.848V17.4047C81.848 16.5264 81.614 15.8238 81.1457 15.2968C80.6971 14.7504 80.014 14.477 79.0974 14.477C78.1808 14.477 77.4783 14.7796 76.9324 15.3846C76.4056 15.9701 76.1423 16.7216 76.1423 17.6387V25.9862Z" fill="#FBFAFF"></path><path d="M107.351 11.6329H110.992L105.964 25.9192C104.856 29.7542 103.673 31.9543 101.098 31.9543H98.5773V29.1981H99.5723C100.625 29.1981 101.386 28.9931 101.884 27.8516L102.469 25.9865H100.413L94.7064 11.6329H98.3478L102.674 22.92H103.376L107.351 11.6329Z" fill="#FBFAFF"></path><path d="M66.5186 5.21668H69.6348V26.1412H66.5186V5.21668Z" fill="#FBFAFF"></path><path d="M6.40082 9.26006H11.4289C12.3152 9.26006 13.1917 9.45869 13.9862 9.85171C17.0423 11.3642 18.4753 14.6107 17.5635 17.8455C17.4436 18.2718 17.2723 18.6826 17.0553 19.0687C15.4588 21.9073 12.2982 23.1922 9.16391 22.2655C8.8036 22.1589 8.45552 22.0145 8.12552 21.835C5.8448 20.5932 4.53945 18.3529 4.53945 15.9116V15.1404C3.04556 15.1404 1.63729 14.5844 0.550781 13.5694V16.5609C0.550781 19.5567 2.67807 23.6272 6.06524 25.2972C10.8804 27.6709 15.7045 26.4427 18.7083 23.4368C20.6332 21.5111 21.8237 18.8504 21.8237 15.9118C21.8237 12.9732 20.6332 10.3125 18.7083 8.38681C16.7836 6.46081 14.1245 5.26953 11.1872 5.26953H6.38886L6.40082 9.26032V9.26006Z" fill="#07F8BD"></path><path d="M4.53945 3.96967V13.2781C2.33664 13.2781 0.550781 11.492 0.550781 9.28895V-0.0195312C1.65218 -0.0195312 2.64935 0.426933 3.37103 1.14915C4.09298 1.87083 4.53945 2.86826 4.53945 3.96993V3.96967Z" fill="#07F8BD"></path></g><defs><clipPath id="clip0_4513_4367"><rect width="110.56" height="32" fill="white" transform="translate(0.5)"></rect></clipPath></defs></svg>'
                  : '<svg class="MuiSvgIcon-root-ksXwJf kxQMHp MuiSvgIcon-root MuiSvgIcon-fontSizeMedium" focusable="false" aria-hidden="true" viewBox="0 0 111 32" style="font-size: 110px; height: 32px;"><g clip-path="url(#clip0_4513_4081)"><path fill-rule="evenodd" clip-rule="evenodd" d="M41.4763 5.18945H32.668V25.9457H42.0033C43.9149 25.9457 45.4657 25.4091 46.6557 24.3356C47.8456 23.2621 48.4405 21.8863 48.4405 20.2078C48.4405 18.9977 48.0991 17.9439 47.4165 17.0462C46.7336 16.1484 45.8364 15.5531 44.7244 15.2603C45.6412 14.9284 46.3826 14.3724 46.9482 13.5917C47.5138 12.7916 47.7967 11.8548 47.7967 10.7813C47.7967 9.12228 47.2311 7.7757 46.0997 6.74131C44.9685 5.70692 43.4273 5.18972 41.4765 5.18972L41.4763 5.18945ZM41.0083 13.972H36.0062V8.91088C36.0062 8.84227 35.9889 8.77447 35.9562 8.7141C35.8842 8.58168 35.7456 8.49925 35.5949 8.49925H35.5058C35.3728 8.49925 35.2497 8.42852 35.1824 8.31338L35.0521 8.09001H40.9202C41.9738 8.09001 42.7928 8.43862 43.3781 8.96539C43.9827 9.47275 44.2851 10.1756 44.2851 11.0733C44.2851 11.971 43.9926 12.6541 43.4073 13.1811C42.822 13.7082 42.0225 13.9717 41.0083 13.9717V13.972ZM41.3885 22.9595H36.0062V16.9289H41.5055C42.5591 16.9289 43.3781 17.2118 43.9633 17.7779C44.568 18.3244 44.8704 19.0562 44.8704 19.9736C44.8704 20.891 44.5483 21.6228 43.9048 22.1692C43.2805 22.6962 42.4418 22.9595 41.3885 22.9595Z" fill="#312049"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M52.7753 25.6789C53.5943 26.0302 54.521 26.206 55.5549 26.206C55.9561 26.206 56.3257 26.1836 56.6637 26.1392C58.2565 25.9901 60.1059 24.9363 60.9159 24.079L60.471 25.0261V26.0347H62.9868V16.4574C62.9868 14.7008 62.4502 13.3444 61.3775 12.3882C60.3046 11.4317 58.8317 10.9536 56.9591 10.9536C55.7498 10.9536 54.7159 11.1488 53.8576 11.5391C53.6914 11.6149 53.5308 11.6952 53.3768 11.7806C52.1672 12.4501 51.2341 13.6773 51.1886 15.0598H53.8711C54.0527 14.7364 54.2825 14.4509 54.5598 14.203C55.1063 13.7151 55.8764 13.4712 56.9299 13.4712C57.9834 13.4712 58.7633 13.7249 59.2707 14.2323C59.7781 14.7396 60.0315 15.4129 60.0315 16.2521V17.1889H55.6426C54.5891 17.1889 53.6432 17.3549 52.8043 17.6867C51.985 18.0186 51.3314 18.5164 50.844 19.1798C50.3757 19.8239 50.1417 20.6631 50.1417 21.639C50.1417 22.6149 50.3757 23.4442 50.844 24.1274C51.3317 24.8105 51.9754 25.3277 52.7753 25.6789ZM58.9194 22.693C58.1783 23.3762 57.2027 23.7176 55.9934 23.7176V23.7179C55.1158 23.7179 54.4232 23.5227 53.9161 23.1323C53.4087 22.742 53.1553 22.2152 53.1553 21.5515C53.1553 20.8878 53.3991 20.3902 53.8868 20.0584C54.3748 19.7071 55.0183 19.5314 55.8181 19.5314H60.0315V19.8241C60.0315 21.034 59.6608 21.9905 58.9194 22.693Z" fill="#312049"></path><path d="M75.7673 25.9842H72.4025V11.8407H75.6503V12.3837C75.6503 12.9179 75.3536 13.4082 74.8805 13.6558H75.2291C75.4889 13.6558 75.724 13.5114 75.8742 13.2995C76.2524 12.7658 76.7629 12.3379 77.4059 12.0164C78.2055 11.6261 79.025 11.4309 79.8637 11.4309C80.8194 11.4309 81.678 11.6455 82.4385 12.0749C83.1993 12.5044 83.7649 13.1287 84.1358 13.9485C85.1306 12.2701 86.6715 11.4309 88.7587 11.4309C90.163 11.4309 91.3529 11.8896 92.3283 12.8067C93.3039 13.7241 93.7913 15.0707 93.7913 16.8467V25.9845H90.5145V17.403C90.5145 16.5247 90.2802 15.8222 89.8122 15.2951C89.3636 14.7487 88.6805 14.4753 87.7639 14.4753C86.8473 14.4753 86.1743 14.7779 85.6278 15.3829C85.0817 15.9878 84.8086 16.7393 84.8086 17.637V25.9842H81.473V17.4027C81.473 16.5244 81.239 15.8219 80.7707 15.2949C80.3221 14.7484 79.639 14.475 78.7224 14.475C77.8058 14.475 77.1033 14.7777 76.5574 15.3826C76.0306 15.9681 75.7673 16.7196 75.7673 17.6367V25.9842Z" fill="#312049"></path><path d="M106.976 11.6309H110.617L105.589 25.9172C104.481 29.7522 103.298 31.9524 100.723 31.9524H98.2023V29.1962H99.1973C100.25 29.1962 101.011 28.9912 101.509 27.8496L102.094 25.9845H100.038L94.3314 11.6309H97.9728L102.299 22.918H103.001L106.976 11.6309Z" fill="#312049"></path><path d="M66.1436 5.21473H69.2598V26.1393H66.1436V5.21473Z" fill="#312049"></path><path d="M6.02582 9.2581H11.0539C11.9402 9.2581 12.8167 9.45674 13.6112 9.84976C16.6673 11.3623 18.1003 14.6088 17.1885 17.8436C17.0686 18.2698 16.8973 18.6807 16.6803 19.0668C15.0838 21.9054 11.9232 23.1902 8.78891 22.2635C8.4286 22.1569 8.08052 22.0125 7.75052 21.833C5.4698 20.5912 4.16445 18.3509 4.16445 15.9096V15.1385C2.67056 15.1385 1.26229 14.5824 0.175781 13.5675V16.559C0.175781 19.5547 2.30307 23.6253 5.69024 25.2952C10.5054 27.669 15.3295 26.4407 18.3333 23.4349C20.2582 21.5092 21.4487 18.8485 21.4487 15.9099C21.4487 12.9713 20.2582 10.3106 18.3333 8.38485C16.4086 6.45886 13.7495 5.26758 10.8122 5.26758H6.01386L6.02582 9.25837V9.2581Z" fill="#791aff"></path><path d="M4.16445 3.96771V13.2762C1.96164 13.2762 0.175781 11.4901 0.175781 9.287V-0.0214844C1.27718 -0.0214844 2.27435 0.42498 2.99603 1.14719C3.71798 1.86888 4.16445 2.86631 4.16445 3.96798V3.96771Z" fill="#791aff"></path></g><defs><clipPath id="clip0_4513_4081"><rect width="110.56" height="32" fill="white" transform="translate(0.125)"></rect></clipPath></defs></svg>'
              }
            </div>
            <div class="rainBowKitTextsTitle">
              ${intl.formatMessage(loginText)}
            </div>
            <div class="rainBowKitTextsSubtitle">
              ${intl.formatMessage(loginSubText)}
            </div>
          </div>
          <div class="rainBowKitTextsCaptionContainer">
            <div class="rainBowKitTextsCaption">
              ${intl.formatMessage(loginDisclaimer)}
            </div>
            <div class="rainBowKitTextsSubtitle">
            </div>
          </div>
        `;
      }
    }, 100);
  }, [openRainbowConnectModal, user?.status, showReconnectOptions]);

  const { disconnect } = useDisconnect({
    onSettled() {
      openConnectModalCb();
    },
  });

  const openConnectModal = React.useCallback(() => {
    disconnect();
    openConnectModalCb();
  }, [openConnectModalCb, disconnect]);

  return React.useMemo(
    () => ({
      openConnectModal,
      disconnect,
    }),
    [openConnectModal, disconnect]
  );
};

export default useOpenConnectModal;
