import React from 'react';
import styled from 'styled-components';
import { Permission, Position, TransactionTypes } from '@types';
import find from 'lodash/find';
import Button from '@common/components/button';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import UnstyledAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, { AccordionSummaryProps as AccordionSummaryPropsRaw } from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import { FormattedMessage } from 'react-intl';
import Paper from '@mui/material/Paper';
import { ClaimWithBalance } from '@pages/euler-claim/types';
import { BigNumber } from 'ethers';
import CustomChip from '@common/components/custom-chip';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { formatCurrencyAmount, parseUsdPrice } from '@common/utils/currency';
import { DAI, EULER_4626_TOKENS, USDC, WETH } from '@pages/euler-claim/constants';
import usePositionService from '@hooks/usePositionService';
import useTransactionModal from '@hooks/useTransactionModal';
import useTrackEvent from '@hooks/useTrackEvent';
import { useTransactionAdder } from '@state/transactions/hooks';
import { EULER_CLAIM_MIGRATORS_ADDRESSES, NETWORKS } from '@constants';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import useContractService from '@hooks/useContractService';
import ApproveItem from '@pages/euler-claim/approve-item';
import { solidityKeccak256 } from 'ethers/lib/utils';
import useProviderService from '@hooks/useProviderService';
import useWalletService from '@hooks/useWalletService';
import ClaimItem from '@pages/euler-claim/claim-item';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useWeb3Service from '@hooks/useWeb3Service';
import { useAppDispatch } from '@state/hooks';
import { setNetwork } from '@state/config/actions';
import { useEulerClaimSignature } from '@state/euler-claim/hooks';
import { DCAPermission } from '@mean-finance/sdk';
import { setEulerSignature } from '@state/euler-claim/actions';

import useHasPendingMigratorApprovals from '../hooks/useHasPendingMigratorApprovals';
import useHasPendingPermitManyTransactions from '../hooks/useHasPendingPermitManyTransaction';
import useHasPendingTerminateManyTransactions from '../hooks/useHasPendingTerminateManyTransaction';

const StyledPositionsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: 24px;
`;

const StyledApproveItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledClaimItemsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const StyledTitle = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const StyledContentContainer = styled(Paper)`
  display: flex;
  flex: 1;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
`;

const StyledAccordionContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledSummaryContainer = styled.div`
  display: flex;
  padding: 20px;
  flex-direction: column;
  gap: 10px;
`;

const StyledClaimable = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  align-items: flex-start;
`;

