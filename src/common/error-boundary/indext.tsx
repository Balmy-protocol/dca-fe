import React, { Component, ErrorInfo, ReactNode } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import type { AppDispatch, RootState } from 'state';
import { setError } from 'state/error/actions';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import SickIcon from '@mui/icons-material/Sick';
import Button from 'common/button';
import Link from '@mui/material/Link';

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'};
  `}
  margin: 0px 5px;
`;

const StyledErrorContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  gap: 10px;
`;

interface Props {
  children?: ReactNode;
  errorMessage: string;
  errorName: string;
  errorStackTrace: string;
  hasError: boolean;
  history: { listen: (callback: () => void) => void };
  dismissError: () => void;
}

interface HistoryhProps {
  history: { listen: (callback: () => void) => void };
}

interface State {
  hasError: boolean;
  errorMessage?: string;
  errorStackTrace?: string;
  errorName?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      errorName: '',
      errorStackTrace: '',
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    props.history.listen(() => {
      props.dismissError();
    });
  }

  public static getDerivedStateFromError(e: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMessage: e.message, errorName: e.name, errorStackTrace: e.stack };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }

  copyTextToClipboard(text: string) {
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(text);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigator.clipboard.writeText(text);
  }

  public render() {
    const { hasError, errorMessage, errorName, errorStackTrace } = this.state;
    const {
      children,
      hasError: hasErrorProp,
      errorMessage: errorMessageProp,
      errorName: errorNameProp,
      errorStackTrace: errorStackTraceProp,
    } = this.props;
    if (hasError || hasErrorProp) {
      return (
        <StyledErrorContainer>
          <Typography variant="h1">
            <SickIcon fontSize="inherit" />
          </Typography>
          <Typography variant="h3">
            <FormattedMessage description="errorEncounteredOops" defaultMessage="Oooops" />
          </Typography>
          <Typography variant="h4">
            <FormattedMessage
              description="errorEncountered"
              defaultMessage="Seems like we encountered an error we could not handle"
            />
          </Typography>
          {(errorMessage || errorMessageProp) && (
            <Typography variant="h5">
              <FormattedMessage
                description="errorEncounteredName"
                defaultMessage="This was due to: {name}"
                values={{
                  name: errorMessage || errorMessageProp,
                }}
              />
            </Typography>
          )}
          <Typography variant="body2">
            <FormattedMessage description="errorEncounteredDiscordPart1" defaultMessage="Come by to our" />
            <StyledLink href="http://discord.mean.finance" target="_blank">
              discord
            </StyledLink>
            <FormattedMessage
              description="errorEncounteredDiscordPart1"
              defaultMessage="let us know you encountered this error, it would be helpful to copy the error log with the button below and paste that in the message"
            />
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() =>
              this.copyTextToClipboard(
                `\`\`\`${JSON.stringify({
                  errorName: errorName || errorNameProp,
                  errorMessage: errorMessage || errorMessageProp,
                  errorStackTrace: errorStackTrace || errorStackTraceProp,
                })}\`\`\``
              )
            }
          >
            <Typography variant="h6">
              <FormattedMessage description="errorEncounteredButtonCopyLog" defaultMessage="COPY ERROR LOG" />
            </Typography>
          </Button>
        </StyledErrorContainer>
      );
    }

    return children;
  }
}

const mapStateToProps = (
  { error: { hasError, errorMessage, errorName, errorStackTrace } }: RootState,
  ownProps: HistoryhProps
) => ({
  errorMessage,
  errorName,
  errorStackTrace,
  hasError,
  ...ownProps,
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  dismissError: () => dispatch(setError(null)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ErrorBoundary));
