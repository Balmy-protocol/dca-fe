import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export interface WithRouterInjectedProps {
  location: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
  params: ReturnType<typeof useParams>;
}

function withRouter(Component: React.ElementType) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function ComponentWithRouterProp(props: any) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    return <Component {...props} router={{ location, navigate, params }} />;
  }

  return ComponentWithRouterProp;
}

export default withRouter;
