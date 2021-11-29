import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

interface IconProps {
  size?: string;
}

export default function CaretDown({ size }: IconProps) {
  const realSize = size || '28px';
  return (
    <SvgIcon viewBox="0 0 11 7" style={{ fontSize: realSize }}>
      <path d="M9.5 0H2.5C1.15625 0 0.468747 1.625 1.4375 2.5625L4.9375 6.0625C5.5 6.65625 6.46875 6.65625 7.0625 6.0625L10.5625 2.5625C11.5 1.625 10.8125 0 9.5 0ZM6 5L2.5 1.5H9.5L6 5Z" />
    </SvgIcon>
  );
}
