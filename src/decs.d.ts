declare module 'toformat';
declare module 'eth-provider';
declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;

  export default ReactComponent;
}

declare module '*.woff2' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any;
  export = value;
}
declare module '*.ttf' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any;
  export = value;
}
declare module '*.woff' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any;
  export = value;
}
declare module '*.eot' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any;
  export = value;
}

type Nullable<T> = T | null;
