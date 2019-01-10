// @flow

/* eslint-disable no-console */

import test from 'ava';
import chalk from 'chalk';
import createOutputInterceptorController from '../../../../src/factories/createOutputInterceptorController';

test('captures stdout output', (t) => {
  const outputInterceptorController = createOutputInterceptorController();

  const flush = outputInterceptorController.intercept();

  console.log('foo');

  const actual = flush();
  const expected = 'foo\n';

  t.true(actual === expected);
});

test('captures stderr output', (t) => {
  const outputInterceptorController = createOutputInterceptorController();

  const flush = outputInterceptorController.intercept();

  console.error('foo');

  const actual = flush();
  const expected = 'foo\n';

  t.true(actual === expected);
});

test('captures merged stream of stdout and stderr', (t) => {
  const outputInterceptorController = createOutputInterceptorController();

  const flush = outputInterceptorController.intercept();

  console.log('foo');
  console.error('bar');
  console.log('foo');
  console.error('bar');

  const actual = flush();
  const expected = 'foo\nbar\nfoo\nbar\n';

  t.true(actual === expected);
});

test('captures only stderr output', (t) => {
  const outputInterceptorController = createOutputInterceptorController({
    interceptStdout: false
  });

  const flush = outputInterceptorController.intercept();

  console.log('foo');
  console.error('bar');

  const actual = flush();
  const expected = 'bar\n';

  t.true(actual === expected);
});

test('captures only stdout output', (t) => {
  const outputInterceptorController = createOutputInterceptorController({
    interceptStderr: false
  });

  const flush = outputInterceptorController.intercept();

  console.log('foo');
  console.error('bar');

  const actual = flush();
  const expected = 'foo\n';

  t.true(actual === expected);
});

test('strips ansi', (t) => {
  const outputInterceptorController = createOutputInterceptorController();

  const flush = outputInterceptorController.intercept();

  console.log(chalk.red('foo'));

  const actual = flush();
  const expected = 'foo\n';

  t.true(actual === expected);
});
