import React from 'react';
import styled from 'styled-components';
import isUndefined from 'lodash/isUndefined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Button from '@common/components/button';
import { FormControl, InputLabel, MenuItem, Select, Slide, TextField, Typography } from 'ui-library';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import useMeanApiService from '@hooks/useMeanApiService';

const StyledFeedbackCardContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0px;
  display: flex;
  align-items: center;
  z-index: 1;
`;

const StyledMainContainer = styled.div`
  display: flex;
  align-items: flex-start;
`;

const StyledFeedbackButtonContainer = styled.div`
  background: linear-gradient(0deg, #3076f6 0%, #b518ff 123.4%);
  color: white;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  border-bottom-right-radius: 10px;
  border-top-right-radius: 10px;
`;

const StyledFormContainer = styled.div`
  display: flex;
  padding: 20px;
  flex-direction: column;
  background: linear-gradient(0deg, #3076f6 0%, #b518ff 123.4%);
  gap: 10px;
  border-bottom-left-radius: 10px;
`;

const ACTIONS = [
  {
    value: 0,
    label: defineMessage({
      description: 'feedbackOptionCreatePosition',
      defaultMessage: 'Creating a position',
    }),
  },
  {
    value: 1,
    label: defineMessage({
      description: 'feedbackOptionModifyPosition',
      defaultMessage: 'Modify a position',
    }),
  },
  {
    value: 2,
    label: defineMessage({
      description: 'feedbackOptionWithdrawPosition',
      defaultMessage: 'Withdraw from a position',
    }),
  },
  {
    value: 3,
    label: defineMessage({
      description: 'feedbackOptionClosePosition',
      defaultMessage: 'Close a position',
    }),
  },
  {
    value: 4,
    label: defineMessage({
      description: 'feedbackOptionTransferPosition',
      defaultMessage: 'Transfer a position',
    }),
  },
  {
    value: 5,
    label: defineMessage({
      description: 'feedbackOptionViewPosition',
      defaultMessage: 'View my position',
    }),
  },
  {
    value: 6,
    label: defineMessage({
      description: 'feedbackOptionOther',
      defaultMessage: 'Other',
    }),
  },
];

const FeedbackCard = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [description, setDescription] = React.useState<string | undefined>(undefined);
  const [action, setAction] = React.useState<number | undefined>(undefined);
  const intl = useIntl();

  const meanApiService = useMeanApiService();

  const onClick = () => {
    if (isUndefined(action) || !description) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    meanApiService.logFeedback(intl.formatMessage(ACTIONS[action].label), description);

    setDescription(undefined);
    setAction(undefined);
    setIsOpen(false);
  };

  return (
    <StyledFeedbackCardContainer>
      <StyledMainContainer>
        <StyledFeedbackButtonContainer onClick={() => setIsOpen(!isOpen)}>
          <Typography variant="body2">
            {isOpen ? <ArrowForwardIosIcon fontSize="inherit" /> : <ArrowBackIosNewIcon fontSize="inherit" />}
          </Typography>
          <Typography variant="body2">
            <FormattedMessage description="feedback" defaultMessage="Feedback" />
          </Typography>
        </StyledFeedbackButtonContainer>
        <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
          <StyledFormContainer>
            <Typography variant="h6">
              <FormattedMessage description="feedbackSelect" defaultMessage="What were you trying to do?" />
            </Typography>
            <FormControl variant="filled">
              <InputLabel id="feedback-action">
                <FormattedMessage description="feedbackEmptyOption" defaultMessage="Select an option" />
              </InputLabel>
              <Select
                value={action}
                labelId="feedback-action"
                id="feedback-action"
                variant="filled"
                onChange={(event) => setAction(event.target.value as number)}
              >
                {ACTIONS.map((actionOption) => (
                  <MenuItem key={actionOption.value} value={actionOption.value}>
                    {intl.formatMessage(actionOption.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="h6">
              <FormattedMessage description="feedbackInput" defaultMessage="How can we improve it?" />
            </Typography>
            <TextField
              id="filled-textarea"
              placeholder={intl.formatMessage(
                defineMessage({
                  description: 'feedbackTextFieldPlaceholder',
                  defaultMessage: 'Tell us how we can improve this for you',
                })
              )}
              multiline
              variant="filled"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              InputProps={{ sx: { paddingTop: '12px' } }}
            />
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              disabled={isUndefined(action) || !description}
              onClick={onClick}
            >
              <FormattedMessage description="feedbackButton" defaultMessage="Submit feedback" />
            </Button>
            <Typography variant="caption">
              <FormattedMessage
                description="feedbackDisclaimer"
                defaultMessage="* We do not collect any extra data than the one you have put here"
              />
            </Typography>
          </StyledFormContainer>
        </Slide>
      </StyledMainContainer>
    </StyledFeedbackCardContainer>
  );
};

export default FeedbackCard;
