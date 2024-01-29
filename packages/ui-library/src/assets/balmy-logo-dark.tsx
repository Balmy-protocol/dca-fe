import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}
export default function BalmyLogoDark({ size }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 112 32" style={{ fontSize: size, height: 'auto' }}>
      <g clipPath="url(#clip0_4513_4367)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M41.8513 5.19141H33.043V25.9476H42.3783C44.2899 25.9476 45.8407 25.411 47.0307 24.3375C48.2206 23.264 48.8155 21.8882 48.8155 20.2098C48.8155 18.9996 48.4741 17.9458 47.7915 17.0481C47.1086 16.1504 46.2114 15.555 45.0994 15.2623C46.0162 14.9304 46.7576 14.3744 47.3232 13.5937C47.8888 12.7935 48.1717 11.8567 48.1717 10.7832C48.1717 9.12423 47.6061 7.77766 46.4747 6.74326C45.3435 5.70887 43.8023 5.19167 41.8515 5.19167L41.8513 5.19141ZM41.3833 13.9739H36.3812V8.91283C36.3812 8.84423 36.3639 8.77642 36.3312 8.71606C36.2592 8.58363 36.1206 8.5012 35.9699 8.5012H35.8808C35.7478 8.5012 35.6247 8.43047 35.5574 8.31533L35.4271 8.09196H41.2953C42.3488 8.09196 43.1678 8.44057 43.7531 8.96734C44.3577 9.4747 44.6601 10.1775 44.6601 11.0752C44.6601 11.9729 44.3676 12.6561 43.7823 13.1831C43.197 13.7101 42.3975 13.9736 41.3833 13.9736V13.9739ZM41.7635 22.9614H36.3812V16.9308H41.8805C42.9341 16.9308 43.7531 17.2138 44.3383 17.7799C44.943 18.3263 45.2454 19.0581 45.2454 19.9755C45.2454 20.8929 44.9233 21.6247 44.2798 22.1712C43.6555 22.6982 42.8168 22.9614 41.7635 22.9614Z"
          fill="#FBFAFF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M53.1503 25.6809C53.9693 26.0322 54.896 26.2079 55.9299 26.2079C56.3311 26.2079 56.7007 26.1856 57.0387 26.1412C58.6315 25.992 60.4809 24.9382 61.2909 24.0809L60.846 25.0281V26.0367H63.3618V16.4594C63.3618 14.7028 62.8252 13.3464 61.7525 12.3901C60.6796 11.4337 59.2067 10.9555 57.3341 10.9555C56.1248 10.9555 55.0909 11.1507 54.2326 11.5411C54.0664 11.6169 53.9058 11.6972 53.7518 11.7825C52.5422 12.4521 51.6091 13.6793 51.5636 15.0617H54.2461C54.4277 14.7384 54.6575 14.4528 54.9348 14.205C55.4813 13.717 56.2514 13.4732 57.3049 13.4732C58.3584 13.4732 59.1383 13.7269 59.6457 14.2342C60.1531 14.7416 60.4065 15.4149 60.4065 16.2541V17.1909H56.0176C54.9641 17.1909 54.0182 17.3568 53.1793 17.6887C52.36 18.0205 51.7064 18.5183 51.219 19.1818C50.7507 19.8258 50.5167 20.665 50.5167 21.6409C50.5167 22.6168 50.7507 23.4462 51.219 24.1293C51.7067 24.8124 52.3504 25.3296 53.1503 25.6809ZM59.2944 22.695C58.5533 23.3781 57.5777 23.7195 56.3684 23.7195V23.7198C55.4909 23.7198 54.7982 23.5246 54.2911 23.1343C53.7837 22.7439 53.5303 22.2171 53.5303 21.5534C53.5303 20.8897 53.7741 20.3922 54.2618 20.0603C54.7498 19.7091 55.3933 19.5333 56.1931 19.5333H60.4065V19.8261C60.4065 21.036 60.0358 21.9924 59.2944 22.695Z"
          fill="#FBFAFF"
        />
        <path
          d="M76.1423 25.9862H72.7775V11.8426H76.0253V12.3856C76.0253 12.9198 75.7286 13.4102 75.2555 13.6577H75.6041C75.8639 13.6577 76.099 13.5133 76.2492 13.3014C76.6274 12.7677 77.1379 12.3399 77.7809 12.0184C78.5805 11.628 79.4 11.4329 80.2387 11.4329C81.1944 11.4329 82.053 11.6474 82.8135 12.0769C83.5743 12.5063 84.1399 13.1307 84.5108 13.9505C85.5056 12.2721 87.0466 11.4329 89.1337 11.4329C90.538 11.4329 91.7279 11.8915 92.7033 12.8087C93.6789 13.7261 94.1663 15.0726 94.1663 16.8487V25.9864H90.8895V17.4049C90.8895 16.5266 90.6552 15.8241 90.1872 15.2971C89.7386 14.7506 89.0555 14.4773 88.1389 14.4773C87.2223 14.4773 86.5493 14.7799 86.0028 15.3848C85.4567 15.9898 85.1836 16.7412 85.1836 17.6389V25.9862H81.848V17.4047C81.848 16.5264 81.614 15.8238 81.1457 15.2968C80.6971 14.7504 80.014 14.477 79.0974 14.477C78.1808 14.477 77.4783 14.7796 76.9324 15.3846C76.4056 15.9701 76.1423 16.7216 76.1423 17.6387V25.9862Z"
          fill="#FBFAFF"
        />
        <path
          d="M107.351 11.6329H110.992L105.964 25.9192C104.856 29.7542 103.673 31.9543 101.098 31.9543H98.5773V29.1981H99.5723C100.625 29.1981 101.386 28.9931 101.884 27.8516L102.469 25.9865H100.413L94.7064 11.6329H98.3478L102.674 22.92H103.376L107.351 11.6329Z"
          fill="#FBFAFF"
        />
        <path d="M66.5186 5.21668H69.6348V26.1412H66.5186V5.21668Z" fill="#FBFAFF" />
        <path
          d="M6.40082 9.26006H11.4289C12.3152 9.26006 13.1917 9.45869 13.9862 9.85171C17.0423 11.3642 18.4753 14.6107 17.5635 17.8455C17.4436 18.2718 17.2723 18.6826 17.0553 19.0687C15.4588 21.9073 12.2982 23.1922 9.16391 22.2655C8.8036 22.1589 8.45552 22.0145 8.12552 21.835C5.8448 20.5932 4.53945 18.3529 4.53945 15.9116V15.1404C3.04556 15.1404 1.63729 14.5844 0.550781 13.5694V16.5609C0.550781 19.5567 2.67807 23.6272 6.06524 25.2972C10.8804 27.6709 15.7045 26.4427 18.7083 23.4368C20.6332 21.5111 21.8237 18.8504 21.8237 15.9118C21.8237 12.9732 20.6332 10.3125 18.7083 8.38681C16.7836 6.46081 14.1245 5.26953 11.1872 5.26953H6.38886L6.40082 9.26032V9.26006Z"
          fill="#07F8BD"
        />
        <path
          d="M4.53945 3.96967V13.2781C2.33664 13.2781 0.550781 11.492 0.550781 9.28895V-0.0195312C1.65218 -0.0195312 2.64935 0.426933 3.37103 1.14915C4.09298 1.87083 4.53945 2.86826 4.53945 3.96993V3.96967Z"
          fill="#07F8BD"
        />
      </g>
      <defs>
        <clipPath id="clip0_4513_4367">
          <rect width="110.56" height="32" fill="white" transform="translate(0.5)" />
        </clipPath>
      </defs>
    </CustomSvgIcon>
  );
}