const AccordionDetails = styled(UnstyledAccordionDetails)`
  display: flex;
  flex-direction: column;
`;

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters disabled elevation={0} square {...props} />
))(({ theme }) => ({
  backgroundColor: 'rgb(18, 18, 18) !important',
  border: `1px solid ${theme.palette.divider}`,
  '& .Mui-disabled': {
    opacity: 1,
  },
  '&:last-child': {
    borderBottomRightRadius: '20px',
  },
  '&:first-child': {
    borderTopRightRadius: '20px',
  },
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

interface AccordionSummaryProps extends AccordionSummaryPropsRaw {
  completed: boolean;
  loading?: boolean;
  first?: boolean;
  last?: boolean;
  expanded?: boolean;
}

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={
      props.completed ? <CheckCircleIcon color="success" /> : (props.loading && <CircularProgress size={30} />) || null
    }
    {...props}
  />
))(({ theme, first, last, expanded }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(0deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
  borderTopRightRadius: first ? '20px' : '',
  borderBottomRightRadius: last && !expanded ? '20px' : '',
}));

interface ClaimChecklistProps {
  positions: Position[];
  needsToApproveCompanion: boolean;
  needsToTerminatePositions: boolean;
  needsToClaim: boolean;
  hydratedBalances: ClaimWithBalance;
  rawPrices: Record<string, BigNumber> | undefined;
  allowances: Record<string, Record<string, BigNumber>> | undefined;
  isLoadingBalances: boolean;
  isLoadingAllowances: boolean;
}

const ClaimChecklist = ({
  positions,
  hydratedBalances,
  needsToApproveCompanion,
  needsToTerminatePositions,
  needsToClaim,
  rawPrices,
  allowances,
  isLoadingBalances,
  isLoadingAllowances,
}: ClaimChecklistProps) => {
  let activeStep = 0;

  const positionService = usePositionService();
  const trackEvent = useTrackEvent();
  const errorService = useErrorService();
  const contractService = useContractService();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const hasPendingPermitMany = useHasPendingPermitManyTransactions();
  const hasPendingTerminateMany = useHasPendingTerminateManyTransactions();
  const hasPendingMigratorApproval = useHasPendingMigratorApprovals();
  const signedTerms = useEulerClaimSignature();
  const web3Service = useWeb3Service();
  const dispatch = useAppDispatch();
  const needsToApproveTokens = React.useMemo(
    () =>
      !!allowances &&
      Object.keys(hydratedBalances).some((tokenAddress) =>
        hydratedBalances[tokenAddress].balance.gt(
          allowances[tokenAddress][
            EULER_CLAIM_MIGRATORS_ADDRESSES[tokenAddress as keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES]
          ]
        )
      ),
    [hydratedBalances, allowances]
  );
  const curentNetwork = useCurrentNetwork();
  const step0Completed = curentNetwork.chainId === NETWORKS.mainnet.chainId;
  const step1Completed = step0Completed && signedTerms !== '';
  const step2Completed = step1Completed && !needsToApproveCompanion;
  const step3Completed = step2Completed && !needsToTerminatePositions;
  const step4Completed = step3Completed && !needsToApproveTokens;
  const step5Completed = step4Completed && !needsToClaim;
  const providerService = useProviderService();
  const walletService = useWalletService();

  if (!step0Completed) {
    activeStep = 0;
  }

  if (step0Completed && signedTerms === '') {
    activeStep = 1;
  }

  if (step1Completed && needsToApproveCompanion) {
    activeStep = 2;
  }

  if (step2Completed && needsToTerminatePositions) {
    activeStep = 3;
  }

  if (step3Completed && needsToApproveTokens) {
    activeStep = 4;
  }

  if (step4Completed && needsToClaim) {
    activeStep = 5;
  }

  const summedBalances = React.useMemo(
    () =>
      Object.keys(hydratedBalances).reduce<{ dai: BigNumber; usdc: BigNumber; weth: BigNumber }>(
        (acc, tokenKey) => ({
          dai: acc.dai.add(hydratedBalances[tokenKey].daiToClaim),
          usdc: acc.usdc.add(hydratedBalances[tokenKey].usdcToClaim),
          weth: acc.weth.add(hydratedBalances[tokenKey].wethToClaim),
        }),
        { dai: BigNumber.from(0), usdc: BigNumber.from(0), weth: BigNumber.from(0) }
      ),
    [hydratedBalances]
  );

  const onChangeNetwork = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(NETWORKS.mainnet.chainId, () => {
      dispatch(setNetwork(NETWORKS.mainnet));
      web3Service.setNetwork(NETWORKS.mainnet.chainId);
    });
  };

  const handleTerminateManyPositions = async () => {
    if (!positions.length) return;
    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="eulerClaim terminating many positions"
              defaultMessage="Terminating {positions} positions"
              values={{ positions: positions.length }}
            />
          </Typography>
        ),
      });
      trackEvent('Euler claim - Terminate many submitting');
      const result = await positionService.terminateManyRaw(positions);
      trackEvent('Euler claim - Terminate many submitted');

      addTransaction(result, {
        type: TransactionTypes.eulerClaimTerminateMany,
        typeData: {
          id: result.hash,
          positionIds: positions.map((position) => position.id),
        },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="eulerClaim success terminating many positions"
            defaultMessage="Your positions terminations have been succesfully submitted to the blockchain and will be confirmed soon"
            values={{ positions: positions.length }}
          />
        ),
      });
    } catch (e) {
      // User rejecting transaction
      if (shouldTrackError(e as Error)) {
        trackEvent('Euler claim - Terminate many error');
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error terminating many positions', JSON.stringify(e), {
          positions: positions.map((position) => position.positionId),
        });
      }
      setModalError({
        content: (
          <FormattedMessage
            description="modalErrorEulerClaimTerminatingMany"
            defaultMessage="Error terminating many positions"
          />
        ),
        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const handleSignTermsAndAgreements = async () => {
    const signer = providerService.getSigner();

    const termsAndConditionsHash = '0x427a506ff6e15bd1b7e4e93da52c8ec95f6af1279618a2f076946e83d8294996';
    const termsAndServices = `By signing this Release, clicking "I Agree" on the web interface at euler.finance or executing the EulerClaims smart contract and accepting the redemption, I and any protocol I represent hereby irrevocably and unconditionally release all claims I and any protocol I represent (or other separate related or affiliated legal entities) ("Releasing Parties") may have against Euler Labs, Ltd., the Euler Foundation, the Euler Decentralized Autonomous Organization, members of the Euler Decentralized Autonomous Organization, and any of their agents, affiliates, officers, employees, or principals ("Released Parties") related to this matter whether such claims are known or unknown at this time and regardless of how such claims arise and the laws governing such claims (which shall include but not be limited to any claims arising out of Euler's terms of use).  This release constitutes an express and voluntary binding waiver and relinquishment to the fullest extent permitted by law.  Releasing Parties further agree to indemnify the Released Parties from any and all third-party claims arising or related to this matter, including damages, attorneys fees, and any other costs related to those claims.  If I am acting for or on behalf of a company (or other such separate related or affiliated legal entity), by signing this Release, clicking "I Agree" on the web interface at euler.finance or executing the EulerClaims smart contract and accepting the redemption, I confirm that I am duly authorised to enter into this contract on its behalf.

    This agreement and all disputes relating to or arising under this agreement (including the interpretation, validity or enforcement thereof) will be governed by and subject to the laws of England and Wales and the courts of London, England shall have exclusive jurisdiction to determine any such dispute.  To the extent that the terms of this release are inconsistent with any previous agreement and/or Euler's terms of use, I accept that these terms take priority and, where necessary, replace the previous terms.`;
    try {
      await signer.signMessage(termsAndServices);

      dispatch(
        setEulerSignature(
          solidityKeccak256(['address', 'bytes32'], [walletService.getAccount(), termsAndConditionsHash])
        )
      );
    } catch (e) {
      setModalError({
        content: (
          <FormattedMessage description="modalErrorEulerClaimSignTerms" defaultMessage="You rejected the signature" />
        ),
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        error: { code: e.code, message: e.message, data: e.data },
      });
    }
  };

  const handlePermitManyPositions = async () => {
    if (!positions.length) return;
    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="eulerClaim permit many positions"
              defaultMessage="Giving our Hub Companion permission to close {positions} positions"
              values={{ positions: positions.length }}
            />
          </Typography>
        ),
      });
      const companionAddress = await contractService.getHUBCompanionAddress();
      trackEvent('Euler claim - Permit many submitting');
      const result = await positionService.givePermissionToMultiplePositions(
        positions,
        [DCAPermission.TERMINATE],
        companionAddress
      );
      trackEvent('Euler claim - Permit many submitted');

      addTransaction(result, {
        type: TransactionTypes.eulerClaimPermitMany,
        typeData: {
          id: result.hash,
          positionIds: positions.map((position) => position.id),
          permissions: [Permission.TERMINATE],
          permittedAddress: companionAddress,
        },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="eulerClaim success permit many positions"
            defaultMessage="Giving our Hub Companion permission to close {positions} have been succesfully submitted to the blockchain and will be confirmed soon"
            values={{ positions: positions.length }}
          />
        ),
      });
    } catch (e) {
      // User rejecting transaction
      if (shouldTrackError(e as Error)) {
        trackEvent('Euler claim - permit many error');
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error permit many positions', JSON.stringify(e), {
          positions: positions.map((position) => position.positionId),
        });
      }
      setModalError({
        content: (
          <FormattedMessage
            description="modalErrorEulerClaimPermitMany"
            defaultMessage="Error giving our Hub Companion permission to close many positions"
          />
        ),
        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  return (
    <StyledPositionsContainer>
      <StyledTitle>
        <Typography variant="h5">
          <FormattedMessage description="eulerClaimStepsNeeded title" defaultMessage="Steps to claim your assets" />
        </Typography>
      </StyledTitle>
      <StyledContentContainer variant="outlined">
        <StyledSummaryContainer>
          {step4Completed &&
            summedBalances.dai.lte(BigNumber.from(0)) &&
            summedBalances.usdc.lte(BigNumber.from(0)) &&
            summedBalances.weth.lte(BigNumber.from(0)) && (
              <Typography variant="h6">
                <FormattedMessage description="eulerClaimSummary NoMore" defaultMessage="Nothing more to claim" />
              </Typography>
            )}
          {(summedBalances.dai.gt(BigNumber.from(0)) ||
            summedBalances.usdc.gt(BigNumber.from(0)) ||
            summedBalances.weth.gt(BigNumber.from(0))) && (
            <>
              <Typography variant="h6">
                <FormattedMessage description="eulerClaimSummary" defaultMessage="You will get back" />
              </Typography>
              <StyledClaimable>
                <CustomChip
                  extraText={
                    rawPrices &&
                    rawPrices[DAI.address] &&
                    `(${parseUsdPrice(DAI, summedBalances.dai, rawPrices[DAI.address]).toFixed(2)} USD)`
                  }
                  icon={<ComposedTokenIcon isInChip size="20px" tokenBottom={DAI} />}
                >
                  <Typography variant="body1">{formatCurrencyAmount(summedBalances.dai, DAI, 4)}</Typography>
                </CustomChip>
                <CustomChip
                  extraText={
                    rawPrices &&
                    rawPrices[WETH.address] &&
                    `(${parseUsdPrice(DAI, summedBalances.weth, rawPrices[WETH.address]).toFixed(2)} USD)`
                  }
                  icon={<ComposedTokenIcon isInChip size="20px" tokenBottom={WETH} />}
                >
                  <Typography variant="body1">{formatCurrencyAmount(summedBalances.weth, WETH, 4)}</Typography>
                </CustomChip>
                <CustomChip
                  extraText={
                    rawPrices &&
                    rawPrices[USDC.address] &&
                    `(${parseUsdPrice(USDC, summedBalances.usdc, rawPrices[USDC.address]).toFixed(2)} USD)`
                  }
                  icon={<ComposedTokenIcon isInChip size="20px" tokenBottom={USDC} />}
                >
                  <Typography variant="body1">{formatCurrencyAmount(summedBalances.usdc, USDC, 4)}</Typography>
                </CustomChip>
              </StyledClaimable>
            </>
          )}
        </StyledSummaryContainer>
        <StyledAccordionContainer>
          <Accordion disableGutters expanded={activeStep === 0 && !step0Completed}>
            <AccordionSummary first completed={step0Completed}>
              <Typography variant="h6">
                <FormattedMessage description="eulerClaimConnectToEthereum" defaultMessage="1 - Connect to Ethereum" />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                <FormattedMessage
                  description="eulerClaimConnectToEthereumDetails"
                  defaultMessage="In order to start the Euler claim process you need to connect to the Ethereum network"
                />
              </Typography>
              <Button variant="contained" color="secondary" onClick={onChangeNetwork}>
                <FormattedMessage
                  description="eulerClaimConnectToEthereumButton"
                  defaultMessage="Connect to Ethereum"
                />
              </Button>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters expanded={activeStep === 1 && !step1Completed}>
            <AccordionSummary completed={step1Completed}>
              <Typography variant="h6">
                <FormattedMessage description="eulerClaimSignTerms" defaultMessage="2 - Sign terms and conditions" />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                <FormattedMessage
                  description="eulerClaimSignTermsDetails"
                  defaultMessage="You need to sign the following terms and coditions to move forward:"
                />
              </Typography>
              <Typography variant="body2">
                <FormattedMessage
                  description="eulerClaimSignTermsDetails"
                  defaultMessage={`By signing this Release, clicking "I Agree" on the web interface at euler.finance or executing the EulerClaims smart contract and accepting the redemption, I and any protocol I represent hereby irrevocably and unconditionally release all claims I and any protocol I represent (or other separate related or affiliated legal entities) ("Releasing Parties") may have against Euler Labs, Ltd., the Euler Foundation, the Euler Decentralized Autonomous Organization, members of the Euler Decentralized Autonomous Organization, and any of their agents, affiliates, officers, employees, or principals ("Released Parties") related to this matter whether such claims are known or unknown at this time and regardless of how such claims arise and the laws governing such claims (which shall include but not be limited to any claims arising out of Euler's terms of use).  This release constitutes an express and voluntary binding waiver and relinquishment to the fullest extent permitted by law.  Releasing Parties further agree to indemnify the Released Parties from any and all third-party claims arising or related to this matter, including damages, attorneys fees, and any other costs related to those claims.  If I am acting for or on behalf of a company (or other such separate related or affiliated legal entity), by signing this Release, clicking "I Agree" on the web interface at euler.finance or executing the EulerClaims smart contract and accepting the redemption, I confirm that I am duly authorised to enter into this contract on its behalf.{br}{br}This agreement and all disputes relating to or arising under this agreement (including the interpretation, validity or enforcement thereof) will be governed by and subject to the laws of England and Wales and the courts of London, England shall have exclusive jurisdiction to determine any such dispute.  To the extent that the terms of this release are inconsistent with any previous agreement and/or Euler's terms of use, I accept that these terms take priority and, where necessary, replace the previous terms.`}
                  values={{
                    p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                    br: <br />,
                  }}
                />
              </Typography>
              <Button variant="contained" color="secondary" onClick={handleSignTermsAndAgreements}>
                Sign terms and conditions
              </Button>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters expanded={activeStep === 2 && !step2Completed}>
            <AccordionSummary first completed={step2Completed} loading={hasPendingPermitMany}>
              <Typography variant="h6">
                <FormattedMessage
                  description="eulerClaimApproveCompanion"
                  defaultMessage="3 - Allow Mean Finance to close your positions"
                />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                <FormattedMessage
                  description="eulerClaimApproveCompanionDetails"
                  defaultMessage="In order to receive your Euler claim, you'll need to close your existing positions. In return you'll get a vault token that represents your claim. In this first step, you'll be giving Mean Finance's contract permission to close your positions"
                />
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handlePermitManyPositions}
                disabled={hasPendingPermitMany}
              >
                <FormattedMessage
                  description="eulerClaimPermitPositionsButton"
                  defaultMessage="Give permission for {positions} positions"
                  values={{ positions: positions.length }}
                />
              </Button>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters expanded={activeStep === 3 && !step3Completed}>
            <AccordionSummary completed={step3Completed} loading={hasPendingTerminateMany}>
              <Typography variant="h6">
                <FormattedMessage
                  description="eulerClaimTerminatePositions"
                  defaultMessage="4 - Terminate your open positions"
                />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                <FormattedMessage
                  description="eulerClaimTerminatePositionsDetails"
                  defaultMessage="Now, you'll need to close your existing positions. In return, you'll get some vault tokens that represent your claim over the Euler compensation. Thanks for the previous step, you can close all positions in only one transaction"
                />
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleTerminateManyPositions}
                disabled={hasPendingTerminateMany}
              >
                <FormattedMessage
                  description="eulerClaimTerminatePositionsButton"
                  defaultMessage="Terminate {positions} positions"
                  values={{ positions: positions.length }}
                />
              </Button>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters expanded={activeStep === 4 && !step4Completed}>
            <AccordionSummary
              completed={step4Completed}
              loading={activeStep === 4 && (isLoadingAllowances || hasPendingMigratorApproval)}
            >
              <Typography variant="h6">
                <FormattedMessage
                  description="eulerClaimApproveTokens"
                  defaultMessage="5 - Authorize your tokens to be claimed"
                />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                <FormattedMessage
                  description="eulerClaimApproveTokensDetails"
                  defaultMessage="Now that you have the claim tokens on your wallet, you will need to authorize Euler's claim contract to use them. There is a claim contract for each of the claim tokens, so you'll need to approve each one individually"
                />
              </Typography>
              <StyledApproveItemsContainer>
                {!!allowances &&
                  Object.keys(hydratedBalances).map((tokenKey) => (
                    <ApproveItem
                      key={tokenKey}
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      token={find(EULER_4626_TOKENS, { address: tokenKey })!}
                      value={hydratedBalances[tokenKey].balance}
                      allowance={
                        allowances[tokenKey][
                          EULER_CLAIM_MIGRATORS_ADDRESSES[tokenKey as keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES]
                        ]
                      }
                    />
                  ))}
              </StyledApproveItemsContainer>
            </AccordionDetails>
          </Accordion>
          <Accordion disableGutters expanded={activeStep === 5 && !step5Completed}>
            <AccordionSummary
              expanded={activeStep === 5 && !step5Completed}
              last
              completed={step5Completed}
              loading={activeStep === 5 && isLoadingBalances}
            >
              <Typography variant="h6">
                <FormattedMessage description="eulerClaimClaimTokens" defaultMessage="6 - Claim your tokens" />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                <FormattedMessage
                  description="eulerClaimClaimTokensDetails"
                  defaultMessage="As the last step you will need to redeem for each of your tokens the claimable amount."
                />
              </Typography>
              <StyledClaimItemsContainer>
                {!!hydratedBalances &&
                  Object.keys(hydratedBalances).map((tokenKey) => (
                    <ClaimItem
                      prices={rawPrices}
                      key={tokenKey}
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      token={find(EULER_4626_TOKENS, { address: tokenKey })!}
                      balance={hydratedBalances[tokenKey]}
                      signature={signedTerms}
                    />
                  ))}
              </StyledClaimItemsContainer>
            </AccordionDetails>
          </Accordion>
        </StyledAccordionContainer>
      </StyledContentContainer>
    </StyledPositionsContainer>
  );
};

export default ClaimChecklist;
