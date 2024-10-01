import React, { forwardRef } from 'react';
import { Components, ItemContent, Virtuoso } from 'react-virtuoso';
import styled from 'styled-components';
import { ContainerBox } from '../container-box';
import { SPACING } from '../../theme';

const StyledVirtuoso = styled(Virtuoso)<{ $gap?: number }>`
  .virtuoso-list {
    gap: ${({ $gap = 2 }) => SPACING($gap)};
  }
`;

const StyledList = styled(ContainerBox).attrs({
  flex: 1,
  flexDirection: 'column',
})``;

const VirtuosoComponents: Components = {
  List: forwardRef<HTMLDivElement>(function VirtuosoList(props, ref) {
    return <StyledList className="virtuoso-list" {...props} ref={ref} />;
  }),
};

// eslint-disable-next-line @typescript-eslint/ban-types
interface VirtualizedListProps<D, C = {}> {
  data?: readonly D[] | undefined;
  itemContent: ItemContent<D, C>;
  fetchMore?: () => void;
  context: C;
  gap?: number;
}

const VirtualizedList = <D, C>({ data, itemContent, fetchMore, context, gap }: VirtualizedListProps<D, C>) => (
  <StyledVirtuoso
    $gap={gap}
    data={data}
    itemContent={itemContent}
    endReached={fetchMore}
    context={context}
    components={VirtuosoComponents}
  />
);

export { VirtualizedList };
