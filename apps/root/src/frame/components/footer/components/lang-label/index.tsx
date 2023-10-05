import React from 'react';
import styled from 'styled-components';
import Button from '@common/components/button';
import { Typography, Popover } from 'ui-library';
import { makeStyles } from 'tss-react/mui';
import { Theme, createStyles } from '@mui/material';
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
  box-shadow:
    0 1px 2px 0 rgba(60, 64, 67, 0.302),
    0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow:
      0 1px 3px 0 rgba(60, 64, 67, 0.302),
      0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
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
      color="transparent"
      variant="outlined"
      onClick={handleClick}
      style={{ maxWidth: '220px', textTransform: 'none' }}
    >
      <Typography variant="body1">{SUPPORTED_LANGUAGES_STRING[selectedLanguage]}</Typography>
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
          {(Object.keys(SupportedLanguages) as Array<keyof typeof SupportedLanguages>).map((lang) => (
            <StyledMenuItem
              key={lang}
              color="transparent"
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
