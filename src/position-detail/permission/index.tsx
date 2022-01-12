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

interface PositionPermissionProps {
  positionPermission: PositionPermission;
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

const PositionPermissionItem = ({ positionPermission }: PositionPermissionProps) => {
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
    <StyledCard variant="outlined">
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
                    />
                  }
                  label={<Typography variant="body2">{STRING_PERMISSIONS[stringPermissionKey]}</Typography>}
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
