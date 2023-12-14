import React from 'react';
import Modal from '@common/components/modal';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Link, Typography } from 'ui-library';

const StyledSuggestMigrateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'};
  `}
  margin: 0px 5px;
`;

const LEDGER_VULN_KEY = 'ledger-vuln-modal-closed';

const LedgedVulnModal = () => {
  const [isOpen, setIsOpen] = React.useState(!localStorage.getItem(LEDGER_VULN_KEY));

  const onClose = () => {
    setIsOpen(false);
    localStorage.setItem(LEDGER_VULN_KEY, 'true');
  };

  return (
    <Modal open={isOpen} onClose={onClose} showCloseButton closeOnBackdrop>
      <StyledSuggestMigrateContainer>
        <Typography variant="body1" textAlign="left">
          <FormattedMessage
            description="ledgerVuln1"
            defaultMessage="
              We want to inform you about a recent security vulnerability identified in a Ledger npm package used by our platform. We've taken immediate steps to address this issue.{br}{br}

              First of all, your funds are safe. We confirm that all funds remain secure and unaffected. Our swift actions ensured there was no compromise to any user's assets.{br}{br}

              Next Steps for Enhanced Security:{br}
              To ensure you are operating with the highest security, we recommend clearing your browser cache. This will help in loading the most updated and secure version of Mean Finance.{br}{br}

              How to Clear Your Cache:{br}{br}

              1- Go to your browser's Settings.{br}
              2- Find and select 'Clear Browsing Data' or a similar option.{br}
              3- Choose to clear 'Cached Images and Files'.{br}{br}

              For detailed updates on the vulnerability and Ledger's ongoing response, please refer to {ledgerTwitter}.{br}{br}

              Thank you for your attention to this matter and for your continued trust in Mean Finance.
            "
            values={{
              p: (chunks: React.ReactNode) => <p>{chunks}</p>,
              br: <br />,
              ledgerTwitter: (
                <StyledLink
                  color="inherit"
                  target="_blank"
                  href="https://twitter.com/Ledger/status/1735291427100455293"
                >
                  <FormattedMessage id="ledgerTwitterLink" defaultMessage="Ledger's official Twitter thread" />
                </StyledLink>
              ),
            }}
          />
        </Typography>
      </StyledSuggestMigrateContainer>
    </Modal>
  );
};

export default LedgedVulnModal;
