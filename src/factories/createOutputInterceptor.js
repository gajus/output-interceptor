// @flow

import {
  create as createDomain,
} from 'domain';
import stripAnsi from 'strip-ansi';
import type {
  OutputInterceptorConfigurationType,
  OutputInterceptorType,
  OutputInterceptorUserConfigurationType,
} from '../types';

const originalStderrWrite = process.stderr.write.bind(process.stderr);
const originalStdoutWrite = process.stdout.write.bind(process.stdout);

export default (userConfiguration?: OutputInterceptorUserConfigurationType): OutputInterceptorType => {
  // $FlowFixMe
  process.stderr.write = (chunk, encoding, callback) => {
    const domain: any = process.domain;

    if (domain && domain.outputInterceptor && domain.outputInterceptor.interceptStderr) {
      domain.outputInterceptor.output += chunk;
    }

    return originalStderrWrite(chunk, encoding, callback);
  };

  // $FlowFixMe
  process.stdout.write = (chunk, encoding, callback) => {
    const domain: any = process.domain;

    if (domain && domain.outputInterceptor && domain.outputInterceptor.interceptStdout) {
      domain.outputInterceptor.output += chunk;
    }

    return originalStdoutWrite(chunk, encoding, callback);
  };

  const interceptor = async (routine) => {
    const configuration: OutputInterceptorConfigurationType = {
      interceptStderr: !(userConfiguration && userConfiguration.interceptStderr === false),
      interceptStdout: !(userConfiguration && userConfiguration.interceptStdout === false),
      stripAnsi: !(userConfiguration && userConfiguration.stripAnsi === false),
    };

    const parentDomain: any = process.domain;

    const executionDomain: any = createDomain();

    executionDomain.outputInterceptor = {
      interceptStderr: configuration.interceptStderr,
      interceptStdout: configuration.interceptStdout,
      output: '',
    };

    let routineResult;
    let routineError;

    try {
      routineResult = await executionDomain.run(() => {
        return routine();
      });
    } catch (error) {
      routineError = error;
    }

    let output = executionDomain.outputInterceptor.output;

    executionDomain.outputInterceptor = undefined;

    if (configuration && configuration.stripAnsi) {
      output = stripAnsi(output);
    }

    interceptor.output = output;

    if (parentDomain && parentDomain.outputInterceptor) {
      parentDomain.outputInterceptor.output += output;
    }

    if (routineError) {
      throw routineError;
    }

    return routineResult;
  };

  interceptor.output = null;

  // $FlowFixMe
  return interceptor;
};
