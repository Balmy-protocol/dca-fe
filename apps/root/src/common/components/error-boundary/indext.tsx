import React, { Component, ErrorInfo, ReactNode } from 'react';
import withRouter, { WithRouterInjectedProps } from '@common/components/withRouter';
import { connect } from 'react-redux';
import type { AppDispatch, RootState } from '@state';
import { setError } from '@state/error/actions';
import styled from 'styled-components';
import { Typography, Link, SickIcon, Button } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import WalletContext from '@common/components/wallet-context';

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
  error: Error | null;
}

interface HistoryhProps {
  router: WithRouterInjectedProps;
  error: Error | null;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
  errorStackTrace?: string;
  errorName?: string;
}

class ErrorBoundary extends Component<Props, State> {
  // eslint-disable-next-line react/static-property-placement
  static contextType = WalletContext;

  // eslint-disable-next-line react/static-property-placement
  declare context: React.ContextType<typeof WalletContext>;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      errorName: '',
      errorStackTrace: '',
    };
  }

  public static getDerivedStateFromError(e: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMessage: e.message, errorName: e.name, errorStackTrace: e.stack };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, react/destructuring-assignment
      this.context.web3Service.getErrorService().logError('Uncaught error', error.message, errorInfo);
      // eslint-disable-next-line no-empty
    } catch {}
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
      error,
    } = this.props;

    const actuallyHasError = hasError || hasErrorProp || !!error;

    if (actuallyHasError) {
      const location = window.location.pathname;
      let errorAction = 'Other';
      const swapPageRegex = /swap(?:\/(\w*))?(?:\/(\w*))?(?:\/(\w*))?/;
      const createPageRegex = /create(?:\/(\w*))?(?:\/(\w*))?(?:\/(\w*))?/;
      const positionPageRegex = /(\d+)\/positions\/(\d+)\/(\d+)/;

      if (location.startsWith('/swap')) {
        errorAction = 'Aggregator page';
        const params = swapPageRegex.exec(location) || [];
        const chainId = params[1];
        const from = params[2];
        const to = params[3];

        errorAction = `${errorAction} - ${chainId} - ${from} - ${to}`;
      }
      if (location.startsWith('/create')) {
        errorAction = 'Create page';
        const params = createPageRegex.exec(location) || [];

        const chainId = params[1];
        const from = params[2];
        const to = params[3];

        errorAction = `${errorAction} - ${chainId} - ${from} - ${to}`;
      }
      if (location.startsWith('/positions')) {
        errorAction = 'Positions list page';
      }
      if (positionPageRegex.test(location)) {
        errorAction = 'Positions details page';
      }
      const errorMessageToShow = errorMessage || errorMessageProp || (error && error.message);
      const errorNameToShow = errorName || errorNameProp || (error && error.name) || 'Unknown Error';
      const errorStackToShow =
        errorStackTrace || errorStackTraceProp || (error && error.stack) || 'Unknown error stack';
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
          {errorMessageToShow && (
            <Typography variant="h5">
              <FormattedMessage
                description="errorEncounteredName"
                defaultMessage="This was due to: {name}"
                values={{
                  name: errorMessageToShow,
                }}
              />
            </Typography>
          )}
          <Typography variant="bodySmall">
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
                  errorAction,
                  errorName: errorNameToShow,
                  errorMessage: errorMessageToShow,
                  errorStackTrace: errorStackToShow,
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

ErrorBoundary.contextType = WalletContext;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ErrorBoundary));
