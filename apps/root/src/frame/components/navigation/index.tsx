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
  HelpIcon,
  LangIcon,
  SupportIcon,
  OptionsMenuOption,
  MoonIcon,
  SunIcon,
  OptionsMenu,
  OptionsMenuOptionType,
  Section,
} from 'ui-library';
import { toggleTheme } from '@state/config/actions';
import { useThemeMode } from '@state/config/hooks';
import useSelectedLanguage from '@hooks/useSelectedLanguage';
import { SUPPORTED_LANGUAGES_STRING, SupportedLanguages } from '@constants/lang';
import useChangeLanguage from '@hooks/useChangeLanguage';

const helpOptions = [
  {
    label: defineMessage({ description: 'audits', defaultMessage: 'Audits' }),
    Icon: AuditsIcon,
    url: 'https://github.com/Mean-Finance/dca-v2-core/tree/main/audits',
  },
  {
    label: defineMessage({ description: 'bugBounty', defaultMessage: 'Bug bounty' }),
    Icon: BugBountyIcon,
    url: 'https://immunefi.com/bounty/meanfinance/',
  },
  {
    label: defineMessage({ description: 'docs', defaultMessage: 'Docs' }),
    Icon: DocsIcon,
    url: 'https://docs.mean.finance',
  },
  {
    label: defineMessage({ description: 'faq', defaultMessage: 'FAQ' }),
    Icon: HelpIcon,
    url: 'https://mean.finance/faq',
  },
  {
    label: defineMessage({ description: 'contact&Support', defaultMessage: 'Contact & Support' }),
    Icon: SupportIcon,
    url: 'http://discord.mean.finance',
  },
];
const Navigation = ({ children }: React.PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const currentRoute = useCurrentRoute();
  const intl = useIntl();
  const mode = useThemeMode();
  const selectedLanguage = useSelectedLanguage();
  const changeLanguage = useChangeLanguage();

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
    },
    [dispatch, pushToHistory, currentRoute]
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

  const onClickBrandLogo = () => {
    dispatch(changeRoute('home'));
    pushToHistory(`/home`);
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
        {
          label: SUPPORTED_LANGUAGES_STRING[selectedLanguage],
          Icon: LangIcon,
          onClick: () => {},
          control: (
            <OptionsMenu
              mainDisplay={<></>}
              options={(
                Object.keys(SupportedLanguages).filter(
                  (sl) => SupportedLanguages[sl as keyof typeof SupportedLanguages] != selectedLanguage
                ) as Array<keyof typeof SupportedLanguages>
              ).map((lang) => ({
                label: SUPPORTED_LANGUAGES_STRING[SupportedLanguages[lang]],
                onClick: () => onChangeLanguage(SupportedLanguages[lang]),
                type: OptionsMenuOptionType.option,
              }))}
            />
          ),
          closeOnClick: false,
          type: OptionsMenuOptionType.option,
        },
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
