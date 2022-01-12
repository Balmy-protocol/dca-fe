import React from 'react';
import styled from 'styled-components';
import { Permission, PositionPermission } from 'types';

import CallMadeIcon from '@material-ui/icons/CallMade';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import { buildEtherscanAddress } from 'utils/etherscan';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { useAppDispatch } from 'hooks/state';
import { addPermission, removePermission } from 'state/position-permissions/actions';
import { STRING_PERMISSIONS } from 'config/constants';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

interface PositionPermissionProps {
  positionPermission: PositionPermission;
  shouldDisable: boolean;
}

const hasPermission = (permissions: Permission[], permission: Permission) => permissions.indexOf(permission) !== -1;

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.type === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

const StyledCard = styled(Card)`
  margin: 10px;
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-grow: 1;
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
                    {positionPermission.operator}
                  </Typography>
                  <CallMadeIcon style={{ fontSize: '1rem' }} />
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
