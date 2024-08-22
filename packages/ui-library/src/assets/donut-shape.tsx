import React from 'react';
import { useTheme } from 'styled-components';
import { colors } from '../theme';

export default function DonutShape({ width = '146px', height = '146px', ...style }: React.CSSProperties) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <div
      style={{
        ...style,
        position: 'relative',
      }}
    >
      <div
        style={{
          background: `${DonutShapeUrl} 50% / contain no-repeat`,
          width,
          height,
          position: 'absolute',
        }}
      />
      <div
        style={{
          backgroundColor: colors[mode].earnWizard.mask,
          mask: `${DonutShapeUrl} center / contain no-repeat`,
          maskPosition: 'center',
          width,
          height,
          mixBlendMode: 'color',
        }}
      />
    </div>
  );
}