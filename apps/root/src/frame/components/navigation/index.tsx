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
  // LangIcon,
  SupportIcon,
  OptionsMenuOption,
  MoonIcon,
  SunIcon,
  // OptionsMenu,
  OptionsMenuOptionType,
  Section,
  DollarSquareIcon,
  useSnackbar,
  TrashIcon,
} from 'ui-library';
import { toggleHideSmallBalances, toggleTheme } from '@state/config/actions';
import { useHideSmallBalances, useThemeMode } from '@state/config/hooks';
// import useSelectedLanguage from '@hooks/useSelectedLanguage';
// import { SupportedLanguages } from '@constants/lang';
// import useChangeLanguage from '@hooks/useChangeLanguage';
import useTrackEvent from '@hooks/useTrackEvent';

const helpOptions = [
  {
    label: defineMessage({ description: 'audits', defaultMessage: 'Audits' }),
    Icon: AuditsIcon,
    url: 'https://github.com/balmy-protocol/dca-v2-core/tree/main/audits',
  },
  {
    label: defineMessage({ description: 'bugBounty', defaultMessage: 'Bug bounty' }),
    Icon: BugBountyIcon,
    url: 'https://immunefi.com/bounty/meanfinance/',
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

const SECRET_MENU_CLICKS = 6;
const Navigation = ({ children }: React.PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const currentRoute = useCurrentRoute();
  const intl = useIntl();
  const mode = useThemeMode();
  const hideSmallBalances = useHideSmallBalances();
  const [secretMenuClicks, setSecretMenuClicks] = React.useState(0);
  const snackbar = useSnackbar();
  // const selectedLanguage = useSelectedLanguage();
  // const changeLanguage = useChangeLanguage();
  const trackEvent = useTrackEvent();

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
    }
  }, []);

  const onSectionClick = useCallback(
    (section: Section) => {
      if (
        section.type === SectionType.divider ||
        section.key === currentRoute ||
        section.activeKeys?.includes(currentRoute)
      ) {
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
      if (menuClicksDiff < 4 && newSecretMenuClicks !== SECRET_MENU_CLICKS) {
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

  const onToggleHideSmallBalances = () => {
    trackEvent('Main - Click hide balances < 1 USD', { oldValue: hideSmallBalances });
    dispatch(toggleHideSmallBalances());
  };

  // const onChangeLanguage = (newLang: string) => {
  //   changeLanguage(newLang as SupportedLanguages);
  //   trackEvent('Main - Change language', { newLang });
  // };

  const onClearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const onClickBrandLogo = () => {
    dispatch(changeRoute('home'));
    pushToHistory(`/home`);
    trackEvent('Main - Click brand logo');
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
        // {
        //   label: SUPPORTED_LANGUAGES_STRING[selectedLanguage],
        //   Icon: LangIcon,
        //   onClick: () => {},
        //   control: (
        //     <OptionsMenu
        //       mainDisplay={<></>}
        //       options={(
        //         Object.keys(SupportedLanguages).filter(
        //           (sl) => SupportedLanguages[sl as keyof typeof SupportedLanguages] != selectedLanguage
        //         ) as Array<keyof typeof SupportedLanguages>
        //       ).map((lang) => ({
        //         label: SUPPORTED_LANGUAGES_STRING[SupportedLanguages[lang]],
        //         onClick: () => onChangeLanguage(SupportedLanguages[lang]),
        //         type: OptionsMenuOptionType.option,
        //       }))}
        //     />
        //   ),
        //   closeOnClick: false,
        //   type: OptionsMenuOptionType.option,
        // },
        {
          label: intl.formatMessage(
            defineMessage({ description: 'hideSmallBalances', defaultMessage: 'Hide balances < 1 USD' })
          ),
          Icon: DollarSquareIcon,
          onClick: onToggleHideSmallBalances,
          control: <Switch checked={hideSmallBalances} />,
          closeOnClick: false,
          type: OptionsMenuOptionType.option,
        },
        // @ts-expect-error Something weird going on with ts types on color prop
        ...(SECRET_MENU_CLICKS === secretMenuClicks
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
          : []),
      ]}
      helpOptions={helpOptions.map<OptionsMenuOption>(({ Icon, label, url }) => ({
        Icon,
        label: intl.formatMessage(label),
        onClick: () => openExternalLink(url),
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
