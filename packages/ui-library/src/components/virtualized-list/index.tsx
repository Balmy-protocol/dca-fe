import React, { forwardRef } from 'react';
import { ItemContent, Virtuoso } from 'react-virtuoso';
import styled from 'styled-components';

const StyledList = styled.div<{ $gap?: number }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  ${({ theme: { spacing }, $gap = 2 }) => `
    gap: ${spacing($gap)}
  `}
`;

// eslint-disable-next-line @typescript-eslint/ban-types
interface VirtualizedListProps<D, C = {}> {
  data?: readonly D[] | undefined;
  itemContent: ItemContent<D, C>;
  fetchMore?: () => void;
  context: C;
  gap?: number;
}

const VirtualizedList = <D, C>({ data, itemContent, fetchMore, context, gap }: VirtualizedListProps<D, C>) => (
  <Virtuoso
    style={{ height: '100%' }}
    data={data}
    itemContent={itemContent}
    endReached={fetchMore}
    context={context}
    components={{
      List: forwardRef<HTMLDivElement>(function VirtuosoList(props, ref) {
        return <StyledList {...props} ref={ref} $gap={gap} />;
      }),
    }}
  />
);

export { VirtualizedList };
