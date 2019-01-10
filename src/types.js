// @flow

/* eslint-disable import/exports-last */

export type DescriptorNameType = 'stderr' | 'stdout';

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

export type OutputInterceptorControllerConfigurationType = {|
  +interceptStderr: boolean,
  +interceptStdout: boolean,
  +stripAnsi: boolean
|};

type OutputInterceptorType = (userConfiguration?: OutputInterceptorControllerUserConfigurationType) => string;

export type OutputInterceptorControllerType = {|
  +clear: () => void,
  +intercept: () => OutputInterceptorType
|};
