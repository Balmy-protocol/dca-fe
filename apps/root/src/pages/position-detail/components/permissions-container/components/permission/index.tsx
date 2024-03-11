import React from 'react';
import styled from 'styled-components';
import { ChainId, PositionPermission } from '@types';
import {
  Typography,
  Tooltip,
  Link,
  FormControlLabel,
  FormControl,
  FormGroup,
  Checkbox,
  Card,
  CardContent,
  OpenInNewIcon,
  HelpOutlineIcon,
} from 'ui-library';
import { buildEtherscanAddress } from '@common/utils/etherscan';
import { useAppDispatch } from '@hooks/state';
import { addPermission, removePermission } from '@state/position-permissions/actions';
import { isCompanionAddress, STRING_PERMISSIONS } from '@constants';
import { FormattedMessage, useIntl } from 'react-intl';
import Address from '@common/components/address';
import { DCAPermission } from '@mean-finance/sdk';

interface PositionPermissionProps {
  positionPermission: PositionPermission;
  shouldDisable: boolean;
  chainId: ChainId;
}

const hasPermission = (permissions: DCAPermission[], permission: DCAPermission) =>
  permissions.indexOf(permission) !== -1;

const StyledLink = styled(Link)``;

const StyledCard = styled(Card)`
  position: relative;
  display: flex;
  flex-grow: 1;
`;

const StyledLabel = styled.div`
  display: flex;
`;

const StyledCardContent = styled(CardContent)`
  padding-bottom: 10px !important;
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
      defaultMessage="This allows the address to close your position"
    />
  ),
};

const PositionPermissionItem = ({ positionPermission, shouldDisable, chainId }: PositionPermissionProps) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handlePermissionChange = (permission: DCAPermission, newValue: boolean) => {
    if (newValue) {
      dispatch(addPermission({ operator: positionPermission.operator, permission }));
    } else {
      dispatch(removePermission({ operator: positionPermission.operator, permission }));
    }
  };

  const operatorIsCompanion = isCompanionAddress(positionPermission.operator, chainId);

  return (
    <StyledCard elevation={2}>
      <StyledCardContent>
        <StyledContentContainer>
          <StyledCardHeader>
            <StyledCardTitleHeader>
              <Typography variant="bodySmall">
                <StyledLink
                  href={buildEtherscanAddress(positionPermission.operator, chainId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Typography variant="bodySmall" component="span">
                    {operatorIsCompanion.isCompanion ? (
                      `${(operatorIsCompanion.isOldCompanion && 'Old ') || ''}Mean Finance Companion`
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
              {Object.keys(STRING_PERMISSIONS).map((stringPermissionKey: DCAPermission) => (
                <FormControlLabel
                  key={stringPermissionKey}
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
                      <Typography variant="bodySmall" component={StyledLabel}>
                        {intl.formatMessage(STRING_PERMISSIONS[stringPermissionKey])}
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
