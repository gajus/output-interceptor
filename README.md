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
  createOutputIntercetorController
} from 'output-interceptor';

const outputInterceptorController = createOutputIntercetorController();

const flush = outputInterceptorController.intercept();

console.log('foo');
console.error('bar')

const output = flush();

output === 'foo\nbar\n';

```

## API

```js
/**
 * @property interceptStderr Default: true.
 * @property interceptStdout Default: true.
 * @property stripAnsi Default: true.
 */
export type OutputInterceptorControllerUserConfigurationType = {|
  +interceptStderr?: boolean,
  +interceptStdout?: boolean,
  +stripAnsi?: boolean
|};

/**
 * @returns Intercepted output.
 */
type FlushType = () => string;

/**
 * @property clear Removes all interceptors.
 * @property intercept Creates output interceptor.
 */
export type OutputInterceptorControllerType = {|
  +clear: () => void,
  +intercept: () => FlushType
|};

createOutputInterceptorController(userConfiguration?: OutputInterceptorControllerUserConfigurationType): OutputInterceptorControllerType;

```
