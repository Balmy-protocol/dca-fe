import Typography from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import styled from 'styled-components';
import { capitalizeFirstLetter } from 'utils/parsing';

const StyledPaper = styled.div`
  padding: 16px;
  position: relative;
  overflow: visible;
  border-radius: 20px;
  border: 2px solid #a5aab5;
  background-color: #1b1b1c;
  display: flex;
  gap: 10px;
  flex-direction: column;
  z-index: 99;
`;

interface GasSavedTooltipProps {
  label?: string;
  payload?: {
    value?: ValueType;
    name?: NameType;
    dataKey?: string | number;
    payload?: {
      gasSaved: number;
    };
  }[];
}

const GasSavedTooltip = (props: GasSavedTooltipProps) => {
  const { payload, label } = props;

  const firstPayload = payload && payload[0];

  if (!firstPayload || !firstPayload.payload) {
    return null;
  }

  const { gasSaved } = firstPayload?.payload;

  return (
    <StyledPaper>
      <Typography variant="body2">{capitalizeFirstLetter(label || '')}</Typography>
      <Typography variant="body1">
        <FormattedMessage
          description="savedProtocolTooltip"
          // eslint-disable-next-line no-template-curly-in-string
          defaultMessage="${amount} USD saved"
          values={{ amount: gasSaved.toFixed(2) }}
        />
      </Typography>
    </StyledPaper>
  );
};

export default React.memo(GasSavedTooltip);
