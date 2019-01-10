# output-interceptor

[![Travis build status](http://img.shields.io/travis/gajus/output-interceptor/master.svg?style=flat-square)](https://travis-ci.org/gajus/output-interceptor)
[![Coveralls](https://img.shields.io/coveralls/gajus/output-interceptor.svg?style=flat-square)](https://coveralls.io/github/gajus/output-interceptor)
[![NPM version](http://img.shields.io/npm/v/output-interceptor.svg?style=flat-square)](https://www.npmjs.org/package/output-interceptor)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Intercepts stdout/ stderr.

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
