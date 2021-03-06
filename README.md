# output-interceptor

[![GitSpo Mentions](https://gitspo.com/badges/mentions/gajus/slonik?style=flat-square)](https://gitspo.com/mentions/gajus/slonik)
[![Travis build status](http://img.shields.io/travis/gajus/output-interceptor/master.svg?style=flat-square)](https://travis-ci.org/gajus/output-interceptor)
[![Coveralls](https://img.shields.io/coveralls/gajus/output-interceptor.svg?style=flat-square)](https://coveralls.io/github/gajus/output-interceptor)
[![NPM version](http://img.shields.io/npm/v/output-interceptor.svg?style=flat-square)](https://www.npmjs.org/package/output-interceptor)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Intercepts stdout/ stderr.

## Implementation

This module uses [`domain`](https://nodejs.org/api/domain.html) to capture asynchronous function output.

Read [Capturing stdout/ stderr in Node.js using Domain module](https://medium.com/@gajus/capturing-stdout-stderr-in-node-js-using-domain-module-3c86f5b1536d).

## Usage

```js
import {
  createOutputInterceptor
} from 'output-interceptor';

const interceptOutput = createOutputInterceptor();

const main = async () => {
  const result = await interceptOutput(() => {
    console.log('foo');
    console.error('bar');

    return Promise.resolve('baz');
  });

  result === 'baz';

  interceptOutput.output === 'foo\nbar\n';
};

main();

```

### Singleton or dependency injection pattern

It is recommended that you only create one instance of output-interceptor per entire project, e.g.

Create `./routines.js` file with contents:

```js
import {
  createOutputInterceptor
} from 'output-interceptor';

export const interceptOutput = createOutputInterceptor();

```

Then just import the `{interceptOutput}` routine from elsewhere in your codebase.

Alternatively, create an instance of output-interceptor at the top of the program and pass it down using dependency injection.

The benefit of this approach is that you do not create unnecessary wrappers around `process.stderr.write` and `process.stdout.write`.

## API

```js
/**
 * @property interceptStderr Default: true.
 * @property interceptStdout Default: true.
 * @property stripAnsi Default: true.
 */
export type OutputInterceptorUserConfigurationType = {|
  +interceptStderr?: boolean,
  +interceptStdout?: boolean,
  +stripAnsi?: boolean
|};

/**
 * @returns Intercepted output.
 */
type FlushType = () => string;

/**
 * @property output Output produced during the executing of the `routine`.
 */
export type OutputInterceptorType = {|
  <T>(routine: () => Promise<T> | T): Promise<T>,
  output: ''
|};

createOutputInterceptor(userConfiguration?: OutputInterceptorUserConfigurationType): OutputInterceptorType;

```
