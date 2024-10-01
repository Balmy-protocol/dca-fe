import { getDisplayContact } from '@common/utils/parsing';
import { useAppDispatch } from '@state/hooks';
import { setRecipient } from '@state/transfer/actions';
import { Contact } from 'common-types';
import React from 'react';
import styled from 'styled-components';
import {
  Autocomplete,
  AutocompleteRenderGetTagProps,
  Chip,
  CloseCircleIcon,
  TextField,
  Typography,
  colors,
} from 'ui-library';

const StyledContactChip = styled(Chip)`
  display: flex;
  align-items: center;
  transition: box-shadow 0.3s ease-in-out;
  ${({ theme: { spacing } }) => `
  gap: ${spacing(2)};
  padding: ${spacing(1)} ${spacing(3)};
  border-radius: ${spacing(2)};
  `}
`;

const RenderTags = ({
  tagValues,
  getTagProps,
  handleDelete,
}: {
  tagValues: Contact[];
  getTagProps: AutocompleteRenderGetTagProps;
  handleDelete: () => void;
}) =>
  tagValues.map((option, index) => {
    const { key, ...tagProps } = getTagProps({ index });
    const displayContact = getDisplayContact(option);
    return (
      <StyledContactChip
        color="primary"
        key={key}
        label={
          <Typography variant="bodySemibold" color={({ palette }) => colors[palette.mode].typography.typo1}>
            {displayContact}
          </Typography>
        }
        {...tagProps}
        onDelete={handleDelete}
        deleteIcon={<CloseCircleIcon />}
      />
    );
  });

interface ContactSelectionAutocompleteProps {
  selectedContact: Contact;
  setIsContactSelection: (isContactSelection: boolean) => void;
}

const ContactSelectionAutocomplete = ({
  selectedContact,
  setIsContactSelection,
}: ContactSelectionAutocompleteProps) => {
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    dispatch(setRecipient(''));
    setIsContactSelection(false);
  };

  return (
    <Autocomplete
      options={[]}
      open={false}
      multiple
      defaultValue={selectedContact ? [selectedContact] : []}
      popupIcon={<></>}
      readOnly
      fullWidth
      renderInput={(params) => <TextField {...params} focused={false} onChange={() => {}} helperText=" " />}
      renderTags={(tagValues, getTagProps) => (
        <RenderTags tagValues={tagValues} handleDelete={handleDelete} getTagProps={getTagProps} />
      )}
    />
  );
};

export default ContactSelectionAutocomplete;
