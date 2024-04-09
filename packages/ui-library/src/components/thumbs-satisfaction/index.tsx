import React, { useCallback, useState } from 'react';
import { ContainerBox } from '../container-box';
import { Typography } from '@mui/material';
import styled from 'styled-components';
import { BackgroundPaper } from '../background-paper';
import { colors } from '../../theme';
import { useSnackbar } from 'notistack';
import { FormattedMessage } from 'react-intl';
import debounce from 'lodash/debounce';
import { ThumbsDownEmoji, ThumbsUpEmoji } from '../../emojis';
import { SPACING } from '../../theme/constants';

export interface ThumbsSatisfactionProps {
  id: string;
  onClickOption: ({ id, value }: { id: string; value: boolean }) => void;
}

const StyledOption = styled(BackgroundPaper).attrs({ variant: 'outlined' })<{ $selected: boolean }>`
  ${({ theme: { palette, spacing }, $selected }) => `
    padding: ${spacing(3)};
    border-radius: ${spacing(2)};
    cursor: pointer;
    outline-width: 1px;
    transition: all 0.3s;
    display: flex;
    ${
      $selected &&
      `
    background-color: ${colors[palette.mode].background.tertiary};
    outline-color ${colors[palette.mode].border.accent};
    `
    }
`}
`;

const ThumbsSatisfaction = ({ id, onClickOption }: ThumbsSatisfactionProps) => {
  const [optionSelected, setOptionSelected] = useState<boolean | null>(null);
  const snackbar = useSnackbar();

  const debouncedClickOption = useCallback(debounce(onClickOption, 3000), [onClickOption]);

  const handleOptionClick = (value: { id: string; value: boolean }) => {
    const prevValue = optionSelected;
    setOptionSelected((prev) => (prev === value.value ? null : value.value));

    try {
      debouncedClickOption(value);
    } catch (e) {
      console.error(e);
      snackbar.enqueueSnackbar({
        variant: 'error',
        message: (
          <FormattedMessage
            description="customerSatError"
            defaultMessage="We weren't able to save your feedback. Please try again later"
          />
        ),
      });
      setOptionSelected(prevValue);
    }
  };

  return (
    <ContainerBox flexDirection="column" gap={3} alignItems="flex-start">
      <Typography variant="bodySmallRegular">
        <FormattedMessage description="was this helpful" defaultMessage="Was this helpful?" />
      </Typography>
      <ContainerBox gap={2}>
        <StyledOption
          $selected={optionSelected === false}
          elevation={optionSelected === false ? 1 : 0}
          onClick={() => void handleOptionClick({ value: false, id })}
        >
          <ThumbsDownEmoji size={SPACING(7)} />
        </StyledOption>
        <StyledOption
          $selected={optionSelected === true}
          elevation={optionSelected === true ? 1 : 0}
          onClick={() => void handleOptionClick({ value: true, id })}
        >
          <ThumbsUpEmoji size={SPACING(7)} />
        </StyledOption>
      </ContainerBox>
    </ContainerBox>
  );
};

export { ThumbsSatisfaction };
