import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { baseColors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}
export default function BalmyLogoLight({ size }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 111 32" style={{ fontSize: size, height: 'auto' }}>
      <g clipPath="url(#clip0_4513_4081)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M41.4763 5.18945H32.668V25.9457H42.0033C43.9149 25.9457 45.4657 25.4091 46.6557 24.3356C47.8456 23.2621 48.4405 21.8863 48.4405 20.2078C48.4405 18.9977 48.0991 17.9439 47.4165 17.0462C46.7336 16.1484 45.8364 15.5531 44.7244 15.2603C45.6412 14.9284 46.3826 14.3724 46.9482 13.5917C47.5138 12.7916 47.7967 11.8548 47.7967 10.7813C47.7967 9.12228 47.2311 7.7757 46.0997 6.74131C44.9685 5.70692 43.4273 5.18972 41.4765 5.18972L41.4763 5.18945ZM41.0083 13.972H36.0062V8.91088C36.0062 8.84227 35.9889 8.77447 35.9562 8.7141C35.8842 8.58168 35.7456 8.49925 35.5949 8.49925H35.5058C35.3728 8.49925 35.2497 8.42852 35.1824 8.31338L35.0521 8.09001H40.9202C41.9738 8.09001 42.7928 8.43862 43.3781 8.96539C43.9827 9.47275 44.2851 10.1756 44.2851 11.0733C44.2851 11.971 43.9926 12.6541 43.4073 13.1811C42.822 13.7082 42.0225 13.9717 41.0083 13.9717V13.972ZM41.3885 22.9595H36.0062V16.9289H41.5055C42.5591 16.9289 43.3781 17.2118 43.9633 17.7779C44.568 18.3244 44.8704 19.0562 44.8704 19.9736C44.8704 20.891 44.5483 21.6228 43.9048 22.1692C43.2805 22.6962 42.4418 22.9595 41.3885 22.9595Z"
          fill="#312049"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M52.7753 25.6789C53.5943 26.0302 54.521 26.206 55.5549 26.206C55.9561 26.206 56.3257 26.1836 56.6637 26.1392C58.2565 25.9901 60.1059 24.9363 60.9159 24.079L60.471 25.0261V26.0347H62.9868V16.4574C62.9868 14.7008 62.4502 13.3444 61.3775 12.3882C60.3046 11.4317 58.8317 10.9536 56.9591 10.9536C55.7498 10.9536 54.7159 11.1488 53.8576 11.5391C53.6914 11.6149 53.5308 11.6952 53.3768 11.7806C52.1672 12.4501 51.2341 13.6773 51.1886 15.0598H53.8711C54.0527 14.7364 54.2825 14.4509 54.5598 14.203C55.1063 13.7151 55.8764 13.4712 56.9299 13.4712C57.9834 13.4712 58.7633 13.7249 59.2707 14.2323C59.7781 14.7396 60.0315 15.4129 60.0315 16.2521V17.1889H55.6426C54.5891 17.1889 53.6432 17.3549 52.8043 17.6867C51.985 18.0186 51.3314 18.5164 50.844 19.1798C50.3757 19.8239 50.1417 20.6631 50.1417 21.639C50.1417 22.6149 50.3757 23.4442 50.844 24.1274C51.3317 24.8105 51.9754 25.3277 52.7753 25.6789ZM58.9194 22.693C58.1783 23.3762 57.2027 23.7176 55.9934 23.7176V23.7179C55.1158 23.7179 54.4232 23.5227 53.9161 23.1323C53.4087 22.742 53.1553 22.2152 53.1553 21.5515C53.1553 20.8878 53.3991 20.3902 53.8868 20.0584C54.3748 19.7071 55.0183 19.5314 55.8181 19.5314H60.0315V19.8241C60.0315 21.034 59.6608 21.9905 58.9194 22.693Z"
          fill="#312049"
        />
        <path
          d="M75.7673 25.9842H72.4025V11.8407H75.6503V12.3837C75.6503 12.9179 75.3536 13.4082 74.8805 13.6558H75.2291C75.4889 13.6558 75.724 13.5114 75.8742 13.2995C76.2524 12.7658 76.7629 12.3379 77.4059 12.0164C78.2055 11.6261 79.025 11.4309 79.8637 11.4309C80.8194 11.4309 81.678 11.6455 82.4385 12.0749C83.1993 12.5044 83.7649 13.1287 84.1358 13.9485C85.1306 12.2701 86.6715 11.4309 88.7587 11.4309C90.163 11.4309 91.3529 11.8896 92.3283 12.8067C93.3039 13.7241 93.7913 15.0707 93.7913 16.8467V25.9845H90.5145V17.403C90.5145 16.5247 90.2802 15.8222 89.8122 15.2951C89.3636 14.7487 88.6805 14.4753 87.7639 14.4753C86.8473 14.4753 86.1743 14.7779 85.6278 15.3829C85.0817 15.9878 84.8086 16.7393 84.8086 17.637V25.9842H81.473V17.4027C81.473 16.5244 81.239 15.8219 80.7707 15.2949C80.3221 14.7484 79.639 14.475 78.7224 14.475C77.8058 14.475 77.1033 14.7777 76.5574 15.3826C76.0306 15.9681 75.7673 16.7196 75.7673 17.6367V25.9842Z"
          fill="#312049"
        />
        <path
          d="M106.976 11.6309H110.617L105.589 25.9172C104.481 29.7522 103.298 31.9524 100.723 31.9524H98.2023V29.1962H99.1973C100.25 29.1962 101.011 28.9912 101.509 27.8496L102.094 25.9845H100.038L94.3314 11.6309H97.9728L102.299 22.918H103.001L106.976 11.6309Z"
          fill="#312049"
        />
        <path d="M66.1436 5.21473H69.2598V26.1393H66.1436V5.21473Z" fill="#312049" />
        <path
          d="M6.02582 9.2581H11.0539C11.9402 9.2581 12.8167 9.45674 13.6112 9.84976C16.6673 11.3623 18.1003 14.6088 17.1885 17.8436C17.0686 18.2698 16.8973 18.6807 16.6803 19.0668C15.0838 21.9054 11.9232 23.1902 8.78891 22.2635C8.4286 22.1569 8.08052 22.0125 7.75052 21.833C5.4698 20.5912 4.16445 18.3509 4.16445 15.9096V15.1385C2.67056 15.1385 1.26229 14.5824 0.175781 13.5675V16.559C0.175781 19.5547 2.30307 23.6253 5.69024 25.2952C10.5054 27.669 15.3295 26.4407 18.3333 23.4349C20.2582 21.5092 21.4487 18.8485 21.4487 15.9099C21.4487 12.9713 20.2582 10.3106 18.3333 8.38485C16.4086 6.45886 13.7495 5.26758 10.8122 5.26758H6.01386L6.02582 9.25837V9.2581Z"
          fill={baseColors.violet.violet500}
        />
        <path
          d="M4.16445 3.96771V13.2762C1.96164 13.2762 0.175781 11.4901 0.175781 9.287V-0.0214844C1.27718 -0.0214844 2.27435 0.42498 2.99603 1.14719C3.71798 1.86888 4.16445 2.86631 4.16445 3.96798V3.96771Z"
          fill={baseColors.violet.violet500}
        />
      </g>
      <defs>
        <clipPath id="clip0_4513_4081">
          <rect width="110.56" height="32" fill="white" transform="translate(0.125)" />
        </clipPath>
      </defs>
    </CustomSvgIcon>
  );
}
