import React from 'react';
import { SvgIcon } from 'ui-library';

interface IconProps {
  size?: string;
}

export default function ArrowRight({ size }: IconProps) {
  const realSize = size || '28px';
  return (
    <SvgIcon viewBox="0 0 20 13" style={{ fontSize: realSize }}>
      <path
        d="M7.01433 0.7921L7.84953 1.62834C8.01657 1.8374 8.01657 2.13008 7.80777 2.33914L4.46698 5.55865H18.8324C19.1247 5.55865 19.3335 5.80952 19.3335 6.06039V7.23112C19.3335 7.5238 19.1247 7.73286 18.8324 7.73286H4.46698L7.80777 10.9942C8.01657 11.2032 8.01657 11.4959 7.84953 11.705L7.01433 12.5412C6.80553 12.7085 6.51321 12.7085 6.30441 12.5412L0.79211 7.02206C0.625071 6.813 0.625071 6.52032 0.79211 6.31126L6.30441 0.7921C6.51321 0.624852 6.80553 0.624852 7.01433 0.7921Z"
        fill="#FFFFFF"
      />
    </SvgIcon>
  );
}
