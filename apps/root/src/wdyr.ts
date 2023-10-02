/// <reference types="@welldone-software/why-did-you-render" />

import React from 'react';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, import/no-extraneous-dependencies, global-require, @typescript-eslint/no-var-requires
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  whyDidYouRender(React, {
    collapseGroups: true,
    trackAllPureComponents: true,
    trackHooks: true,
    exclude: [/Icon$/],
  });
}
