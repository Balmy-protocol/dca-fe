import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function BugBountyIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 25 25" style={size ? { fontSize: size } : {}} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.4563 2.89297C17.5418 2.8428 17.6165 2.77618 17.6761 2.69697C17.7356 2.61776 17.7789 2.52753 17.8034 2.43149C17.8279 2.33544 17.8331 2.2355 17.8187 2.13743C17.8044 2.03936 17.7707 1.94512 17.7197 1.86014C17.6687 1.77516 17.6013 1.70113 17.5215 1.64234C17.4417 1.58355 17.3511 1.54116 17.2548 1.51762C17.1585 1.49408 17.0585 1.48985 16.9606 1.50519C16.8627 1.52053 16.7688 1.55512 16.6843 1.60697L14.3403 3.01397C13.6319 2.67431 12.856 2.49863 12.0703 2.49997C11.285 2.49878 10.5095 2.67446 9.80131 3.01397L7.45631 1.60697C7.28587 1.50693 7.08284 1.47821 6.89134 1.52705C6.69984 1.57588 6.53536 1.69833 6.43364 1.86777C6.33192 2.03721 6.30119 2.23995 6.34813 2.43192C6.39507 2.6239 6.51589 2.78958 6.68431 2.89297L8.44731 3.95097C7.93251 4.44065 7.52277 5.03 7.24306 5.68312C6.96335 6.33625 6.81951 7.03947 6.82031 7.74997V8.03997C6.56331 8.17497 6.32031 8.33397 6.09531 8.51297C6.02468 8.44392 5.94107 8.38954 5.84931 8.35297L3.84931 7.55297C3.66571 7.48377 3.4623 7.48927 3.2827 7.5683C3.10311 7.64733 2.96164 7.79359 2.88863 7.97571C2.81562 8.15784 2.8169 8.36132 2.89218 8.54252C2.96745 8.72371 3.11074 8.8682 3.29131 8.94497L5.06331 9.65397C4.59331 10.384 4.32031 11.254 4.32031 12.187V13.499H2.07031C1.8714 13.499 1.68063 13.578 1.53998 13.7186C1.39933 13.8593 1.32031 14.0501 1.32031 14.249C1.32031 14.4479 1.39933 14.6387 1.53998 14.7793C1.68063 14.92 1.8714 14.999 2.07031 14.999H4.32031V15.25C4.32031 16.53 4.63031 17.736 5.17931 18.8L3.29131 19.554C3.19985 19.5906 3.11649 19.6449 3.04601 19.7138C2.97553 19.7826 2.9193 19.8647 2.88053 19.9553C2.84176 20.0458 2.82121 20.1432 2.82006 20.2417C2.81891 20.3402 2.83717 20.438 2.87381 20.5295C2.91045 20.6209 2.96475 20.7043 3.0336 20.7748C3.10245 20.8453 3.18451 20.9015 3.2751 20.9403C3.36568 20.979 3.46301 20.9996 3.56154 21.0007C3.66006 21.0019 3.75785 20.9836 3.84931 20.947L5.84931 20.147C5.90184 20.126 5.95182 20.0992 5.99831 20.067C6.72339 20.9825 7.64633 21.7219 8.69792 22.2299C9.74951 22.7378 10.9025 23.0011 12.0703 23C13.2382 23.001 14.3912 22.7376 15.4428 22.2294C16.4944 21.7213 17.4173 20.9817 18.1423 20.066C18.1891 20.0983 18.2394 20.1251 18.2923 20.146L20.2923 20.946C20.4751 21.0111 20.676 21.0029 20.8528 20.923C21.0296 20.8431 21.1686 20.6979 21.2405 20.5177C21.3125 20.3375 21.3119 20.1365 21.2387 19.9567C21.1656 19.777 21.0256 19.6327 20.8483 19.554L18.9623 18.799C19.5281 17.7016 19.8223 16.4846 19.8203 15.25V15H22.0703C22.2692 15 22.46 14.921 22.6006 14.7803C22.7413 14.6396 22.8203 14.4489 22.8203 14.25C22.8203 14.0511 22.7413 13.8603 22.6006 13.7196C22.46 13.579 22.2692 13.5 22.0703 13.5H19.8203V12.188C19.8203 11.254 19.5473 10.385 19.0773 9.65497L20.8483 8.94597C21.0256 8.86726 21.1656 8.72289 21.2387 8.54319C21.3119 8.36349 21.3125 8.16244 21.2405 7.98227C21.1686 7.80209 21.0296 7.65682 20.8528 7.57695C20.676 7.49709 20.4751 7.48885 20.2923 7.55397L18.2923 8.35397C18.2002 8.39042 18.1162 8.44481 18.0453 8.51397C17.8187 8.3343 17.576 8.17596 17.3203 8.04097V7.74997C17.3212 7.0393 17.1775 6.33589 16.8978 5.68258C16.618 5.02928 16.2082 4.43977 15.6933 3.94997L17.4563 2.89297ZM5.82031 15.25V12.188C5.82018 11.7693 5.90255 11.3547 6.06272 10.9678C6.22288 10.581 6.4577 10.2295 6.75376 9.93342C7.04982 9.63736 7.40132 9.40254 7.78816 9.24238C8.17501 9.08221 8.58962 8.99984 9.00831 8.99997H15.1323C15.9778 8.99997 16.7887 9.33585 17.3866 9.93372C17.9844 10.5316 18.3203 11.3425 18.3203 12.188V15.25C18.3204 16.7778 17.7609 18.2528 16.7475 19.3963C15.7342 20.5397 14.3371 21.2724 12.8203 21.456V15.25C12.8203 15.0511 12.7413 14.8603 12.6006 14.7196C12.46 14.579 12.2692 14.5 12.0703 14.5C11.8714 14.5 11.6806 14.579 11.54 14.7196C11.3993 14.8603 11.3203 15.0511 11.3203 15.25V21.456C9.80352 21.2724 8.40647 20.5397 7.39311 19.3963C6.37974 18.2528 5.82024 16.7778 5.82031 15.25ZM12.0703 3.99997C13.0303 3.99989 13.9538 4.36797 14.6505 5.02841C15.3472 5.68885 15.7641 6.59134 15.8153 7.54997C15.5895 7.51686 15.3616 7.50015 15.1333 7.49997H9.00631C8.77806 7.49991 8.55011 7.51663 8.32431 7.54997C8.37552 6.59117 8.79256 5.68853 9.48949 5.02807C10.1864 4.3676 11.1101 3.99963 12.0703 3.99997Z"
      />
    </CustomSvgIcon>
  );
}
