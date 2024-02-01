import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function ArrowRightIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 14 14" style={size ? { fontSize: size } : {}} {...props}>
      <path d="M9.07812 7.07031H3.07812C2.66813 7.07031 2.32812 6.73031 2.32812 6.32031C2.32812 5.91031 2.66813 5.57031 3.07812 5.57031H9.07812C9.48812 5.57031 9.82812 5.91031 9.82812 6.32031C9.82812 6.73031 9.48812 7.07031 9.07812 7.07031Z" />
      <path d="M7.07562 10.0678C6.88562 10.0678 6.69563 9.99781 6.54563 9.84781C6.25563 9.55781 6.25563 9.07781 6.54563 8.78781L9.01562 6.31781L6.54563 3.84781C6.25563 3.55781 6.25563 3.07781 6.54563 2.78781C6.83562 2.49781 7.31562 2.49781 7.60562 2.78781L10.6056 5.78781C10.8956 6.07781 10.8956 6.55781 10.6056 6.84781L7.60562 9.84781C7.45562 9.99781 7.26562 10.0678 7.07562 10.0678Z" />
    </CustomSvgIcon>
  );
}