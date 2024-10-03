import React from 'react';
import { ContainerBox } from '../container-box';
import { useTheme } from 'styled-components';
import { colors, SPACING } from '../../theme';
import { ArrowUpIcon } from '../../icons';

interface SortIconProps {
  direction?: 'asc' | 'desc';
}

const SortIcon = ({ direction }: SortIconProps) => {
  const {
    palette: { mode },
  } = useTheme();

  const arrowUpColor = direction === 'asc' ? colors[mode].typography.typo1 : colors[mode].typography.typo5;
  const arrowDownColor = direction === 'desc' ? colors[mode].typography.typo1 : colors[mode].typography.typo5;
  return (
    <ContainerBox flexDirection="column" alignItems="center">
      <ArrowUpIcon sx={{ color: arrowUpColor, fontSize: SPACING(2.5) }} />
      <ArrowUpIcon sx={{ color: arrowDownColor, fontSize: SPACING(2.5), transform: 'rotate(180deg)' }} />
    </ContainerBox>
  );
};

export { SortIcon, type SortIconProps };
