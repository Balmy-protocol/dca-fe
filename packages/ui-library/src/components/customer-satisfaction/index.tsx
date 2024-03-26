import React, { useCallback, useState } from 'react';
import { ContainerBox } from '../container-box';
import { Typography } from '@mui/material';
import styled from 'styled-components';
import { BackgroundPaper } from '../background-paper';
import { colors } from '../../theme';
import { useSnackbar } from 'notistack';
import { FormattedMessage } from 'react-intl';
import debounce from 'lodash/debounce';

export interface FeedbackOption {
  label: React.ReactElement;
  value: number;
}

export interface CustomerSatisfactionProps {
  options: FeedbackOption[];
  mainQuestion: string;
  ratingDescriptors: string[];
  onClickOption: (value: number) => void;
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

const StyledRatingDescriptor = styled(Typography).attrs({ variant: 'bodyExtraSmall' })`
  color: ${({ theme }) => colors[theme.palette.mode].typography.typo2};
`;

const CustomerSatisfaction = ({
  options,
  mainQuestion,
  ratingDescriptors = [],
  onClickOption,
}: CustomerSatisfactionProps) => {
  const [optionSelected, setOptionSelected] = useState<number | null>(null);
  const snackbar = useSnackbar();

  const debouncedClickOption = useCallback(debounce(onClickOption, 3000), [onClickOption]);

  const handleOptionClick = (value: number) => {
    const prevValue = optionSelected;
    setOptionSelected((prev) => (prev === value ? null : value));

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
    <ContainerBox flexDirection="column" gap={3} alignItems="center">
      <Typography variant="bodySmall" textAlign="center">
        {mainQuestion}
      </Typography>
      <ContainerBox flexDirection="column" gap={2}>
        <ContainerBox gap={2}>
          {options.map((option) => (
            <StyledOption
              key={option.value}
              $selected={optionSelected === option.value}
              elevation={optionSelected === option.value ? 1 : 0}
              onClick={() => void handleOptionClick(option.value)}
            >
              {option.label}
            </StyledOption>
          ))}
        </ContainerBox>
        {ratingDescriptors.length > 0 && (
          <ContainerBox justifyContent="space-between">
            {ratingDescriptors.map((label, index) => (
              <StyledRatingDescriptor key={index}>{label}</StyledRatingDescriptor>
            ))}
          </ContainerBox>
        )}
      </ContainerBox>
    </ContainerBox>
  );
};

export default CustomerSatisfaction;
