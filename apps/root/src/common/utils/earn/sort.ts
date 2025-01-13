import { TableStrategy } from '@pages/earn/components/strategies-table';
import { StrategyColumnConfig, StrategyColumnKeys } from '@pages/earn/components/strategies-table/components/columns';
import { ColumnOrder, StrategiesTableVariants } from '@state/strategies-filters/reducer';

interface OrderInfo<Key extends StrategyColumnKeys> {
  order: ColumnOrder;
  column: Key;
}

function compareValues(
  aValue: string | number | undefined,
  bValue: string | number | undefined,
  order: ColumnOrder
): number {
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  } else if (typeof aValue === 'number' && typeof bValue === 'number') {
    return order === 'asc' ? aValue - bValue : bValue - aValue;
  }
  // If types mismatch or cannot be compared, consider them equal
  return 0;
}

function compareByColumn<Variant extends StrategiesTableVariants, Key extends StrategyColumnKeys>(
  rowA: TableStrategy<Variant>,
  rowB: TableStrategy<Variant>,
  columns: StrategyColumnConfig<Variant>[],
  orderInfo?: OrderInfo<Key>
): number {
  if (!orderInfo) {
    // No more sorting criteria, consider equal
    return 0;
  }

  const { order, column } = orderInfo;
  const config = columns.find((c) => c.key === column);

  if (!config || !config.getOrderValue) {
    // Column config or ordering function not found, consider equal and proceed
    return 0;
  }

  const aVal = config.getOrderValue(rowA);
  const bVal = config.getOrderValue(rowB);

  return compareValues(aVal, bVal, order);
}

export function getComparator<Key extends StrategyColumnKeys, Variant extends StrategiesTableVariants>({
  columns,
  primaryOrder,
  secondaryOrder,
  tertiaryOrder,
  quarterOrder,
}: {
  columns: StrategyColumnConfig<Variant>[];
  primaryOrder: { order: ColumnOrder; column: Key };
  secondaryOrder?: { order: ColumnOrder; column: Key };
  tertiaryOrder?: { order: ColumnOrder; column: Key };
  quarterOrder?: { order: ColumnOrder; column: Key };
}): (a: TableStrategy<Variant>, b: TableStrategy<Variant>) => number {
  return (a, b) => {
    // Compare using primary order first
    let result = compareByColumn(a, b, columns, primaryOrder);
    if (result !== 0) return result;

    // If equal, try secondary
    result = compareByColumn(a, b, columns, secondaryOrder);
    if (result !== 0) return result;

    // If still equal, try tertiary
    result = compareByColumn(a, b, columns, tertiaryOrder);
    if (result !== 0) return result;

    // If still equal, try quarter
    result = compareByColumn(a, b, columns, quarterOrder);
    if (result !== 0) return result;

    // If all sorting criteria are equal, return 0 to indicate equality
    return 0;
  };
}
