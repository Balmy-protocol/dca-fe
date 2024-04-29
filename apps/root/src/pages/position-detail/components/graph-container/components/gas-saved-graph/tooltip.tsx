import React from 'react';
import { Typography } from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import styled from 'styled-components';
import { capitalizeFirstLetter } from '@common/utils/parsing';
import { formatUsdAmount } from '@common/utils/currency';

const StyledPaper = styled.div`
  padding: 16px;
  position: relative;
  overflow: visible;
  border-radius: 20px;
  border: 2px solid;
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
  const intl = useIntl();

  const firstPayload = payload && payload[0];

  if (!firstPayload || !firstPayload.payload) {
    return null;
  }

  const { gasSaved } = firstPayload?.payload;

  return (
    <StyledPaper>
      <Typography variant="bodySmallRegular">{capitalizeFirstLetter(label || '')}</Typography>
      <Typography variant="bodyRegular">
        <FormattedMessage
          description="savedProtocolTooltip"
          // eslint-disable-next-line no-template-curly-in-string
          defaultMessage="${amount} USD saved"
          values={{ amount: formatUsdAmount({ amount: gasSaved, intl }) }}
        />
      </Typography>
    </StyledPaper>
  );
};

export default React.memo(GasSavedTooltip);
