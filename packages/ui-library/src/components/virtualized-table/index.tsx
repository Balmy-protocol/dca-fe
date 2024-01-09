import React, { forwardRef } from 'react';
import { Table, TableBody, TableContainer, TableHead, TableRow, Typography, Paper } from '../';
import { colors } from '../../theme';
import styled from 'styled-components';
import { TableVirtuoso, TableComponents, ItemContent, ScrollerProps, FixedHeaderContent } from 'react-virtuoso';

const StyledCellTypography = styled(Typography).attrs({
  variant: 'body',
  noWrap: true,
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
  `}
`;

const StyledCellTypographySmall = styled(Typography).attrs({
  variant: 'bodySmall',
  noWrap: true,
})`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo3};
  `}
`;

interface BaseContext {}

interface VirtualizedTableProps<Data, Context> {
  data: Data[];
  itemContent: ItemContent<Data, Context>;
  context?: BaseContext & Context;
  fetchMore?: () => void;
  header: FixedHeaderContent;
  VirtuosoTableComponents: TableComponents<Data, Context>;
}

function buildVirtuosoTableComponents<D, C extends BaseContext>(): TableComponents<D, C> {
  return {
    Scroller: forwardRef<
      HTMLDivElement,
      ScrollerProps & {
        context?: C;
      }
    >(function TableScroller(props, ref) {
      return <TableContainer component={Paper} {...props} ref={ref} />;
    }),
    Table: (props) => <Table {...props} />,
    TableHead,
    TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
    TableBody: forwardRef<HTMLTableSectionElement>(function VirtuosoTableBody(props, ref) {
      return <TableBody {...props} ref={ref} />;
    }),
  };
}

function VirtualizedTable<D, C>({
  data,
  itemContent,
  context,
  fetchMore,
  header,
  VirtuosoTableComponents,
}: VirtualizedTableProps<D, C>) {
  return (
    <TableVirtuoso
      data={data}
      components={VirtuosoTableComponents}
      fixedHeaderContent={header}
      itemContent={itemContent}
      endReached={fetchMore}
      context={context}
    />
  );
}

export { VirtualizedTable, StyledCellTypography, StyledCellTypographySmall, buildVirtuosoTableComponents, ItemContent };
