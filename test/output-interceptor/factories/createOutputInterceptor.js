// @flow

/* eslint-disable no-console */

import test from 'ava';
import chalk from 'chalk';
import createOutputInterceptor from '../../../src/factories/createOutputInterceptor';

test('interceptor.output initial value is null', (t) => {
  const intercept = createOutputInterceptor();

  t.true(intercept.output === null);
});

test('captures stdout output', async (t) => {
  const intercept = createOutputInterceptor();

  await intercept(() => {
    console.log('foo');
  });

  const actual = intercept.output;
  const expected = 'foo\n';

  t.true(actual === expected);
});

test('captures stderr output', async (t) => {
  const intercept = createOutputInterceptor();

  await intercept(() => {
    console.error('foo');
  });

  const actual = intercept.output;
  const expected = 'foo\n';

  t.true(actual === expected);
});

test('captures merged stream of stdout and stderr', async (t) => {
  const intercept = createOutputInterceptor();

  await intercept(() => {
    console.log('foo');
    console.error('bar');
    console.log('foo');
    console.error('bar');
  });

  const actual = intercept.output;
  const expected = 'foo\nbar\nfoo\nbar\n';

  t.true(actual === expected);
});

test('captures only stderr output', async (t) => {
  const intercept = createOutputInterceptor({
    interceptStdout: false
  });

  await intercept(() => {
    console.log('foo');
    console.error('bar');
  });

  const actual = intercept.output;
  const expected = 'bar\n';

  t.true(actual === expected);
});

test('captures only stdout output', async (t) => {
  const intercept = createOutputInterceptor({
    interceptStderr: false
  });

  await intercept(() => {
    console.log('foo');
    console.error('bar');
  });

  const actual = intercept.output;
  const expected = 'foo\n';

  t.true(actual === expected);
});

test('strips ansi', async (t) => {
  const intercept = createOutputInterceptor();

  await intercept(() => {
    console.log(chalk.red('foo'));
  });

  const actual = intercept.output;
  const expected = 'foo\n';

  t.true(actual === expected);
});
