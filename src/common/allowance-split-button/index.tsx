import React from 'react';
import styled from 'styled-components';
import SplitButton, { SplitButtonOptions } from 'common/split-button';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface AllowanceSplitButtonProps {
  onClick: () => void;
  options: SplitButtonOptions;
  text: React.ReactNode;
  symbol: string;
  disabled?: boolean;
}

const StyledTooltip = styled(Tooltip)`
  margin-bottom: 2px;
  margin-left: 5px;
`;

export const AllowanceTooltip = (props: { symbol: string }) => {
  const { symbol } = props;
  return (
    <StyledTooltip
      title={
        <FormattedMessage
          description="Allowance Tooltip"
          defaultMessage="You must give the Mean Finance smart contracts permission to use your {symbol}"
          values={{
            symbol,
          }}
        />
      }
      arrow
      placement="top"
    >
      <HelpOutlineIcon fontSize="small" />
    </StyledTooltip>
  );
};

const AllowanceSplitButton = (props: AllowanceSplitButtonProps) => {
  const { onClick, options, text, disabled, symbol } = props;
  return (
    <SplitButton
      onClick={onClick}
      text={
        <>
          {text}
          <AllowanceTooltip symbol={symbol} />
        </>
      }
      disabled={disabled}
      variant="contained"
      color="primary"
      options={options}
      size="large"
      fullWidth
      block
    />
  );
};

export default AllowanceSplitButton;
