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

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

export default (userConfiguration?: OutputInterceptorUserConfigurationType): OutputInterceptorType => {
  const outputInterceptorInstanceId = Symbol('OUTPUT_INTERCEPTOR');

  const configuration: OutputInterceptorConfigurationType = {
    interceptStderr: !(userConfiguration && userConfiguration.interceptStderr === false),
    interceptStdout: !(userConfiguration && userConfiguration.interceptStdout === false),
    stripAnsi: !(userConfiguration && userConfiguration.stripAnsi === false),
  };

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
    const domain: any = createDomain();

    domain.outputInterceptor = {
      instanceId: outputInterceptorInstanceId,
      output: '',
    };

    const result = await domain.run(() => {
      return routine();
    });

    let output = domain.outputInterceptor.output;

    domain.outputInterceptor = undefined;

    if (configuration && configuration.stripAnsi) {
      output = stripAnsi(output);
    }

    interceptor.output = output;

    return result;
  };

  interceptor.output = null;

  // $FlowFixMe
  return interceptor;
};
