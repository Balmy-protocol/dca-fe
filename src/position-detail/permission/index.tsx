import React from 'react';
import styled from 'styled-components';
import { Permission, PositionPermission } from 'types';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import { buildEtherscanAddress } from 'utils/etherscan';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { useAppDispatch } from 'hooks/state';
import { addPermission, removePermission } from 'state/position-permissions/actions';
import { COMPANION_ADDRESS, POSITION_VERSION_3, STRING_PERMISSIONS } from 'config/constants';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Address from 'common/address';

interface PositionPermissionProps {
  positionPermission: PositionPermission;
  shouldDisable: boolean;
}

const hasPermission = (permissions: Permission[], permission: Permission) => permissions.indexOf(permission) !== -1;

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

const StyledCard = styled(Card)`
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-grow: 1;
  background: #292929;
`;

const StyledLabel = styled.div`
  display: flex;
`;

const StyledCardContent = styled(CardContent)`
  padding-bottom: 10px !important;
  flex-grow: 1;
  display: flex;
`;

const StyledCardHeader = styled.div`
  display: flex;
  margin-bottom: 5px;
  flex-wrap: wrap;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  *:not(:first-child) {
    margin-left: 4px;
    font-weight: 500;
  }
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 10px;
`;

const HelpTexts = {
  INCREASE: (
    <FormattedMessage
      description="increase permission helptext"
      defaultMessage="This allows the address to increase the funds and modify the duration of your position"
    />
  ),
  REDUCE: (
    <FormattedMessage
      description="reduce permission helptext"
      defaultMessage="This allows the address to decrease the funds and modify the duration of your position"
    />
  ),
  WITHDRAW: (
    <FormattedMessage
      description="withdraw permission helptext"
      defaultMessage="This allows the address to withdraw your swapped liquidity from your position"
    />
  ),
  TERMINATE: (
    <FormattedMessage
      description="terminate permission helptext"
      defaultMessage="This allows the address to terminate your position"
    />
  ),
};

const PositionPermissionItem = ({ positionPermission, shouldDisable }: PositionPermissionProps) => {
  const currentNetwork = useCurrentNetwork();
  const dispatch = useAppDispatch();
  const companionAddress = COMPANION_ADDRESS[POSITION_VERSION_3][currentNetwork.chainId];

  const handlePermissionChange = (permission: Permission, newValue: boolean) => {
    if (newValue) {
      dispatch(addPermission({ operator: positionPermission.operator, permission }));
    } else {
      dispatch(removePermission({ operator: positionPermission.operator, permission }));
    }
  };

  return (
    <StyledCard elevation={2}>
      <StyledCardContent>
        <StyledContentContainer>
          <StyledCardHeader>
            <StyledCardTitleHeader>
              <Typography variant="body2">
                <StyledLink
                  href={buildEtherscanAddress(positionPermission.operator, currentNetwork.chainId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Typography variant="body2" component="span">
                    {positionPermission.operator.toLowerCase() === companionAddress.toLowerCase() ? (
                      'Mean Finance Companion'
                    ) : (
                      <Address address={positionPermission.operator} />
                    )}
                  </Typography>
                  <OpenInNewIcon style={{ fontSize: '1rem' }} />
                </StyledLink>
              </Typography>
            </StyledCardTitleHeader>
          </StyledCardHeader>
          <FormControl component="fieldset">
            <FormGroup>
              {Object.keys(STRING_PERMISSIONS).map((stringPermissionKey: Permission) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(e) => handlePermissionChange(stringPermissionKey, e.target.checked)}
                      size="small"
                      checked={hasPermission(positionPermission.permissions, stringPermissionKey)}
                      color="primary"
                      name={stringPermissionKey}
                      disabled={shouldDisable}
                    />
                  }
                  disabled={shouldDisable}
                  label={
                    <>
                      <Typography variant="body2" component={StyledLabel}>
                        {STRING_PERMISSIONS[stringPermissionKey]}
                        <Tooltip title={HelpTexts[stringPermissionKey]} arrow placement="top">
                          <StyledHelpOutlineIcon fontSize="small" />
                        </Tooltip>
                      </Typography>
                    </>
                  }
                />
              ))}
            </FormGroup>
          </FormControl>
        </StyledContentContainer>
      </StyledCardContent>
    </StyledCard>
  );
};

export default PositionPermissionItem;
