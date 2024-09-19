import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}
export default function RootstockLogoMinimalistic({ size, height, width, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 241 268" fill="none" style={{ fontSize: size, height, width }} {...props}>
      <path
        d="M121.5 73C141.658 73 158 56.6584 158 36.5C158 16.3416 141.658 0 121.5 0C101.342 0 85 16.3416 85 36.5C85 56.6584 101.342 73 121.5 73Z"
        fill={colors[mode].violet.violet200}
      />
      <path
        d="M222.661 150.296C205.111 140.143 182.641 146.155 172.536 163.79C169.079 169.802 167.484 176.482 167.617 183.029C168.016 199.328 153.39 207.745 139.563 199.328C139.031 199.061 138.499 198.66 137.834 198.393C123.874 190.511 123.874 173.81 137.834 166.061C149.269 159.782 157.113 147.624 157.113 133.596C157.113 133.329 157.113 133.062 157.113 132.795C156.714 116.495 171.339 108.078 185.167 116.495C196.202 123.309 210.562 123.843 222.528 116.896C240.078 106.742 246.062 84.1633 235.957 66.5278C225.852 48.8923 203.382 42.8802 185.832 53.034C173.866 59.9813 167.218 72.8071 167.484 85.7665C167.883 102.066 153.257 110.483 139.563 102.066C133.978 98.5923 127.463 96.5883 120.417 96.5883C113.37 96.5883 106.855 98.5923 101.271 101.932C87.4433 110.216 72.9509 101.799 73.3498 85.6329C73.6157 72.5399 66.9678 59.8477 55.0017 52.9004C37.4513 42.7466 14.9815 48.8923 4.87672 66.5278C-5.22805 84.1633 0.887994 106.742 18.4384 116.896C30.4045 123.843 44.764 123.175 55.7994 116.495C69.627 108.078 84.1194 116.495 83.7205 132.795C83.7205 133.062 83.7205 133.329 83.7205 133.596C83.7205 147.624 91.432 159.782 102.999 166.061C116.96 173.944 116.96 190.644 102.999 198.393C102.467 198.66 101.936 199.061 101.404 199.328C87.5762 207.612 73.0839 199.195 73.4828 183.029C73.6157 176.482 72.0202 169.802 68.5633 163.657C58.4586 146.021 35.9888 140.009 18.4384 150.163C0.887994 160.584 -5.09509 183.163 5.00967 200.798C15.1144 218.434 37.5843 224.446 55.1346 214.292C55.4006 214.158 55.5335 214.025 55.7994 213.891C69.627 205.474 84.1194 213.891 83.7205 230.191C83.7205 230.458 83.7205 230.725 83.7205 231.126C83.7205 251.433 100.207 268 120.417 268C140.626 268 157.113 251.433 157.113 231.126C157.113 230.859 157.113 230.591 157.113 230.324C156.714 214.025 171.339 205.608 185.167 214.025C185.433 214.158 185.699 214.292 185.965 214.559C203.515 224.713 225.985 218.701 236.09 201.065C246.194 183.029 240.211 160.45 222.661 150.296Z"
        fill={colors[mode].violet.violet200}
      />
    </CustomSvgIcon>
  );
}