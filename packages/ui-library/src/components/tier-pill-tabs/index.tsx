import React, { useEffect, useState } from 'react';
import { BigIntish } from '@balmy/sdk';
import isUndefined from 'lodash/isUndefined';
import { ContainerBox } from '../container-box';
import { Button } from '../button';
import styled from 'styled-components';
import { colors } from '../../theme';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  TierLevel0Flat,
  TierLevel1Flat,
  TierLevel2Flat,
  TierLevel3Flat,
  TierLevel4Flat,
  TierLevel0Active,
  TierLevel1Active,
  TierLevel2Active,
  TierLevel3Active,
  TierLevel4Active,
} from '../../icons';

interface TierPillTabsProps {
  options: {
    key: BigIntish;
    label: string;
    isCurrent?: boolean;
  }[];
  // Usefull for controlled components
  onChange?: (key: BigIntish) => void;
  // Makes the component controlled
  selected?: BigIntish;
  disabled?: boolean;
}

const TierPillTab = styled(Button).attrs({
  variant: 'outlined',
  size: 'small',
  color: 'info',
})<{ selected: boolean }>`
  ${({
    selected,
    theme: {
      palette: { mode },
      spacing,
    },
  }) =>
    `
    padding: ${spacing(2)} !important;
    gap: ${spacing(2)};
    background-color: ${colors[mode].background.quartery};
    border: 1.5px solid ${colors[mode].border.border3};
    color: ${colors[mode].typography.typo4};
    ${
      selected &&
      `
      background-color: ${colors[mode].background.tertiary};
      border: 1.5px solid ${colors[mode].border.border1};
      color: ${colors[mode].accent.primary};
      box-shadow: ${colors[mode].dropShadow.dropShadow100};
    `
    }
  `}
`;

export const FlatTiersIcons: Record<number, React.ElementType> = {
  0: TierLevel0Flat,
  1: TierLevel1Flat,
  2: TierLevel2Flat,
  3: TierLevel3Flat,
  4: TierLevel4Flat,
};

export const ActiveTiersIcons: Record<number, React.ElementType> = {
  0: TierLevel0Active,
  1: TierLevel1Active,
  2: TierLevel2Active,
  3: TierLevel3Active,
  4: TierLevel4Active,
};

const TierPillIcon = ({ tierLevel, isActive }: { tierLevel: number; isActive: boolean }) => {
  const TierIcon = isActive ? ActiveTiersIcons[tierLevel] : FlatTiersIcons[tierLevel];
  return <TierIcon size="1rem" />;
};

const TierPillTabs = ({ options, onChange, selected, disabled }: TierPillTabsProps) => {
  const [uncontrolledSelection, setUncontrolledSelection] = useState<BigIntish | undefined>(options[0]?.key);

  useEffect(() => {
    if (isUndefined(uncontrolledSelection) && !isUndefined(options[0])) {
      setUncontrolledSelection(options[0].key);
    }
  }, [options]);

  const onSelect = (key: BigIntish) => {
    if (onChange) {
      onChange(key);
    }

    setUncontrolledSelection(key);
  };

  const selection = isUndefined(selected) ? uncontrolledSelection : selected;

  return (
    <ContainerBox gap={2} flexWrap="wrap">
      {options.map(({ key, label, isCurrent }, index) => (
        <TierPillTab
          key={key.toString()}
          onClick={() => onSelect(key)}
          disabled={disabled}
          selected={key === selection}
        >
          <ContainerBox gap={1} alignItems="center">
            <TierPillIcon tierLevel={index} isActive={key === selection} />
            <Typography
              variant="bodySmallBold"
              color={({ palette: { mode } }) =>
                key === selection ? colors[mode].accent.primary : colors[mode].typography.typo4
              }
            >
              {label}
            </Typography>
            {isCurrent && (
              <>
                <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].accent.primary}>
                  {` · `}
                  <FormattedMessage description="tier-view.current-tier.tiers.current" defaultMessage="Current" />
                </Typography>
              </>
            )}
          </ContainerBox>
        </TierPillTab>
      ))}
    </ContainerBox>
  );
};

export { TierPillTabs, type TierPillTabsProps };
