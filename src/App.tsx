import React from "react";

// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {
  message: string;
}; /* use `interface` if exporting so that consumers can extend */

// Easiest way to declare a Function Component; return type is inferred.
const App : React.FunctionComponent<AppProps> = ({ message = 'Hello World' }: AppProps) => <div>{message}</div>;
export default App;
