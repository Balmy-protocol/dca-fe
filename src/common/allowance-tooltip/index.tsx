import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const StyledTooltip = styled(Tooltip)`
  margin-bottom: 2px;
  margin-left: 5px;
`;

interface AllowanceTooltipProps {
  symbol: string;
}

const AllowanceTooltip = (props: AllowanceTooltipProps) => {
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

export default AllowanceTooltip;
