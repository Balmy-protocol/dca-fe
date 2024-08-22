import React from 'react';
import { useTheme } from 'styled-components';
import { SPACING } from '../../theme/constants';
import { colors } from '../../theme';

export function CoinWrapper({
  style: { width = '40px', height = '40px', ...style },
  children,
}: {
  style: React.CSSProperties;
  children: React.ReactNode;
}) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <div
      style={{
        ...style,
        width,
        height,
        position: 'relative',
        padding: SPACING(3),
        borderRadius: '50%',
        border: `0.25px solid #ffffffa6`, // White with 65% opacity
        background: '#FFFFFF01', // White with 1% opacity
        backdropFilter: 'blur(5px)',
        boxShadow: colors[mode].dropShadow.dropShadow100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}
