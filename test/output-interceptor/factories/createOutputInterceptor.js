// @flow

/* eslint-disable no-console */

import test from 'ava';
import delay from 'delay';
import chalk from 'chalk';
import createOutputInterceptor from '../../../src/factories/createOutputInterceptor';

test('interceptor.output initial value is null', (t) => {
  const intercept = createOutputInterceptor();

  t.is(intercept.output, null);
});

test('captures stdout output', async (t) => {
  const intercept = createOutputInterceptor();

  await intercept(() => {
    console.log('foo');
  });

  const actual = intercept.output;
  const expected = 'foo\n';

  t.is(actual, expected);
});

test('captures stderr output', async (t) => {
  const intercept = createOutputInterceptor();

  await intercept(() => {
    console.error('foo');
  });

  const actual = intercept.output;
  const expected = 'foo\n';

  t.is(actual, expected);
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

  t.is(actual, expected);
});

test('captures only stderr output', async (t) => {
  const intercept = createOutputInterceptor({
    interceptStdout: false,
  });

  await intercept(() => {
    console.log('foo');
    console.error('bar');
  });

  const actual = intercept.output;
  const expected = 'bar\n';

  t.is(actual, expected);
});

test('captures only stdout output', async (t) => {
  const intercept = createOutputInterceptor({
    interceptStderr: false,
  });

  await intercept(() => {
    console.log('foo');
    console.error('bar');
  });

  const actual = intercept.output;
  const expected = 'foo\n';

  t.is(actual, expected);
});

test('strips ansi', async (t) => {
  const intercept = createOutputInterceptor();

  await intercept(() => {
    console.log(chalk.red('foo'));
  });

  const actual = intercept.output;
  const expected = 'foo\n';

  t.is(actual, expected);
});

test('distinguishes asynchronous execution domains', async (t) => {
  const intercept = createOutputInterceptor();

  const run = async (domain: string) => {
    await intercept(async () => {
      await delay(Math.random() * 100);

      console.log(domain + ':1');

      await delay(Math.random() * 100);

      console.log(domain + ':2');

      await delay(Math.random() * 100);

      console.log(domain + ':3');
    });

    return intercept.output;
  };

  const run1 = run('foo');
  const run2 = run('bar');
  const run3 = run('baz');

  await Promise.all([
    run1,
    run2,
    run3,
  ]);

  t.is(await run1, 'foo:1\nfoo:2\nfoo:3\n');
  t.is(await run2, 'bar:1\nbar:2\nbar:3\n');
  t.is(await run3, 'baz:1\nbaz:2\nbaz:3\n');
});

test('captures output in case of an error', async (t) => {
  const intercept = createOutputInterceptor();

  // eslint-disable-next-line require-await
  await t.throwsAsync(intercept(async () => {
    console.log('foo');

    throw new Error('test');
  }));

  const actual = intercept.output;
  const expected = 'foo\n';

  t.is(actual, expected);
});

test('works as expected when multiple interceptors are constructed simultaneously', async (t) => {
  createOutputInterceptor();

  const intercept = createOutputInterceptor();

  createOutputInterceptor();

  // eslint-disable-next-line require-await
  await intercept(async () => {
    console.log('foo');
  });

  t.is(intercept.output, 'foo\n');
});
