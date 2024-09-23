import {
  DASHBOARD_ROUTE,
  DCA_ROUTE,
  SWAP_ROUTE,
  TRANSFER_ROUTE,
  HOME_ROUTES,
  DCA_CREATE_ROUTE,
} from '@constants/routes';
import { useAppDispatch } from '@hooks/state';
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
  LangIcon,
  SupportIcon,
  OptionsMenuOption,
  MoonIcon,
  SunIcon,
  OptionsMenu,
  OptionsMenuOptionType,
  Section,
  useSnackbar,
  TrashIcon,
  MovingStarIcon,
} from 'ui-library';
// import { setSwitchActiveWalletOnConnectionThunk, toggleTheme } from '@state/config/actions';
// import { useSwitchActiveWalletOnConnection, useThemeMode } from '@state/config/hooks';
import { toggleTheme } from '@state/config/actions';
import { useThemeMode } from '@state/config/hooks';
import useSelectedLanguage from '@hooks/useSelectedLanguage';
import { SUPPORTED_LANGUAGES_STRING, SupportedLanguages } from '@constants/lang';
import useChangeLanguage from '@hooks/useChangeLanguage';
import useTrackEvent from '@hooks/useTrackEvent';

const helpOptions = [
  {
    label: defineMessage({ description: 'audits', defaultMessage: 'Audits' }),
    Icon: AuditsIcon,
    url: 'https://github.com/balmy-protocol/dca-v2-core/tree/main/audits',
  },
  {
    label: defineMessage({ description: 'navigation.whats-new', defaultMessage: 'Whats new?' }),
    Icon: MovingStarIcon,
    customClassname: 'beamer-whats-new',
    onClick: () => {
      // @ts-expect-error we are not going to type beamer
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      if (window.Beamer) window.Beamer.show();
    },
    onRender: () => {
      // @ts-expect-error we are not going to type beamer
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      if (window.Beamer)
        // @ts-expect-error we are not going to type beamer
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        window.Beamer.update({
          product_id: 'CbBwHKDC68542', //DO NOT CHANGE: This is your product code on Beamer
          selector: '.beamer-whats-new',
          delay: 0,
          button: false,
        });
    },
  },
  {
    label: defineMessage({ description: 'bugBounty', defaultMessage: 'Bug bounty' }),
    Icon: BugBountyIcon,
    url: 'https://immunefi.com/bounty/balmy',
  },
  {
    label: defineMessage({ description: 'docs', defaultMessage: 'Docs' }),
    Icon: DocsIcon,
    url: 'https://docs.balmy.xyz',
  },
  {
    label: defineMessage({ description: 'contact&Support', defaultMessage: 'Contact & Support' }),
    Icon: SupportIcon,
    url: 'http://discord.balmy.xyz',
  },
];

type SupportedLanguagesKey = keyof typeof SUPPORTED_LANGUAGES_STRING;

const ENABLED_TRANSLATIONS = (JSON.parse(process.env.ENABLED_TRANSLATIONS || '[]') as SupportedLanguagesKey[]).concat([
  SupportedLanguages.english,
]);

