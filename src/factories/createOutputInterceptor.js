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

export default (userConfiguration?: OutputInterceptorUserConfigurationType): OutputInterceptorType => {
  const outputInterceptorInstanceId = Symbol('OUTPUT_INTERCEPTOR');

  const configuration: OutputInterceptorConfigurationType = {
    interceptStderr: !(userConfiguration && userConfiguration.interceptStderr === false),
    interceptStdout: !(userConfiguration && userConfiguration.interceptStdout === false),
    stripAnsi: !(userConfiguration && userConfiguration.stripAnsi === false),
  };

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);

  if (configuration.interceptStdout) {
    // $FlowFixMe
    process.stdout.write = (chunk, encoding, callback) => {
      const domain: any = process.domain;

      if (domain && domain.outputInterceptor && domain.outputInterceptor.instanceId === outputInterceptorInstanceId) {
        domain.outputInterceptor.output += chunk;
      }

      return originalStdoutWrite(chunk, encoding, callback);
    };
  }

  if (configuration.interceptStderr) {
    // $FlowFixMe
    process.stderr.write = (chunk, encoding, callback) => {
      const domain: any = process.domain;

      if (domain && domain.outputInterceptor && domain.outputInterceptor.instanceId === outputInterceptorInstanceId) {
        domain.outputInterceptor.output += chunk;
      }

      return originalStderrWrite(chunk, encoding, callback);
    };
  }

  const interceptor = async (routine) => {
    if (process.domain) {
      throw new Error('Cannot intercept output within an exiting domain context.');
    }

    const domain: any = createDomain();

    domain.outputInterceptor = {
      instanceId: outputInterceptorInstanceId,
      output: '',
    };

    let routineResult;
    let routineError;

    try {
      routineResult = await domain.run(() => {
        return routine();
      });
    } catch (error) {
      routineError = error;
    }

    let output = domain.outputInterceptor.output;

    domain.outputInterceptor = undefined;

    if (configuration && configuration.stripAnsi) {
      output = stripAnsi(output);
    }

    interceptor.output = output;

    if (routineError) {
      throw routineError;
    }

    return routineResult;
  };

  interceptor.output = null;

  // $FlowFixMe
  return interceptor;
};
