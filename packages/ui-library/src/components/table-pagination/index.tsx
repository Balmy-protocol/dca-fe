import React, { useMemo } from 'react';
import { IconButton, TablePagination as MuiTablePagination, TablePaginationProps, Typography } from '@mui/material';
import { ContainerBox } from '../container-box';
import { ArrowBackIcon, ArrowForwardIcon } from '../../icons';
import styled, { useTheme } from 'styled-components';
import { TablePaginationActionsProps } from '@mui/material/TablePagination/TablePaginationActions';
import { colors } from '../../theme';

const StyledPaginationArrow = styled(IconButton)<{ disabled: boolean }>`
  ${({ theme: { palette, spacing }, disabled }) => `
  padding: ${spacing(1 / 4)};
  border-radius: 50%;
  background-color: ${colors[palette.mode].background.secondary};
  border: 1px solid ${colors[palette.mode].border.border1};
  ${!disabled && `box-shadow: ${colors[palette.mode].dropShadow.dropShadow100};`}
  color: ${colors[palette.mode].accentPrimary};
  transition: all 0.3s;
  :disabled {
    background-color: ${colors[palette.mode].background.secondary};
    & .MuiSvgIcon-root {
      color: ${colors[palette.mode].typography.typo4};
    }
  }
`}
`;

const StyledPageButton = styled(IconButton)<{ $active: boolean }>`
  ${({ theme: { palette, spacing }, $active }) => `
  width: ${spacing(6)};
  height: ${spacing(6)};
  background-color: transparent;
  transition: background-color 0.3s;
  ${
    $active &&
    `background-color: ${colors[palette.mode].accentPrimary};
    :hover {
      background-color: ${colors[palette.mode].accentPrimary};
    }
  `
  }
`}
`;

const StyledArrowBackIcon = styled(ArrowBackIcon).attrs({ fontSize: 'small' })`
  transition: all 0.2s;
`;

const StyledArrowForwardIcon = styled(ArrowForwardIcon).attrs({ fontSize: 'small' })`
  transition: all 0.2s;
`;

function CustomTablePaginationActions({
  count,
  getItemAriaLabel,
  onPageChange,
  page: pageZeroIndexed,
  rowsPerPage,
}: TablePaginationActionsProps) {
  const {
    palette: { mode },
  } = useTheme();
  const page = pageZeroIndexed + 1;
  const totalPages = Math.ceil(count / rowsPerPage);

  const pagesOptions = useMemo<(number | '...')[]>(() => {
    let pages: (number | '...')[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (page <= 3) {
      pages = [1, 2, 3, '...', totalPages];
    } else if (page > 3 && page < totalPages - 2) {
      pages = [1, '...', page, '...', totalPages];
    } else {
      pages = [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    return pages;
  }, [totalPages, rowsPerPage, page]);

  const onPageChangeHandler = (newPage: number) => {
    onPageChange(null, newPage);
  };

  return (
    <ContainerBox fullWidth alignItems="center" justifyContent="center">
      <ContainerBox gap={4} alignItems="center">
        <StyledPaginationArrow
          onClick={() => onPageChangeHandler(page - 2)}
          disabled={page === 1}
          aria-label={getItemAriaLabel('previous')}
        >
          <StyledArrowBackIcon />
        </StyledPaginationArrow>
        <ContainerBox gap={3} alignItems="center">
          {pagesOptions.map((option, i) => (
            <StyledPageButton
              key={`${option}-${i}`}
              onClick={() => option !== '...' && onPageChange(null, option - 1)}
              $active={option === page}
              aria-label={
                option === 1 ? getItemAriaLabel('first') : option === totalPages ? getItemAriaLabel('last') : undefined
              }
            >
              <Typography
                variant={option === page ? 'labelLargeSemibold' : 'labelLargeRegular'}
                color={option === page ? colors[mode].accent.accent100 : colors[mode].typography.typo2}
              >
                {option}
              </Typography>
            </StyledPageButton>
          ))}
        </ContainerBox>
        <StyledPaginationArrow
          onClick={() => onPageChangeHandler(page)}
          disabled={page === totalPages || totalPages === 0}
          aria-label={getItemAriaLabel('next')}
        >
          <StyledArrowForwardIcon />
        </StyledPaginationArrow>
      </ContainerBox>
    </ContainerBox>
  );
}

const TablePagination = (props: TablePaginationProps) => (
  <MuiTablePagination {...props} ActionsComponent={CustomTablePaginationActions} />
);

export { TablePagination, TablePaginationProps };
