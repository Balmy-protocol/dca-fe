import ActiveSignSelector from '@common/components/active-sign-in-selector';
import ProfileSelector from '@common/components/profile-selector';
import {
  DASHBOARD_ROUTE,
  DCA_ROUTE,
  DCA_CREATE_ROUTE,
  DCA_POSITIONS_ROUTE,
  SWAP_ROUTE,
  TRANSFER_ROUTE,
  HOME_ROUTES,
} from '@constants/routes';
import { useAppDispatch } from '@hooks/state';
import useActiveWallet from '@hooks/useActiveWallet';
import usePushToHistory from '@hooks/usePushToHistory';
import { changeRoute } from '@state/tabs/actions';
import { useCurrentRoute } from '@state/tabs/hooks';
import React, { useCallback } from 'react';
import { defineMessage, useIntl } from 'react-intl';
import {
  Switch,
  Navigation as NavigationUI,
  SectionType,
  AuditsIcon,
  BugBountyIcon,
  DocsIcon,
  HelpIcon,
  SupportIcon,
  IconMenuOption,
  MoonIcon,
  SunIcon,
  WalletIcon,
  IconMenu,
  IconMenuOptionType,
} from 'ui-library';
import ConnectWalletButton from '../connect-wallet';
import { toggleTheme } from '@state/config/actions';
import { useThemeMode } from '@state/config/hooks';
import useSelectedLanguage from '@hooks/useSelectedLanguage';
import { SUPPORTED_LANGUAGES_STRING, SupportedLanguages } from '@constants/lang';
import useChangeLanguage from '@hooks/useChangeLanguage';

const helpOptions = [
  {
    label: defineMessage({ description: 'audits', defaultMessage: 'Audits' }),
    icon: <AuditsIcon />,
    url: 'https://github.com/Mean-Finance/dca-v2-core/tree/main/audits',
  },
  {
    label: defineMessage({ description: 'bugBounty', defaultMessage: 'Bug bounty' }),
    icon: <BugBountyIcon />,
    url: 'https://immunefi.com/bounty/meanfinance/',
  },
  {
    label: defineMessage({ description: 'docs', defaultMessage: 'Docs' }),
    icon: <DocsIcon />,
    url: 'https://docs.mean.finance',
  },
  {
    label: defineMessage({ description: 'faq', defaultMessage: 'FAQ' }),
    icon: <HelpIcon />,
    url: 'https://mean.finance/faq',
  },
  {
    label: defineMessage({ description: 'contact&Support', defaultMessage: 'Contact & Support' }),
    icon: <SupportIcon />,
    url: 'http://discord.mean.finance',
  },
];
const Navigation = ({
  children,
  isLoading,
  openNewAccountModal,
}: React.PropsWithChildren<{ isLoading: boolean; openNewAccountModal: () => void }>) => {
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const currentRoute = useCurrentRoute();
  const intl = useIntl();
  const activeWallet = useActiveWallet();
  const mode = useThemeMode();
  const selectedLanguage = useSelectedLanguage();
  const changeLanguage = useChangeLanguage();

  React.useEffect(() => {
    if (HOME_ROUTES.includes(location.pathname)) {
      dispatch(changeRoute('home'));
      pushToHistory('/');
    } else if (location.pathname === '/create') {
      dispatch(changeRoute('create'));
      pushToHistory('/create');
    } else if (location.pathname === '/positions') {
      dispatch(changeRoute('positions'));
      pushToHistory('/positions');
    } else if (location.pathname === '/swap') {
      dispatch(changeRoute('swap'));
      pushToHistory('/swap');
    } else if (location.pathname === '/transfer') {
      dispatch(changeRoute('transfer'));
      pushToHistory('/transfer');
    } else if (location.pathname === '/settings') {
      dispatch(changeRoute('settings'));
      pushToHistory('/settings');
    }
  }, []);

  const onSectionClick = useCallback(
    (key: string) => {
      dispatch(changeRoute(key));
      pushToHistory(`/${key}`);
    },
    [dispatch, pushToHistory]
  );

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  const onChangeThemeMode = () => {
    dispatch(toggleTheme());
  };

  const onChangeLanguage = (newLang: string) => {
    changeLanguage(newLang as SupportedLanguages);
  };

  return (
    <NavigationUI
      sections={[
        {
          ...DASHBOARD_ROUTE,
          label: intl.formatMessage(DASHBOARD_ROUTE.label),
          type: SectionType.link,
        },
        {
          ...DCA_ROUTE,
          label: intl.formatMessage(DCA_ROUTE.label),
          type: SectionType.link,
          options: [
            { ...DCA_CREATE_ROUTE, label: intl.formatMessage(DCA_CREATE_ROUTE.label), type: SectionType.link },
            { ...DCA_POSITIONS_ROUTE, label: intl.formatMessage(DCA_POSITIONS_ROUTE.label), type: SectionType.link },
          ],
        },
        { ...SWAP_ROUTE, label: intl.formatMessage(SWAP_ROUTE.label), type: SectionType.link },
        { ...TRANSFER_ROUTE, label: intl.formatMessage(TRANSFER_ROUTE.label), type: SectionType.link },
      ]}
      selectedSection={currentRoute}
      onSectionClick={onSectionClick}
      settingsOptions={[
        {
          label: intl.formatMessage(defineMessage({ description: 'theme', defaultMessage: 'Theme' })),
          icon: mode === 'dark' ? <MoonIcon /> : <SunIcon />,
          onClick: onChangeThemeMode,
          control: <Switch checked={mode === 'dark'} />,
          closeOnClick: false,
          type: IconMenuOptionType.option,
        },
        {
          label: SUPPORTED_LANGUAGES_STRING[selectedLanguage],
          icon: <WalletIcon />,
          onClick: () => {},
          control: (
            <IconMenu
              mainDisplay={<></>}
              options={(Object.keys(SupportedLanguages) as Array<keyof typeof SupportedLanguages>).map((lang) => ({
                label: SUPPORTED_LANGUAGES_STRING[SupportedLanguages[lang]],
                onClick: () => onChangeLanguage(SupportedLanguages[lang]),
                type: IconMenuOptionType.option,
              }))}
            />
          ),
          closeOnClick: false,
          type: IconMenuOptionType.option,
        },
      ]}
      helpOptions={helpOptions.map<IconMenuOption>(({ icon, label, url }) => ({
        icon,
        label: intl.formatMessage(label),
        onClick: () => openExternalLink(url),
        closeOnClick: false,
        type: IconMenuOptionType.option,
      }))}
      extraHeaderTools={
        !activeWallet?.address && !isLoading ? (
          <ConnectWalletButton />
        ) : (
          <>
            <ProfileSelector openNewAccountModal={openNewAccountModal} />
            <ActiveSignSelector />
          </>
        )
      }
    >
      {children}
    </NavigationUI>
  );
};

export default Navigation;
