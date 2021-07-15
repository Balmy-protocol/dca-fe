import React from 'react';
import styled from 'styled-components';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { Position } from 'types';
import FrequencyInput from 'common/frequency-input';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import Button from 'common/button';
import Typography from '@material-ui/core/Typography';
import ArrowLeft from 'assets/svg/atom/arrow-left';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';
import { BigNumber } from 'ethers';

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

interface modifySwapsSettingsProps {
  position: Position;
  onModifySwaps: (frequencyValue: string) => void;
  onClose: () => void;
}

const modifySwapsSettings = ({ position, onModifySwaps, onClose }: modifySwapsSettingsProps) => {
  const [frequencyValue, setFrequencyValue] = React.useState(position.remainingSwaps.toString());
  const frequencyType =
    STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].plural;

  const hasError = frequencyValue && BigNumber.from(frequencyValue).lte(BigNumber.from(0));

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
          error={!!hasError ? 'Value must be greater than 0' : ''}
          value={frequencyValue}
          label={position.swapInterval.toString()}
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
        <Button
          color="secondary"
          variant="contained"
          fullWidth
          disabled={!frequencyValue || hasError}
          onClick={() => onModifySwaps(frequencyValue)}
        >
          <FormattedMessage description="change duration" defaultMessage="Change duration" />
        </Button>
      </StyledActionContainer>
    </>
  );
};
export default modifySwapsSettings;
