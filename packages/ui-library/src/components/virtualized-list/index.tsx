import React, { forwardRef } from 'react';
import { Components, ItemContent, Virtuoso } from 'react-virtuoso';
import styled from 'styled-components';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  ${({ theme: { spacing } }) => `
    gap: ${spacing(2)}
  `}
`;

const VirtuosoComponents: Components = {
  List: forwardRef<HTMLDivElement>(function VirtuosoList(props, ref) {
    return <StyledList {...props} ref={ref} />;
  }),
};
// eslint-disable-next-line @typescript-eslint/ban-types
interface VirtualizedListProps<D, C = {}> {
  data?: readonly D[] | undefined;
  itemContent: ItemContent<D, C>;
  fetchMore?: () => void;
  context: C;
}

const VirtualizedList = <D, C>({ data, itemContent, fetchMore, context }: VirtualizedListProps<D, C>) => (
  <Virtuoso
    style={{ height: '100%' }}
    data={data}
    itemContent={itemContent}
    endReached={fetchMore}
    context={context}
    components={VirtuosoComponents}
  />
);

export { VirtualizedList };
