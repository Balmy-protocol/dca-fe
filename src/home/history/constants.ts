import type { GridColDef } from '@material-ui/data-grid';

export const COLUMNS: GridColDef[] = [
  { field: 'coinFrom', headerName: 'From', type: 'string', flex: 1 },
  { field: 'coinTo', headerName: 'To', type: 'string', flex: 1 },
  { field: 'initialAmmount', headerName: 'Initial ammount', type: 'number', flex: 1 },
  { field: 'exchangedAmmount', headerName: 'Final ammount', type: 'number', flex: 1 },
  { field: 'executedFrom', headerName: 'Started', type: 'date', flex: 1 },
  { field: 'daysSet', headerName: 'Set for', type: 'string', flex: 1 },
];
