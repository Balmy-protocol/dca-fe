import React, { Component, ErrorInfo, ReactNode } from 'react';
import withRouter, { WithRouterInjectedProps } from '@common/components/withRouter';
import { connect } from 'react-redux';
import type { AppDispatch, RootState } from '@state';
import { setError } from '@state/error/actions';
import styled from 'styled-components';
import { Typography, Link, SickIcon, Button, copyTextToClipboard } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import WalletContext from '@common/components/wallet-context';

const StyledLink = styled(Link)`
  margin: 0px 5px;
  display: inline-flex;
`;

const StyledErrorContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  gap: 10px;
  word-break: break-word;
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
  errorInfo?: ErrorInfo;
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
      errorInfo: undefined,
    };
  }

  public static getDerivedStateFromError(e: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMessage: e.message, errorName: e.name, errorStackTrace: e.stack };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    this.setState({
      ...this.state,
      errorInfo,
    });
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, react/destructuring-assignment
      this.context.web3Service.getErrorService().logError('Uncaught error', error.message, errorInfo);
      // eslint-disable-next-line no-empty
    } catch {}
  }

  public render() {
    const { hasError, errorMessage, errorName, errorStackTrace, errorInfo } = this.state;
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
      const investCreatePageRegex = /invest\/create(?:\/(\w*))?(?:\/(\w*))?(?:\/(\w*))?/;
      const investPositionsPageRegex = /invest\/positions(?:\/(\w*))?(?:\/(\w*))?(?:\/(\w*))?/;
      const earnPageRegex = /earn(?:\/(\w*))?(?:\/(\w*))?(?:\/(\w*))?/;

      if (location.startsWith('/swap')) {
        errorAction = 'Aggregator page';
        const params = swapPageRegex.exec(location) || [];
        const chainId = params[1];
        const from = params[2];
        const to = params[3];

        errorAction = `${errorAction} - ${chainId} - ${from} - ${to}`;
      }
      if (location.startsWith('/invest/create')) {
        errorAction = 'Create page';
        const params = investCreatePageRegex.exec(location) || [];

        const chainId = params[1];
        const from = params[2];
        const to = params[3];

        errorAction = `${errorAction} - ${chainId} - ${from} - ${to}`;
      }
      if (location.startsWith('/invest/positions')) {
        errorAction = 'Positions list page';
      }
      if (investPositionsPageRegex.test(location)) {
        errorAction = 'Positions details page';
      }
      if (earnPageRegex.test(location)) {
        errorAction = 'Earn page';
      }
      const errorMessageToShow = errorMessage || errorMessageProp || (error && error.message);
      const errorInfoToShow = errorInfo && JSON.stringify(errorInfo);
      const errorNameToShow = errorName || errorNameProp || (error && error.name) || 'Unknown Error';
      const errorStackToShow =
        errorStackTrace || errorStackTraceProp || (error && error.stack) || 'Unknown error stack';
      return (
        <StyledErrorContainer>
          <Typography variant="h1Bold">
            <SickIcon fontSize="inherit" />
          </Typography>
          <Typography variant="h3Bold">
            <FormattedMessage description="errorEncounteredOops" defaultMessage="Oooops" />
          </Typography>
          <Typography variant="h4Bold">
            <FormattedMessage
              description="errorEncountered"
              defaultMessage="Seems like we encountered an error we could not handle"
            />
          </Typography>
          {errorMessageToShow && (
            <Typography variant="h5Bold">
              <FormattedMessage
                description="errorEncounteredName"
                defaultMessage="This was due to: {name}"
                values={{
                  name: errorMessageToShow,
                }}
              />
            </Typography>
          )}
          <Typography variant="bodySmallRegular">
            <FormattedMessage description="errorEncounteredDiscordPart1" defaultMessage="Come by to our" />
            <StyledLink href="http://discord.balmy.xyz" target="_blank">
              discord
            </StyledLink>
            <FormattedMessage
              description="errorEncounteredDiscordPart1"
              defaultMessage="let us know you encountered this error, it would be helpful to copy the error log with the button below and paste that in the message"
            />
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() =>
              copyTextToClipboard(
                `\`\`\`${JSON.stringify({
                  errorAction,
                  errorName: errorNameToShow,
                  errorMessage: errorMessageToShow,
                  errorStackTrace: errorStackToShow,
                  errorInfo: errorInfoToShow,
                })}\`\`\``
              )
            }
          >
            <FormattedMessage description="errorEncounteredButtonCopyLog" defaultMessage="COPY ERROR LOG" />
          </Button>
          <Button variant="outlined" color="primary" size="medium" onClick={() => window.location.reload()}>
            <FormattedMessage description="reload" defaultMessage="RELOAD PAGE" />
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
