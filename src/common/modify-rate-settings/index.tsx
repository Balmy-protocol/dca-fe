import React from 'react';
import styled from 'styled-components';
import { Position } from 'types';
import FrequencyInput from 'common/frequency-input';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import Button from 'common/button';
import Typography from '@material-ui/core/Typography';
import ArrowLeft from 'assets/svg/atom/arrow-left';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';

const StyledHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 0;
`;

const StyledIconButton = styled(IconButton)`
  margin-right: 5px;
`;

const StyledInputContainer = styled.div`
  flex-grow: 1;
`;

const StyledActionContainer = styled.div`
  flex-grow: 0;
`;

interface ModifyRateSettingsProps {
  position: Position;
  onModifyRate: (frequencyValue: string) => void;
  onClose: () => void;
}

const ModifyRateSettings = ({ position, onModifyRate, onClose }: ModifyRateSettingsProps) => {
  const [frequencyValue, setFrequencyValue] = React.useState(position.remainingSwaps.toString());
  const frequencyType = STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS];
  return (
    <>
      <StyledHeader>
        <StyledIconButton aria-label="close" size="small" onClick={onClose}>
          <ArrowLeft size="20px" />
        </StyledIconButton>
        <Typography variant="h6">
          <FormattedMessage description="change duration" defaultMessage="Change duration" />
        </Typography>
      </StyledHeader>
      <StyledInputContainer>
        <FrequencyInput
          id="frequency-value"
          value={frequencyValue}
          label={frequencyType}
          onChange={setFrequencyValue}
        />
        <Typography variant="body2">
          <FormattedMessage
            description="current days to finish"
            defaultMessage="Current: {remainingDays} {type} left"
            values={{
              remainingDays: position.remainingSwaps.toString(),
              type: frequencyType,
            }}
          />
        </Typography>
      </StyledInputContainer>
      <StyledActionContainer>
        <Button color="secondary" variant="contained" fullWidth onClick={() => onModifyRate(frequencyValue)}>
          <FormattedMessage description="change duration" defaultMessage="Change duration" />
        </Button>
      </StyledActionContainer>
    </>
  );
};
export default ModifyRateSettings;
