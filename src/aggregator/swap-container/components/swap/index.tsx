import React from 'react';
import { parseUnits } from '@ethersproject/units';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import { SwapOption, Token } from 'types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TokenPicker from 'common/token-picker';
import Button from 'common/button';
import Tooltip from '@mui/material/Tooltip';
import useBalance from 'hooks/useBalance';
import useUsedTokens from 'hooks/useUsedTokens';
import { SUPPORTED_NETWORKS, TRANSACTION_TYPES } from 'config/constants';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import useTransactionModal from 'hooks/useTransactionModal';
import { emptyTokenWithAddress } from 'utils/currency';
import { useTransactionAdder, useHasPendingApproval } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';
import { PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import useAllowance from 'hooks/useAllowance';
import useIsOnCorrectNetwork from 'hooks/useIsOnCorrectNetwork';
import useUsdPrice from 'hooks/useUsdPrice';
import useWalletService from 'hooks/useWalletService';
import useContractService from 'hooks/useContractService';
import useWeb3Service from 'hooks/useWeb3Service';
import useAggregatorService from 'hooks/useAggregatorService';
import SwapFirstStep from '../step1';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
`;

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 10px;
`;

const StyledButton = styled(Button)`
  padding: 10px 18px;
  border-radius: 12px;
`;

interface SwapProps {
  from: Token | null;
  fromValue: string;
  isBuyOrder: boolean;
  toValue: string;
  to: Token | null;
  setFrom: (from: Token) => void;
  setTo: (to: Token) => void;
  setFromValue: (newFromValue: string, updateMode?: boolean) => void;
  setToValue: (newToValue: string, updateMode?: boolean) => void;
  currentNetwork: { chainId: number; name: string };
  selectedRoute: SwapOption | null;
  isLoadingRoute: boolean;
}

const Swap = ({
  from,
  to,
  fromValue,
  toValue,
  setFrom,
  setTo,
  setFromValue,
  setToValue,
  isBuyOrder,
  selectedRoute,
  currentNetwork,
  isLoadingRoute,
}: SwapProps) => {
  const web3Service = useWeb3Service();
  const containerRef = React.useRef(null);
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from || emptyTokenWithAddress('from'));
  const [isLoading, setIsLoading] = React.useState(false);
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const walletService = useWalletService();
  const aggregatorService = useAggregatorService();
  const contractService = useContractService();
  const [balance, , balanceErrors] = useBalance(from);
  const [isOnCorrectNetwork] = useIsOnCorrectNetwork();
  const [usedTokens] = useUsedTokens();

  const hasPendingApproval = useHasPendingApproval(from, web3Service.getAccount(), true);

  const [allowance, , allowanceErrors] = useAllowance(from, true);

  const [usdPrice, isLoadingUsdPrice] = useUsdPrice(
    from,
    (fromValue !== '' && parseUnits(fromValue, from?.decimals)) || null
  );

  const handleApproveToken = async () => {
    if (!from || !to) return;
    const fromSymbol = from.symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="approving token"
              defaultMessage="Approving use of {from}"
              values={{ from: fromSymbol || '' }}
            />
          </Typography>
        ),
      });
      const result = await walletService.approveToken(from, true);
      const hubAddress = await contractService.getHUBCompanionAddress();

      addTransaction(result, {
        type: TRANSACTION_TYPES.APPROVE_TOKEN,
        typeData: {
          token: from,
          addressFor: hubAddress,
        },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success approving token"
            defaultMessage="Approving use of {from} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{ from: fromSymbol || '' }}
          />
        ),
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'Error approving token', error: { code: e.code, message: e.message, data: e.data } });
    }
  };

  const handleSwap = async () => {
    if (!from || !to) return;
    const fromSymbol = from.symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="creating position"
              defaultMessage="Creating a position to swap {from} to {to}"
              values={{ from: fromSymbol || '', to: (to && to.symbol) || '' }}
            />
          </Typography>
        ),
      });
      // const result = await aggregatorService.swap(from, to, fromValue, isBuyOrder);

      // // addTransaction(result, {
      // //   type: TRANSACTION_TYPES.NEW_POSITION,
      // //   typeData: {
      // //     from,
      // //     to,
      // //   },
      // // });
      // setModalSuccess({
      //   hash: result.hash,
      //   content: (
      //     <FormattedMessage
      //       description="success creating position"
      //       defaultMessage="Your position creation to swap {from} to {to} has been succesfully submitted to the blockchain and will be confirmed soon"
      //       values={{ from: fromSymbol || '', to: (to && to.symbol) || '' }}
      //     />
      //   ),
      // });

      setFromValue('', false);
      setToValue('', false);
    } catch (e) {
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({ content: 'Error creating position', error: { code: e.code, message: e.message, data: e.data } });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const startSelectingCoin = (token: Token) => {
    setSelecting(token);
    setShouldShowPicker(true);
  };

  const handleFromValueChange = (newFromValue: string) => {
    if (!from) return;
    setFromValue(newFromValue, true);
  };

  const handleToValueChange = (newToValue: string) => {
    if (!to) return;
    setToValue(newToValue, true);
  };

  const cantFund = from && !!fromValue && !!balance && parseUnits(fromValue, from.decimals).gt(balance);

  const isApproved =
    !from ||
    (from &&
      (!fromValue
        ? true
        : (allowance.allowance &&
            allowance.token.address === from.address &&
            parseUnits(allowance.allowance, from.decimals).gte(parseUnits(fromValue, from.decimals))) ||
          from.address === PROTOCOL_TOKEN_ADDRESS));

  const shouldDisableApproveButton =
    !from ||
    !to ||
    !fromValue ||
    cantFund ||
    !balance ||
    balanceErrors ||
    allowanceErrors ||
    parseUnits(fromValue, from.decimals).lte(BigNumber.from(0));

  const shouldDisableButton = shouldDisableApproveButton || !isApproved;

  const ignoreValues = [...(from ? [from.address] : []), ...(to ? [to.address] : [])];

  const NotConnectedButton = (
    <StyledButton size="large" variant="contained" fullWidth color="error">
      <Typography variant="body1">
        <FormattedMessage description="wrong chainId" defaultMessage="We do not support this chain yet" />
      </Typography>
    </StyledButton>
  );

  const NoWalletButton = (
    <StyledButton size="large" color="primary" variant="contained" fullWidth onClick={() => web3Service.connect()}>
      <Typography variant="body1">
        <FormattedMessage description="connect wallet" defaultMessage="Connect wallet" />
      </Typography>
    </StyledButton>
  );

  const IncorrectNetworkButton = (
    <StyledButton size="large" color="primary" variant="contained" disabled fullWidth>
      <Typography variant="body1">
        <FormattedMessage
          description="incorrect network"
          defaultMessage="Change network to {network}"
          values={{ network: currentNetwork.name }}
        />
      </Typography>
    </StyledButton>
  );

  const ApproveTokenButton = (
    <StyledButton
      size="large"
      variant="contained"
      fullWidth
      color="primary"
      disabled={!!isApproved || hasPendingApproval || isLoading || !!shouldDisableApproveButton}
      onClick={handleApproveToken}
      style={{ pointerEvents: 'all' }}
    >
      <Typography variant="body1">
        {hasPendingApproval ? (
          <FormattedMessage
            description="waiting for approval"
            defaultMessage="Waiting for your {token} to be approved"
            values={{
              token: (from && from.symbol) || '',
            }}
          />
        ) : (
          <FormattedMessage
            description="Allow us to use your coin"
            defaultMessage="Approve {token}"
            values={{
              token: (from && from.symbol) || '',
            }}
          />
        )}
      </Typography>
      <Tooltip title="You only have to do this once per token" arrow placement="top">
        <StyledHelpOutlineIcon fontSize="small" />
      </Tooltip>
    </StyledButton>
  );

  const StartPositionButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableButton || isLoading}
      color="secondary"
      fullWidth
      onClick={() => handleSwap}
    >
      {!isLoading && !isLoadingUsdPrice && (
        <Typography variant="body1">
          <FormattedMessage description="swap agg" defaultMessage="Swap" />
        </Typography>
      )}
      {(isLoading || isLoadingUsdPrice) && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  const NoFundsButton = (
    <StyledButton size="large" color="default" variant="contained" fullWidth disabled>
      <Typography variant="body1">
        <FormattedMessage description="insufficient funds" defaultMessage="Insufficient funds" />
      </Typography>
    </StyledButton>
  );

  const LoadingButton = (
    <StyledButton size="large" color="default" variant="contained" fullWidth disabled>
      <CenteredLoadingIndicator />
    </StyledButton>
  );

  let ButtonToShow;

  if (!web3Service.getAccount()) {
    ButtonToShow = NoWalletButton;
  } else if (!SUPPORTED_NETWORKS.includes(currentNetwork.chainId)) {
    ButtonToShow = NotConnectedButton;
  } else if (isLoading) {
    ButtonToShow = LoadingButton;
  } else if (!isOnCorrectNetwork) {
    ButtonToShow = IncorrectNetworkButton;
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
  } else if (!isApproved && balance && balance.gt(BigNumber.from(0)) && to) {
    ButtonToShow = ApproveTokenButton;
  } else {
    ButtonToShow = StartPositionButton;
  }

  return (
    <StyledPaper variant="outlined" ref={containerRef}>
      <TokenPicker
        shouldShow={shouldShowPicker}
        onClose={() => setShouldShowPicker(false)}
        isFrom={selecting === from}
        onChange={(from && selecting.address === from.address) || selecting.address === 'from' ? setFrom : setTo}
        usedTokens={usedTokens}
        ignoreValues={ignoreValues}
        yieldOptions={[]}
        isLoadingYieldOptions={false}
        otherSelected={(from && selecting.address === from.address) || selecting.address === 'from' ? to : from}
      />
      <SwapFirstStep
        from={from}
        to={to}
        fromValue={fromValue}
        toValue={toValue}
        startSelectingCoin={startSelectingCoin}
        cantFund={cantFund}
        handleFromValueChange={handleFromValueChange}
        handleToValueChange={handleToValueChange}
        balance={balance}
        buttonToShow={ButtonToShow}
        selectedRoute={selectedRoute}
        isBuyOrder={isBuyOrder}
        isLoadingRoute={isLoadingRoute}
      />
    </StyledPaper>
  );
};
export default Swap;
