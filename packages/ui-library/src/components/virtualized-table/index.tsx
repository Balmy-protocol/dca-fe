import React, { forwardRef } from 'react';
import { Table, TableBody, TableContainer, TableHead, TableRow, Typography, Paper } from '../';
import styled from 'styled-components';
import { TableVirtuoso, TableComponents, ItemContent, ScrollerProps, FixedHeaderContent } from 'react-virtuoso';
import { colors } from '../../theme';

const StyledBodySmallRegularTypo2 = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
    ...rest
  }) => ({
    variant: 'bodySmallRegular',
    color: colors[mode].typography.typo2,
    noWrap: true,
    ...rest,
  })
)``;
const StyledBodySmallRegularTypo3 = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
    ...rest
  }) => ({
    variant: 'bodySmallRegular',
    color: colors[mode].typography.typo3,
    noWrap: true,
    ...rest,
  })
)``;

const StyledBodySmallBoldTypo2 = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
    ...rest
  }) => ({
    variant: 'bodySmallBold',
    color: colors[mode].typography.typo3,
    noWrap: true,
    ...rest,
  })
)``;

const StyledBodySmallLabelTypography = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
    ...rest
  }) => ({
    variant: 'bodySmallLabel',
    color: colors[mode].typography.typo3,
    noWrap: true,
    ...rest,
  })
)``;

interface BaseContext {}

interface VirtualizedTableProps<Data, Context> {
  data: Data[];
  itemContent: ItemContent<Data, Context>;
  context?: BaseContext & Context;
  fetchMore?: () => void;
  header: FixedHeaderContent;
  VirtuosoTableComponents: TableComponents<Data, Context>;
  separateRows?: boolean;
}

function buildVirtuosoTableComponents<D, C extends BaseContext>(): TableComponents<D, C> {
  return {
    Scroller: forwardRef<
      HTMLDivElement,
      ScrollerProps & {
        context?: C;
      }
    >(function TableScroller(props, ref) {
      return (
        <TableContainer component={Paper} variant="outlined" sx={{ border: 'none !important' }} {...props} ref={ref} />
      );
    }),
    Table: (props) => <Table sx={{ padding: 0 }} {...props} />,
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
  separateRows = true,
}: VirtualizedTableProps<D, C>) {
  return (
    <TableVirtuoso
      data={data}
      components={VirtuosoTableComponents}
      fixedHeaderContent={header}
      itemContent={itemContent}
      endReached={fetchMore}
      context={context}
      className={!separateRows ? 'noSeparateRows' : ''}
    />
  );
}

export {
  VirtualizedTable,
  StyledBodySmallRegularTypo2,
  StyledBodySmallRegularTypo3,
  StyledBodySmallBoldTypo2,
  buildVirtuosoTableComponents,
  StyledBodySmallLabelTypography,
  ItemContent,
};
