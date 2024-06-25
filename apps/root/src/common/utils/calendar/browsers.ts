const atcbIsBrowser = () => {
  if (typeof window === 'undefined') {
    return false;
  } else {
    return true;
  }
};
const atcbIsiOS = atcbIsBrowser()
  ? () => {
      if (/iPad|iPhone|iPod/i.test(navigator.userAgent) && !/MSStream/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    }
  : () => {
      return false;
    };
// Android
const atcbIsAndroid = atcbIsBrowser()
  ? () => {
      if (/android/i.test(navigator.userAgent) && !/MSStream/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    }
  : () => {
      return false;
    };
// Chrome
/*const atcbIsChrome = atcbIsBrowser()
    ? () => {
        if (/chrome|chromium|crios|google inc/i.test(navigator.userAgent)) {
          return true;
        } else {
          return false;
        }
      }
    : () => {
        return false;
      };*/
// Safari
const atcbIsSafari = atcbIsBrowser()
  ? () => {
      if (/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    }
  : () => {
      return false;
    };
// Mobile
const atcbIsMobile = () => {
  if (atcbIsAndroid() || atcbIsiOS()) {
    return true;
  } else {
    return false;
  }
};
// WebView (iOS and Android)
const atcbIsWebView = atcbIsBrowser()
  ? () => {
      if (/(; ?wv|(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari))/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    }
  : () => {
      return false;
    };

const atcbDefaultTarget = atcbIsWebView() ? '_system' : '_blank';

const atcbIsProblematicWebView = atcbIsBrowser()
  ? () => {
      if (/(Instagram)/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    }
  : () => {
      return false;
    };

export {
  atcbIsBrowser,
  atcbIsiOS,
  atcbIsAndroid,
  atcbIsSafari,
  atcbIsMobile,
  atcbIsWebView,
  atcbDefaultTarget,
  atcbIsProblematicWebView,
};
