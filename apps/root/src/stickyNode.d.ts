declare module 'balmy-fork-react-stickynode' {
  import * as React from 'react';

  export = Sticky;

  /** A performant and comprehensive React sticky component. */
  declare class Sticky extends React.Component<Sticky.Props> {
    static defaultProps: Sticky.Props;

    static STATUS_ORIGINAL: Sticky.StatusCode.STATUS_ORIGINAL;

    static STATUS_RELEASED: Sticky.StatusCode.STATUS_RELEASED;

    static STATUS_FIXED: Sticky.StatusCode.STATUS_FIXED;
  }

  declare namespace Sticky {
    enum StatusCode {
      /** The default status, located at the original position. */
      STATUS_ORIGINAL = 0,

      /**
       * The released status, located at somewhere on document, but not
       * default one.
       */
      STATUS_RELEASED = 1,
      STATUS_FIXED = 2,
    }

    interface Status {
      status: StatusCode;
    }

    interface Props {
      /** The switch to enable or disable Sticky (true by default ). */
      enabled?: boolean | undefined;

      /**
       * The offset from the top of window where the top of the element will
       * be when sticky state is triggered(0 by default ). If it is a selector
       * to a target (via `querySelector()`), the offset will be the height of
       * the target.
       */
      top?: number | string | undefined;

      /**
       * The offset from the top of document which release state will be
       * triggered when the bottom of the element reaches at. If it is a
       * selector to a target (via `querySelector()`), the offset will be the
       * bottom of the target.
       */
      bottomBoundary?: number | string | undefined;

      /** z-index of the sticky */
      innerZ?: number | string | undefined;

      /** Enable the use of CSS3 transforms (`true` by default). */
      enableTransforms?: boolean | undefined;

      /**
       * Class name to be applied to the element when the sticky state is
       * active ('active' by default).
       */
      activeClass?: string | undefined;

      /**
       * Class name to be applied to the inner element ('' by default).
       */
      innerClass?: string | undefined;

      /**
       * Class name to be applied to the inner element when the sticky
       * state is active ('' by default).
       */
      innerActiveClass?: string | undefined;

      /**
       * Class name to be applied to the element independent of the
       * sticky state.
       */
      className?: string | undefined;

      /**
       * Class name to be applied to the element when the sticky state is
       * released ('released' by default).
       */
      releasedClass?: string | undefined;

      /** Callback for when the sticky state changes. */
      onStateChange?: ((status: Status) => void) | undefined;

      /**
       * Callback to indicate when the sticky plugin should freeze position
       * and ignore scroll/resize events.
       */
      shouldFreeze?: (() => boolean) | undefined;

      children: React.ReactNode | ((status: Status) => React.ReactNode);
    }
  }
}
