import {
  DASHBOARD_ROUTE,
  DCA_ROUTE,
  SWAP_ROUTE,
  TRANSFER_ROUTE,
  HOME_ROUTES,
  DCA_CREATE_ROUTE,
  EARN_ROUTE,
  EARN_PORTFOLIO,
  EARN_GROUP,
  NON_NAVIGABLE_EARN_ROUTES,
  EARN_SUBSCRIBE_ROUTE,
  EARN_ACCESS_NOW_ROUTE,
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
  DollarSquareIcon,
  LinkSection,
} from 'ui-library';
// import { setSwitchActiveWalletOnConnectionThunk, toggleTheme } from '@state/config/actions';
// import { useSwitchActiveWalletOnConnection, useThemeMode } from '@state/config/hooks';
import { setUseUnlimitedApproval, toggleTheme } from '@state/config/actions';
import { useThemeMode, useUseUnlimitedApproval } from '@state/config/hooks';
import useSelectedLanguage from '@hooks/useSelectedLanguage';
import { SUPPORTED_LANGUAGES_STRING, SupportedLanguages } from '@constants/lang';
import useChangeLanguage from '@hooks/useChangeLanguage';
import useAnalytics from '@hooks/useAnalytics';
import NetWorth, { NetWorthVariants } from '@common/components/net-worth';
import { WalletOptionValues, ALL_WALLETS, WalletSelectorVariants } from '@common/components/wallet-selector/types';
import GuardianListSubscribeModal from '../guardian-list-subscribe-modal';
import EarnGainAccessModal from '../earn-gain-access-modal';
import useEarnAccess from '@hooks/useEarnAccess';
import TierPill from '../tier-pill';
import LevelUpModal from '@common/components/level-up-modal';
import { resetForm as resetAggregatorForm } from '@state/aggregator/actions';
import { resetForm as resetTransferForm } from '@state/transfer/actions';
import { resetDcaForm } from '@state/create-position/actions';
import { resetEarnForm } from '@state/earn-management/actions';

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
  const { currentRoute, prevRoute } = useCurrentRoute();
  const intl = useIntl();
  const mode = useThemeMode();
  const [secretMenuClicks, setSecretMenuClicks] = React.useState(
    process.env.NODE_ENV === 'development' ? SECRET_MENU_CLICKS : 0
  );
  const snackbar = useSnackbar();
  const selectedLanguage = useSelectedLanguage();
  const changeLanguage = useChangeLanguage();
  const { trackEvent } = useAnalytics();
  const useUnlimitedApproval = useUseUnlimitedApproval();
  const [selectedWalletOption, setSelectedWalletOption] = React.useState<WalletOptionValues>(ALL_WALLETS);
  const [showEarnModal, setShowEarnModal] = React.useState(false);
  // const switchActiveWalletOnConnection = useSwitchActiveWalletOnConnection();
  const { isEarnEnabled, hasEarnAccess } = useEarnAccess();

  React.useEffect(() => {
    if (HOME_ROUTES.includes(location.pathname)) {
      dispatch(changeRoute('home'));
    } else if (location.pathname.startsWith('/history')) {
      dispatch(changeRoute('history'));
    } else if (location.pathname.startsWith('/invest/create')) {
      dispatch(changeRoute('invest/create'));
    } else if (location.pathname.startsWith('/invest/positions')) {
      dispatch(changeRoute('invest/positions'));
    } else if (location.pathname.startsWith('/swap')) {
      dispatch(changeRoute('swap'));
    } else if (location.pathname.startsWith('/transfer')) {
      dispatch(changeRoute('transfer'));
    } else if (location.pathname.startsWith('/earn')) {
      dispatch(changeRoute('earn'));
    } else if (location.pathname.startsWith('/settings')) {
      dispatch(changeRoute('settings'));
    } else if (location.pathname.startsWith('/token')) {
      dispatch(changeRoute('token'));
    } else if (location.pathname.startsWith('/tier-view')) {
      dispatch(changeRoute('tier-view'));
    }
  }, []);

  React.useEffect(() => {
    // Forms reset on navigation away
    if (prevRoute === SWAP_ROUTE.key && currentRoute !== SWAP_ROUTE.key) {
      dispatch(resetAggregatorForm());
    }
    if (prevRoute === TRANSFER_ROUTE.key && currentRoute !== TRANSFER_ROUTE.key) {
      dispatch(resetTransferForm());
    }
    if (prevRoute === DCA_ROUTE.key && currentRoute !== DCA_ROUTE.key) {
      dispatch(resetDcaForm());
    }
    if (prevRoute === EARN_PORTFOLIO.key && currentRoute !== EARN_PORTFOLIO.key) {
      dispatch(resetEarnForm());
    }
  }, [currentRoute]);

  const onSectionClick = useCallback(
    (section: Section, openInNewTab?: boolean) => {
      if (section.type === SectionType.link && section.key === EARN_GROUP.key) {
        setShowEarnModal(true);
      }

      if (
        section.type === SectionType.divider ||
        section.type === SectionType.group ||
        // section.key === currentRoute ||
        (!hasEarnAccess && NON_NAVIGABLE_EARN_ROUTES.includes(section.key))
      ) {
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
    [dispatch, pushToHistory, currentRoute, hasEarnAccess]
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

  const onToggleUseUnlimitedApproval = () => {
    trackEvent('Main - Click use unlimited approval', { oldValue: useUnlimitedApproval });
    dispatch(setUseUnlimitedApproval(!useUnlimitedApproval));
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
    <>
      {isEarnEnabled ? (
        <>
          <LevelUpModal />
          <EarnGainAccessModal isOpen={showEarnModal} onClose={() => setShowEarnModal(false)} />
        </>
      ) : (
        <GuardianListSubscribeModal isOpen={showEarnModal} onClose={() => setShowEarnModal(false)} />
      )}

      <NavigationUI
        extraHeaderTools={<TierPill />}
        headerContent={
          <NetWorth
            variant={NetWorthVariants.nav}
            walletSelector={{
              variant: WalletSelectorVariants.main,
              options: {
                allowAllWalletsOption: true,
                onSelectWalletOption: setSelectedWalletOption,
                selectedWalletOption,
              },
            }}
          />
        }
        sections={[
          {
            type: SectionType.group,
            label: intl.formatMessage(
              defineMessage({ description: 'navigation.section.dashboard.title', defaultMessage: 'Dashboard' })
            ),
            sections: [
              {
                ...DASHBOARD_ROUTE,
                label: intl.formatMessage(DASHBOARD_ROUTE.label),
                type: SectionType.link,
              },
            ],
          },
          {
            type: SectionType.group,
            label: intl.formatMessage(
              defineMessage({
                description: 'navigation.section.investment.title',
                defaultMessage: 'Investments & Operations',
              })
            ),
            sections: [
              // TODO: Re-enable for relase
              // {
              //   ...EARN_ROUTE,
              //   label: intl.formatMessage(EARN_ROUTE.label),
              //   type: SectionType.link,
              // },
              ...((hasEarnAccess
                ? [
                    {
                      ...EARN_GROUP,
                      label: intl.formatMessage(EARN_GROUP.label),
                      type: SectionType.link,
                      activeKeys: [EARN_ROUTE.key, EARN_PORTFOLIO.key],
                      options: [
                        {
                          ...EARN_ROUTE,
                          label: intl.formatMessage(EARN_ROUTE.label),
                          type: SectionType.link,
                        },
                        {
                          ...EARN_PORTFOLIO,
                          label: intl.formatMessage(EARN_PORTFOLIO.label),
                          type: SectionType.link,
                        },
                      ],
                    },
                  ]
                : [
                    {
                      ...EARN_SUBSCRIBE_ROUTE,
                      label: intl.formatMessage(EARN_SUBSCRIBE_ROUTE.label),
                      activeKeys: [EARN_ACCESS_NOW_ROUTE.key],
                      type: SectionType.link,
                    },
                  ]) satisfies LinkSection[]),
              {
                ...DCA_ROUTE,
                label: intl.formatMessage(DCA_ROUTE.label),
                type: SectionType.link,
                activeKeys: [DCA_ROUTE.key, DCA_CREATE_ROUTE.key],
              },
              { ...SWAP_ROUTE, label: intl.formatMessage(SWAP_ROUTE.label), type: SectionType.link },
              { ...TRANSFER_ROUTE, label: intl.formatMessage(TRANSFER_ROUTE.label), type: SectionType.link },
            ],
          },
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
          {
            label: intl.formatMessage(
              defineMessage({ description: 'useUnlimitedApproval', defaultMessage: 'Unlimited Approval' })
            ),
            Icon: DollarSquareIcon,
            onClick: onToggleUseUnlimitedApproval,
            control: <Switch checked={useUnlimitedApproval} />,
            closeOnClick: false,
            type: OptionsMenuOptionType.option,
          },
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
    </>
  );
};

export default Navigation;
