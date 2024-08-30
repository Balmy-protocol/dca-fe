import React from 'react';
import { useTheme } from 'styled-components';
import { colors } from '../theme';

const DonutShapeUrl = 'url("https://ipfs.io/ipfs/QmZ8VeLhm96WUzqmRfH94SkMKJcoyT9ZPWCn9731xzTG7i")';
export default function DonutShape({
  persistThemeColor,
  width = '146px',
  height = '146px',
  ...style
}: React.CSSProperties & {
  persistThemeColor?: ReturnType<typeof useTheme>['palette']['mode'];
}) {
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
          backgroundColor: colors[persistThemeColor || mode].donutShape.mask,
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
