import Address from '@common/components/address';
import { HackLanding } from '@pages/hacks/types';
import { DateTime } from 'luxon';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BackgroundPaper, ContainerBox, Skeleton, Typography } from 'ui-library';

const StyledBackgroundPaper = styled(BackgroundPaper)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledMetadataItem = styled(ContainerBox).attrs({ gap: 1, flexDirection: 'column' })``;

interface HackLandingMetadataProps {
  hackLanding?: HackLanding;
}

const HackLandingSkeleton = () => (
  <>
    <StyledMetadataItem>
      <Typography variant="h4">
        <Skeleton variant="text" width="6ch" />
      </Typography>
    </StyledMetadataItem>
    <StyledMetadataItem>
      <Typography variant="bodyRegular">
        <Skeleton variant="text" width="15ch" />
      </Typography>
    </StyledMetadataItem>
    <StyledMetadataItem>
      <Typography variant="bodyRegular">
        <Skeleton variant="text" width="15ch" />
      </Typography>
    </StyledMetadataItem>
    <StyledMetadataItem>
      <Typography variant="bodyBold">
        <FormattedMessage defaultMessage="Creator:" description="hacks-landing.metadata.creator" />
      </Typography>
      <StyledMetadataItem>
        <StyledMetadataItem>
          <Typography variant="bodySmallBold">
            <FormattedMessage defaultMessage="Address:" description="hacks-landing.metadata.creator.address" />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton variant="text" width="15ch" />
          </Typography>
        </StyledMetadataItem>
        <StyledMetadataItem>
          <Typography variant="bodySmallBold">
            <FormattedMessage defaultMessage="Twitter:" description="hacks-landing.metadata.creator.twitter" />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton variant="text" width="15ch" />
          </Typography>
        </StyledMetadataItem>
      </StyledMetadataItem>
    </StyledMetadataItem>
    <StyledMetadataItem>
      <Typography variant="bodyBold">
        <FormattedMessage defaultMessage="Created at:" description="hacks-landing.metadata.created-at" />
      </Typography>
      <Typography variant="bodyRegular">
        <Skeleton variant="text" width="15ch" />
      </Typography>
    </StyledMetadataItem>
    <StyledMetadataItem>
      <Typography variant="bodyBold">
        <FormattedMessage defaultMessage="Last updated at:" description="hacks-landing.metadata.updated-at" />
      </Typography>
      <Typography variant="bodyRegular">
        <Skeleton variant="text" width="15ch" />
      </Typography>
    </StyledMetadataItem>
  </>
);

const HackLandingMetadata = ({ hackLanding }: HackLandingMetadataProps) => {
  const isLoading = !hackLanding;

  if (isLoading)
    return (
      <StyledBackgroundPaper>
        <HackLandingSkeleton />
      </StyledBackgroundPaper>
    );

  return (
    <StyledBackgroundPaper>
      <StyledMetadataItem>
        <Typography variant="h4">{hackLanding.metadata.title}</Typography>
      </StyledMetadataItem>
      <StyledMetadataItem>
        <Typography variant="bodyRegular">{hackLanding.metadata.description}</Typography>
      </StyledMetadataItem>
      <StyledMetadataItem>
        <Typography variant="bodyBold">
          <FormattedMessage defaultMessage="Creator:" description="hacks-landing.metadata.creator" />
        </Typography>
        <StyledMetadataItem>
          {!!hackLanding.metadata.creator?.address && (
            <StyledMetadataItem>
              <Typography variant="bodySmallBold">
                <FormattedMessage defaultMessage="Address:" description="hacks-landing.metadata.creator.address" />
              </Typography>
              <Typography variant="bodyRegular">
                <Address address={hackLanding.metadata.creator.address} trimAddress showDetailsOnHover />
              </Typography>
            </StyledMetadataItem>
          )}
          {!!hackLanding.metadata.creator?.twitter && (
            <StyledMetadataItem>
              <Typography variant="bodySmallBold">
                <FormattedMessage defaultMessage="Twitter:" description="hacks-landing.metadata.creator.twitter" />
              </Typography>
              <Typography variant="bodyRegular">{hackLanding.metadata.creator?.twitter}</Typography>
            </StyledMetadataItem>
          )}
        </StyledMetadataItem>
      </StyledMetadataItem>
      <StyledMetadataItem>
        {!!Object.keys(hackLanding.metadata.links || {}).length && (
          <StyledMetadataItem>
            <Typography variant="bodyBold">
              <FormattedMessage defaultMessage="Links:" description="hacks-landing.metadata.links" />
            </Typography>
            {Object.entries(hackLanding.metadata.links || {}).map(([url, label]) => (
              <StyledMetadataItem key={url}>
                <Typography variant="bodySmallBold">{label}</Typography>
                <Typography variant="bodyRegular">{url}</Typography>
              </StyledMetadataItem>
            ))}
          </StyledMetadataItem>
        )}
      </StyledMetadataItem>

      <StyledMetadataItem>
        <Typography variant="bodyBold">
          <FormattedMessage defaultMessage="Created at:" description="hacks-landing.metadata.created-at" />
        </Typography>
        <Typography variant="bodyRegular">{DateTime.fromSeconds(hackLanding.createdAt).toRelative()}</Typography>
      </StyledMetadataItem>
      <StyledMetadataItem>
        <Typography variant="bodyBold">
          <FormattedMessage defaultMessage="Last updated at:" description="hacks-landing.metadata.updated-at" />
        </Typography>
        <Typography variant="bodyRegular">{DateTime.fromSeconds(hackLanding.lastUpdatedAt).toRelative()}</Typography>
      </StyledMetadataItem>
    </StyledBackgroundPaper>
  );
};

export default HackLandingMetadata;