const SECRET_MENU_CLICKS = 6;
const Navigation = ({ children }: React.PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const currentRoute = useCurrentRoute();
  const intl = useIntl();
  const mode = useThemeMode();
  const [secretMenuClicks, setSecretMenuClicks] = React.useState(
    process.env.NODE_ENV === 'development' ? SECRET_MENU_CLICKS : 0
  );
  const snackbar = useSnackbar();
  const selectedLanguage = useSelectedLanguage();
  const changeLanguage = useChangeLanguage();
  const trackEvent = useTrackEvent();
  // const switchActiveWalletOnConnection = useSwitchActiveWalletOnConnection();

  React.useEffect(() => {
    if (HOME_ROUTES.includes(location.pathname)) {
      dispatch(changeRoute('home'));
    } else if (location.pathname.startsWith('/history')) {
      dispatch(changeRoute('history'));
    } else if (location.pathname.startsWith('/create')) {
      dispatch(changeRoute('create'));
    } else if (location.pathname.startsWith('/positions')) {
      dispatch(changeRoute('positions'));
    } else if (location.pathname.startsWith('/swap')) {
      dispatch(changeRoute('swap'));
    } else if (location.pathname.startsWith('/transfer')) {
      dispatch(changeRoute('transfer'));
    } else if (location.pathname.startsWith('/settings')) {
      dispatch(changeRoute('settings'));
    } else if (location.pathname.startsWith('/token')) {
      dispatch(changeRoute('token'));
    }
  }, []);

  const onSectionClick = useCallback(
    (section: Section, openInNewTab?: boolean) => {
      if (section.type === SectionType.divider || section.key === currentRoute) {
        return;
      }
      if (openInNewTab) {
        window.open(`/${section.key}`, '_blank');
        return;
      }
      dispatch(changeRoute(section.key));
      pushToHistory(`/${section.key}`);
      trackEvent('Main - Changed active app', { newSection: section.key, oldSection: currentRoute });
    },
    [dispatch, pushToHistory, currentRoute]
  );

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
    trackEvent('Main - Open external link', { url });
  };

  const onChangeThemeMode = () => {
    trackEvent('Main - Click brand logo', { oldTheme: mode });
    dispatch(toggleTheme());

    if (secretMenuClicks < SECRET_MENU_CLICKS) {
      const newSecretMenuClicks = secretMenuClicks + 1;
      setSecretMenuClicks(newSecretMenuClicks);

      const menuClicksDiff = SECRET_MENU_CLICKS - newSecretMenuClicks;
      if (menuClicksDiff < 3 && newSecretMenuClicks !== SECRET_MENU_CLICKS) {
        snackbar.enqueueSnackbar({
          variant: 'info',
          message: intl.formatMessage(
            defineMessage({
              description: 'secretMenuMessage',
              defaultMessage: 'You are {clicks} theme changes away from opening the secret menu',
            }),
            { clicks: menuClicksDiff }
          ),
        });
      }

      if (SECRET_MENU_CLICKS === newSecretMenuClicks) {
        snackbar.enqueueSnackbar({
          variant: 'info',
          message: intl.formatMessage(
            defineMessage({ description: 'secretMenuEnabledMessage', defaultMessage: 'Secret menu is now enabled!' })
          ),
        });
      }
    }
  };

  // const onToggleShowSmallBalances = () => {
  //   trackEvent('Main - Click show balances < 1 USD', { oldValue: showSmallBalances });
  //   dispatch(toggleShowSmallBalances());
  // };

  // const onSetSwitchActiveWalletOnConnection = () => {
  //   trackEvent('Main - Click smart wallet switch', { oldValue: switchActiveWalletOnConnection });
  //   void dispatch(setSwitchActiveWalletOnConnectionThunk(!switchActiveWalletOnConnection));
  // };

  const onChangeLanguage = (newLang: string) => {
    changeLanguage(newLang as SupportedLanguages);
    trackEvent('Main - Change language', { newLang });
  };

  const onClearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const onClickBrandLogo = () => {
    dispatch(changeRoute('home'));
    pushToHistory(`/home`);
    trackEvent('Main - Click brand logo');
  };

  const secretMenuOptions: OptionsMenuOption[] =
    SECRET_MENU_CLICKS === secretMenuClicks
      ? [
          {
            label: intl.formatMessage(
              defineMessage({ description: 'secretMenuTitle', defaultMessage: 'Delete local data and reload' })
            ),
            Icon: TrashIcon,
            onClick: onClearLocalStorage,
            type: OptionsMenuOptionType.option,
            color: 'error',
          },
        ]
      : [];

  const languageOptions: OptionsMenuOption[] =
    ENABLED_TRANSLATIONS.length > 1
      ? [
          {
            label: SUPPORTED_LANGUAGES_STRING[selectedLanguage],
            Icon: LangIcon,
            onClick: () => {},
            control: (
              <OptionsMenu
                mainDisplay={<></>}
                options={ENABLED_TRANSLATIONS.filter((lang) => lang !== selectedLanguage).map((lang) => ({
                  label: SUPPORTED_LANGUAGES_STRING[lang],
                  onClick: () => onChangeLanguage(lang),
                  type: OptionsMenuOptionType.option,
                }))}
              />
            ),
            closeOnClick: false,
            type: OptionsMenuOptionType.option,
          },
        ]
      : [];

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
          activeKeys: [DCA_ROUTE.key, DCA_CREATE_ROUTE.key],
        },
        { ...SWAP_ROUTE, label: intl.formatMessage(SWAP_ROUTE.label), type: SectionType.link },
        { ...TRANSFER_ROUTE, label: intl.formatMessage(TRANSFER_ROUTE.label), type: SectionType.link },
      ]}
      selectedSection={currentRoute}
      onSectionClick={onSectionClick}
      settingsOptions={[
        {
          label: intl.formatMessage(defineMessage({ description: 'theme', defaultMessage: 'Theme' })),
          Icon: mode === 'dark' ? MoonIcon : SunIcon,
          onClick: onChangeThemeMode,
          control: <Switch checked={mode === 'dark'} />,
          closeOnClick: false,
          type: OptionsMenuOptionType.option,
        },
        ...languageOptions,
        // {
        //   label: intl.formatMessage(
        //     defineMessage({ description: 'showSmallBalances', defaultMessage: 'Show balances < 1 USD' })
        //   ),
        //   Icon: DollarSquareIcon,
        //   onClick: onToggleShowSmallBalances,
        //   control: <Switch checked={showSmallBalances} />,
        //   closeOnClick: false,
        //   type: OptionsMenuOptionType.option,
        // },
        // {
        //   label: intl.formatMessage(
        //     defineMessage({
        //       description: 'navigation.settings.switchActiveWalletOnConnection',
        //       defaultMessage: 'Smart wallet switch',
        //     })
        //   ),
        //   // Icon: DollarSquareIcon,
        //   onClick: onSetSwitchActiveWalletOnConnection,
        //   control: <Switch checked={switchActiveWalletOnConnection} />,
        //   closeOnClick: false,
        //   type: OptionsMenuOptionType.option,
        // },
        ...secretMenuOptions,
      ]}
      helpOptions={helpOptions.map<OptionsMenuOption>(({ Icon, label, url, customClassname, onClick, onRender }) => ({
        Icon,
        label: intl.formatMessage(label),
        onClick: url ? () => openExternalLink(url) : onClick,
        onRender: onRender,
        customClassname,
        closeOnClick: false,
        type: OptionsMenuOptionType.option,
      }))}
      onClickBrandLogo={onClickBrandLogo}
    >
      {children}
    </NavigationUI>
  );
};

export default Navigation;
