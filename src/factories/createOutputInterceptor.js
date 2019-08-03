// @flow

import stripAnsi from 'strip-ansi';
import type {
  OutputInterceptorConfigurationType,
  OutputInterceptorType,
  OutputInterceptorUserConfigurationType,
} from '../types';

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

export default (userConfiguration?: OutputInterceptorUserConfigurationType): OutputInterceptorType => {
  const configuration: OutputInterceptorConfigurationType = {
    interceptStderr: !(userConfiguration && userConfiguration.interceptStderr === false),
    interceptStdout: !(userConfiguration && userConfiguration.interceptStdout === false),
    stripAnsi: !(userConfiguration && userConfiguration.stripAnsi === false),
  };

  const interceptor = async (routine) => {
    let output = '';

    if (configuration.interceptStdout) {
      // $FlowFixMe
      process.stdout.write = (chunk, encoding, callback) => {
        if (typeof chunk === 'string') {
          output += chunk;
        }

        return originalStdoutWrite(chunk, encoding, callback);
      };
    }

    if (configuration.interceptStderr) {
      // $FlowFixMe
      process.stderr.write = (chunk, encoding, callback) => {
        if (typeof chunk === 'string') {
          output += chunk;
        }

        return originalStderrWrite(chunk, encoding, callback);
      };
    }

    const result = await routine();

    // $FlowFixMe
    process.stdout.write = originalStdoutWrite;

    // $FlowFixMe
    process.stderr.write = originalStderrWrite;

    interceptor.output = output;

    if (configuration && configuration.stripAnsi) {
      interceptor.output = stripAnsi(interceptor.output);
    }

    return result;
  };

  interceptor.output = null;

  // $FlowFixMe
  return interceptor;
};
