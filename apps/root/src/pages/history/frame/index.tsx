import { DASHBOARD_ROUTE } from '@constants/routes';
import useReplaceHistory from '@hooks/useReplaceHistory';
import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  BackControl,
  ContainerBox,
  InputAdornment,
  SearchIcon,
  StyledNonFormContainer,
  TextField,
  Typography,
  colors,
} from 'ui-library';
import HistoryTable from '../components/historyTable';

const StyledHistoryFrame = styled(StyledNonFormContainer)`
  ${({ theme: { spacing } }) => `
  gap: ${spacing(12)};
  flex-direction: column;
  flex-wrap: nowrap;
`}
`;

const StyledHistoryHeader = styled.div`
  ${({ theme: { spacing } }) => `
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
`}
`;

const StyledTitle = styled(Typography).attrs({ variant: 'h1' })`
  ${({ theme: { palette, spacing } }) => `
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  color: ${colors[palette.mode].typography.typo1};
  font-weight: bold;
`}
`;

const StyledSearchBox = styled(TextField)`
  min-width: 40%;
`;

const HistoryFrame = () => {
  const replaceHistory = useReplaceHistory();
  const intl = useIntl();
  const [search, setSearch] = React.useState('');

  const onGoBack = () => {
    replaceHistory(`/${DASHBOARD_ROUTE.key}`);
  };

  return (
    <StyledHistoryFrame>
      <StyledHistoryHeader>
        <BackControl
          onClick={onGoBack}
          label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
        />
        <ContainerBox justifyContent="space-between" alignItems="center">
          <StyledTitle>
            <FormattedMessage description={'history'} defaultMessage={'History'} />
          </StyledTitle>
          <StyledSearchBox
            placeholder={intl.formatMessage(
              defineMessage({
                defaultMessage: 'Search by Address, Asset or Operation',
                description: 'historySearch',
              })
            )}
            value={search}
            onChange={(evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
              setSearch(evt.currentTarget.value)
            }
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Escape') {
                // Prevents autoselecting item while typing (default Select behaviour)
                e.stopPropagation();
              }
            }}
          />
        </ContainerBox>
      </StyledHistoryHeader>
      <HistoryTable search={search} />
    </StyledHistoryFrame>
  );
};

export default HistoryFrame;
