// @flow

/* eslint-disable no-console */

import test from 'ava';
import createOutputInterceptorController from '../../../../src/factories/createOutputInterceptorController';

test('removes interceptors', (t) => {
  const outputInterceptorController = createOutputInterceptorController();

  const flush = outputInterceptorController.intercept();

  console.log('foo 0');
  outputInterceptorController.clear();
  console.log('foo 1');

  const actual = flush();
  const expected = 'foo 0\n';

  t.true(actual === expected);
});
