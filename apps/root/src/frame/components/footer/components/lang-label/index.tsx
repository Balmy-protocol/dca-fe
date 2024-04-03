import React from 'react';
import styled from 'styled-components';
import { Typography, Popover, Theme, createStyles, Button } from 'ui-library';
import { makeStyles } from 'tss-react/mui';
import useChangeLanguage from '@hooks/useChangeLanguage';
import { SupportedLanguages, SUPPORTED_LANGUAGES_STRING } from '@constants/lang';
import { useSelectedLocale } from '@state/config/hooks';
import { useAppDispatch } from '@state/hooks';
import { setSelectedLocale } from '@state/config/actions';

const usePopoverStyles = makeStyles()((theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(1),
    },
  })
);

const StyledMenu = styled.div`
  padding: 0px 10px 10px 10px;
  display: flex;
  flex-direction: column;
`;

const StyledMenuItem = styled(Button)`
  margin-top: 10px;
  text-transform: none;
`;

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  cursor: pointer;
  margin-right: 10px;
  padding: 4px 8px;
`;

const LanguageLabel = () => {
  const { classes: popoverClasses } = usePopoverStyles();
  const [shouldOpenNetworkMenu, setShouldOpenNetworkMenu] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const selectedLanguage = useSelectedLocale();
  const dispatch = useAppDispatch();
  const changeLanguage = useChangeLanguage();

  React.useEffect(() => {
    changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setShouldOpenNetworkMenu(true);
  };

  const handleClose = (newLang?: string) => {
    setAnchorEl(null);
    setShouldOpenNetworkMenu(false);

    if (newLang) {
      dispatch(setSelectedLocale(newLang as SupportedLanguages));
    }
  };

  const buttonToRender = (
    <StyledButton
      aria-controls="customized-menu"
      aria-haspopup="true"
      variant="outlined"
      onClick={handleClick}
      style={{ maxWidth: '220px', textTransform: 'none' }}
    >
      <Typography variant="body">{SUPPORTED_LANGUAGES_STRING[selectedLanguage]}</Typography>
    </StyledButton>
  );

  return (
    <>
      {buttonToRender}
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        anchorEl={anchorEl}
        open={shouldOpenNetworkMenu}
        classes={popoverClasses}
        onClose={() => handleClose()}
        disableEnforceFocus
      >
        <StyledMenu>
          {(
            Object.keys(SupportedLanguages).filter(
              (sl) => SupportedLanguages[sl as keyof typeof SupportedLanguages] != selectedLanguage
            ) as Array<keyof typeof SupportedLanguages>
          ).map((lang) => (
            <StyledMenuItem
              key={lang}
              variant="outlined"
              size="small"
              onClick={() => handleClose(SupportedLanguages[lang])}
            >
              {SUPPORTED_LANGUAGES_STRING[SupportedLanguages[lang]]}
            </StyledMenuItem>
          ))}
        </StyledMenu>
      </Popover>
    </>
  );
};

export default LanguageLabel;
