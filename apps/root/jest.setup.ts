//
// Copyright 2022 Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */

// TextEncoder / TextDecoder APIs are used by Jose, but are not provided by
// jsdom, all node versions supported provide these via the util module
if (typeof globalThis.TextEncoder === 'undefined' || typeof globalThis.TextDecoder === 'undefined') {
  const utils = require('util');
  globalThis.TextEncoder = utils.TextEncoder;
  // @ts-ignore TextDecoder from util doesn't necessarily conform to that from
  // the Web APIs, but it's good enough:
  globalThis.TextDecoder = utils.TextDecoder;
  // TextEncoder references a Uint8Array constructor different than the global
  // one used by users in tests. The following enforces the same constructor to
  // be referenced by both.
  // FIXME: currently this doesn't work, and must be set in a custom environment.
  globalThis.Uint8Array = Uint8Array;
}
// @ts-ignore
globalThis.BigInt.prototype.toJSON = function () {
  return this.toString();
};
// Needed for bigint parsing
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};
