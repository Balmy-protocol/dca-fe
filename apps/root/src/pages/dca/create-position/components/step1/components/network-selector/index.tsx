import React from 'react';
import { Typography, Chip, MenuItem, Select } from 'ui-library';
import { toToken } from '@common/utils/currency';
import find from 'lodash/find';
import TokenIcon from '@common/components/token-icon';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { getGhTokenListLogoUrl, NETWORKS, SUPPORTED_NETWORKS_DCA } from '@constants';
import styled from 'styled-components';
import useSelectedNetwork from '@hooks/useSelectedNetwork';

export const StyledNetworkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const StyledNetworkButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

type Props = {
  onChangeNetwork: (chainId: number) => void;
};

const NetworkSelector = ({ onChangeNetwork }: Props) => {
  const currentNetwork = useSelectedNetwork();
  const intl = useIntl();

  return (
    <StyledNetworkContainer>
      <Typography variant="body1">
        <FormattedMessage description="supportedNetworks" defaultMessage="Choose network:" />
      </Typography>
      <StyledNetworkButtonsContainer>
        <Select
          id="choose-network"
          fullWidth
          value={currentNetwork.chainId}
          onChange={(evt) => onChangeNetwork(Number(evt.target.value))}
          placeholder={intl.formatMessage(
            defineMessage({ defaultMessage: 'Choose network', description: 'supportedNetworks' })
          )}
          renderValue={(selected) => {
            if (!SUPPORTED_NETWORKS_DCA.includes(selected)) {
              return (
                <em>
                  <FormattedMessage description="supportedNetworks" defaultMessage="Select network" />
                </em>
              );
            }

            const foundNetwork = find(NETWORKS, { chainId: selected });

            if (!foundNetwork) {
              return null;
            }

            return (
              <>
                <TokenIcon
                  size="20px"
                  token={toToken({
                    address: foundNetwork?.mainCurrency,
                    chainId: selected,
                    logoURI: getGhTokenListLogoUrl(selected, 'logo'),
                  })}
                />
                {foundNetwork.name}
                {foundNetwork.testnet && (
                  <Chip
                    label={<FormattedMessage description="testnet" defaultMessage="Testnet" />}
                    size="small"
                    color="warning"
                  />
                )}
              </>
            );
          }}
          size="small"
          SelectDisplayProps={{ style: { display: 'flex', alignItems: 'center', gap: '5px' } }}
        >
          {SUPPORTED_NETWORKS_DCA.map((network) => {
            const foundNetwork = find(NETWORKS, { chainId: network });

            if (!foundNetwork) {
              return null;
            }

            return (
              <MenuItem
                key={foundNetwork.chainId}
                sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                value={network}
              >
                <TokenIcon
                  size="20px"
                  token={toToken({
                    address: foundNetwork?.mainCurrency,
                    chainId: network,
                    logoURI: getGhTokenListLogoUrl(network, 'logo'),
                  })}
                />
                {foundNetwork.name}
                {foundNetwork.testnet && (
                  <Chip
                    label={<FormattedMessage description="testnet" defaultMessage="Testnet" />}
                    size="small"
                    color="warning"
                  />
                )}
              </MenuItem>
            );
          })}
        </Select>
      </StyledNetworkButtonsContainer>
    </StyledNetworkContainer>
  );
};

export default NetworkSelector;
