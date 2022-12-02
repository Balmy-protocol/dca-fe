declare module 'toformat';
declare module 'eth-provider';
declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;

  export default ReactComponent;
}

type Nullable<T> = T | null;
