import React, { forwardRef } from 'react';
import { Table, TableBody, TableContainer, TableHead, TableRow, Typography } from '../';
import styled from 'styled-components';
import { TableVirtuoso, TableComponents, ItemContent, ScrollerProps, FixedHeaderContent } from 'react-virtuoso';
import { colors } from '../../theme';
import { AnimatedChevronRightIcon } from '../../icons';

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

const StyledBodySmallSemiboldTypo2 = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
    ...rest
  }) => ({
    variant: 'bodySmallSemibold',
    color: colors[mode].typography.typo2,
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
    variant: 'labelRegular',
    color: colors[mode].typography.typo3,
    noWrap: true,
    ...rest,
  })
)``;

const StyledRow = styled(TableRow)<{ onClick?: () => void }>`
  ${({ onClick }) => (!!onClick ? 'cursor: pointer;' : '')}
  &:hover {
    ${AnimatedChevronRightIcon} {
      transition: transform 0.15s ease;
      transform: translateX(${({ theme }) => theme.spacing(1)});
    }
  }
`;

interface VirtualizedTableContext {
  onRowClick?: (rowIndex: number) => void;
}

interface VirtualizedTableProps<Data, Context> {
  data: Data[];
  itemContent: ItemContent<Data, Context>;
  context?: VirtualizedTableContext & Context;
  className?: string;
  fetchMore?: () => void;
  header: FixedHeaderContent;
  VirtuosoTableComponents: TableComponents<Data, Context>;
  height?: React.CSSProperties['height'];
}

function buildVirtuosoTableComponents<D, C extends VirtualizedTableContext>(): TableComponents<D, C> {
  return {
    Scroller: forwardRef<
      HTMLDivElement,
      ScrollerProps & {
        context?: C;
      }
    >(function TableScroller(props, ref) {
      return <TableContainer {...props} ref={ref} />;
    }),
    Table: (props) => <Table sx={{ padding: 0 }} {...props} />,
    TableHead,
    TableRow: ({ item, context, ...props }) => (
      <StyledRow
        onClick={context?.onRowClick ? () => context.onRowClick?.(props['data-index']) : undefined}
        {...props}
      />
    ),
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
  height = '100%',
  className,
}: VirtualizedTableProps<D, C>) {
  return (
    <TableVirtuoso
      data={data}
      style={{ height }}
      components={VirtuosoTableComponents}
      fixedHeaderContent={header}
      itemContent={itemContent}
      endReached={fetchMore}
      context={context}
      className={className}
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
  StyledBodySmallSemiboldTypo2,
  type ItemContent,
  type VirtualizedTableContext,
};
