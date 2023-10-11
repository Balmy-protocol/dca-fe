import React from 'react';
import { SvgIcon } from 'ui-library';
import WhaleSvg from './whale.svg';

interface WhaleIconProps {
  size?: string;
}

const WhaleIcon = ({ size }: WhaleIconProps) => {
  const realSize = size || '28px';
  return <SvgIcon component={WhaleSvg} viewBox="0 0 32 32" style={{ fontSize: realSize }} />;
};

export default WhaleIcon;
