declare module '@mui-treasury/styles/select/minimal';
declare module '@mui-treasury/styles/textField/round';
declare module '@mui-treasury/styles/listItem/jupiter' {
  import type { ListItemClassKey } from '@material-ui/core';
  import type { ClassNameMap } from '@material-ui/core/styles/withStyles';
  function useJupiterListItemStyles(): Partial<ClassNameMap<ListItemClassKey>>;
  export { useJupiterListItemStyles };
}
declare module '@mui-treasury/styles/input/search';
declare module 'toformat';
declare module 'react-charts';
declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;

  export default ReactComponent;
}
