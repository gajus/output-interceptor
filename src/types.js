// @flow

/* eslint-disable import/exports-last */

/**
 * @property interceptStderr Default: true.
 * @property interceptStdout Default: true.
 * @property stripAnsi Default: true.
 */
export type OutputInterceptorUserConfigurationType = {|
  +interceptStderr?: boolean,
  +interceptStdout?: boolean,
  +stripAnsi?: boolean,
|};

export type OutputInterceptorConfigurationType = {|
  +interceptStderr: boolean,
  +interceptStdout: boolean,
  +stripAnsi: boolean,
|};

export type OutputInterceptorType = {|
  <T>(routine: () => Promise<T> | T): Promise<T>,
  output: string | null,
|};
