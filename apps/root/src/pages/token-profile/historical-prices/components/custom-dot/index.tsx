import React from 'react';
import { GraphDataItem } from '../..';
import { TransactionEventIncomingTypes } from 'common-types';
import { colors } from 'ui-library';

interface DotProps {
  payload?: GraphDataItem;
  cx: number;
  cy: number;
}

const CustomDot = (props: DotProps) => {
  const { cx, cy, payload } = props;

  if (!payload?.actions.length) return <></>;

  const isOnlyIncoming = payload.actions.every(
    (action) => action.tx.data.tokenFlow === TransactionEventIncomingTypes.INCOMING
  );
  const isOnlyOutgoing = payload.actions.every(
    (action) => action.tx.data.tokenFlow === TransactionEventIncomingTypes.OUTGOING
  );

  if (isOnlyIncoming) {
    return (
      <svg x={cx - 9} y={cy - 9.5} width={18} height={19} viewBox="0 0 18 19">
        <rect y="0.316406" width="18" height="18" rx="9" fill={colors[payload.mode].background.secondary} />
        <path
          d="M9 17.3789C4.5525 17.3789 0.9375 13.7639 0.9375 9.31641C0.9375 4.86891 4.5525 1.25391 9 1.25391C13.4475 1.25391 17.0625 4.86891 17.0625 9.31641C17.0625 13.7639 13.4475 17.3789 9 17.3789ZM9 2.37891C5.175 2.37891 2.0625 5.49141 2.0625 9.31641C2.0625 13.1414 5.175 16.2539 9 16.2539C12.825 16.2539 15.9375 13.1414 15.9375 9.31641C15.9375 5.49141 12.825 2.37891 9 2.37891Z"
          fill={colors[payload.mode].semantic.success.darker}
        />
        <path
          d="M12 9.87891H6C5.6925 9.87891 5.4375 9.62391 5.4375 9.31641C5.4375 9.00891 5.6925 8.75391 6 8.75391H12C12.3075 8.75391 12.5625 9.00891 12.5625 9.31641C12.5625 9.62391 12.3075 9.87891 12 9.87891Z"
          fill={colors[payload.mode].semantic.success.darker}
        />
        <path
          d="M9 12.8789C8.6925 12.8789 8.4375 12.6239 8.4375 12.3164V6.31641C8.4375 6.00891 8.6925 5.75391 9 5.75391C9.3075 5.75391 9.5625 6.00891 9.5625 6.31641V12.3164C9.5625 12.6239 9.3075 12.8789 9 12.8789Z"
          fill={colors[payload.mode].semantic.success.darker}
        />
      </svg>
    );
  } else if (isOnlyOutgoing) {
    return (
      <svg x={cx - 9} y={cy - 9.5} width={18} height={19} viewBox="0 0 18 19">
        <rect y="0.0898438" width="18" height="18" rx="9" fill={colors[payload.mode].background.secondary} />
        <path
          d="M8.93945 17.1523C4.49945 17.1523 0.876953 13.5373 0.876953 9.08984C0.876953 4.64234 4.49945 1.02734 8.93945 1.02734C13.3795 1.02734 17.002 4.64234 17.002 9.08984C17.002 13.5373 13.387 17.1523 8.93945 17.1523ZM8.93945 2.15234C5.11445 2.15234 2.00195 5.26484 2.00195 9.08984C2.00195 12.9148 5.11445 16.0273 8.93945 16.0273C12.7645 16.0273 15.877 12.9148 15.877 9.08984C15.877 5.26484 12.7645 2.15234 8.93945 2.15234Z"
          fill={colors[payload.mode].semantic.error.darker}
        />
        <path
          d="M11.9395 9.65234H5.93945C5.63195 9.65234 5.37695 9.39734 5.37695 9.08984C5.37695 8.78234 5.63195 8.52734 5.93945 8.52734H11.9395C12.247 8.52734 12.502 8.78234 12.502 9.08984C12.502 9.39734 12.2545 9.65234 11.9395 9.65234Z"
          fill={colors[payload.mode].semantic.error.darker}
        />
      </svg>
    );
  } else {
    return (
      <svg x={cx - 9} y={cy - 9.5} width={18} height={18} viewBox="0 0 18 18">
        <g clipPath="url(#clip0_2001_64095)">
          <path
            d="M0 9C0 4.02944 4.02944 0 9 0V18C4.02944 18 0 13.9706 0 9Z"
            fill={colors[payload.mode].background.secondary}
          />
          <path
            d="M8.93945 17.0625C4.49945 17.0625 0.876953 13.4475 0.876953 9C0.876953 4.5525 4.49945 0.9375 8.93945 0.9375C13.3795 0.9375 17.002 4.5525 17.002 9C17.002 13.4475 13.387 17.0625 8.93945 17.0625ZM8.93945 2.0625C5.11445 2.0625 2.00195 5.175 2.00195 9C2.00195 12.825 5.11445 15.9375 8.93945 15.9375C12.7645 15.9375 15.877 12.825 15.877 9C15.877 5.175 12.7645 2.0625 8.93945 2.0625Z"
            fill={colors[payload.mode].semantic.error.darker}
          />
          <path
            d="M7.98134 9.45333H3.12608C2.87725 9.45333 2.6709 9.24698 2.6709 8.99815C2.6709 8.74932 2.87725 8.54297 3.12608 8.54297H7.98134C8.23018 8.54297 8.43652 8.74932 8.43652 8.99815C8.43652 9.24698 8.23018 9.45333 7.98134 9.45333Z"
            fill={colors[payload.mode].semantic.error.darker}
          />
        </g>
        <g clipPath="url(#clip1_2001_64095)">
          <path
            d="M9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18V0Z"
            fill={colors[payload.mode].background.secondary}
          />
          <path
            d="M9 17.0625C4.5525 17.0625 0.9375 13.4475 0.9375 9C0.9375 4.5525 4.5525 0.9375 9 0.9375C13.4475 0.9375 17.0625 4.5525 17.0625 9C17.0625 13.4475 13.4475 17.0625 9 17.0625ZM9 2.0625C5.175 2.0625 2.0625 5.175 2.0625 9C2.0625 12.825 5.175 15.9375 9 15.9375C12.825 15.9375 15.9375 12.825 15.9375 9C15.9375 5.175 12.825 2.0625 9 2.0625Z"
            fill={colors[payload.mode].semantic.success.darker}
          />
          <path
            d="M14.7372 9.45516H9.88194C9.63311 9.45516 9.42676 9.24881 9.42676 8.99998C9.42676 8.75115 9.63311 8.5448 9.88194 8.5448H14.7372C14.986 8.5448 15.1924 8.75115 15.1924 8.99998C15.1924 9.24881 14.986 9.45516 14.7372 9.45516Z"
            fill={colors[payload.mode].semantic.success.darker}
          />
          <path
            d="M12.3097 11.8828C12.0608 11.8828 11.8545 11.6765 11.8545 11.4276V6.57237C11.8545 6.32354 12.0608 6.11719 12.3097 6.11719C12.5585 6.11719 12.7649 6.32354 12.7649 6.57237V11.4276C12.7649 11.6765 12.5585 11.8828 12.3097 11.8828Z"
            fill={colors[payload.mode].semantic.success.darker}
          />
        </g>
        <defs>
          <clipPath id="clip0_2001_64095">
            <path
              d="M0 9C0 4.02944 4.02944 0 9 0V18C4.02944 18 0 13.9706 0 9Z"
              fill={colors[payload.mode].background.secondary}
            />
          </clipPath>
          <clipPath id="clip1_2001_64095">
            <path
              d="M9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18V0Z"
              fill={colors[payload.mode].background.secondary}
            />
          </clipPath>
        </defs>
      </svg>
    );
  }
};

export default CustomDot;
