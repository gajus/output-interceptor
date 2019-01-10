// @flow

import stripAnsi from 'strip-ansi';
import type {
  DescriptorNameType,
  OutputInterceptorControllerConfigurationType,
  OutputInterceptorControllerType,
  OutputInterceptorControllerUserConfigurationType
} from '../types';
import log from '../Logger';

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

export default (userConfiguration?: OutputInterceptorControllerUserConfigurationType): OutputInterceptorControllerType => {
  const interceptors = [];

  const configuration: OutputInterceptorControllerConfigurationType = {
    interceptStderr: !(userConfiguration && userConfiguration.interceptStderr === false),
    interceptStdout: !(userConfiguration && userConfiguration.interceptStdout === false),
    stripAnsi: !(userConfiguration && userConfiguration.stripAnsi === false)
  };

  // $FlowFixMe
  process.stdout.write = (chunk, encoding, callback) => {
    if (interceptors.length && typeof chunk === 'string') {
      for (const interceptor of interceptors) {
        interceptor(chunk, 'stdout');
      }
    }

    return originalStdoutWrite(chunk, encoding, callback);
  };

  // $FlowFixMe
  process.stderr.write = (chunk, encoding, callback) => {
    if (interceptors.length && typeof chunk === 'string') {
      for (const interceptor of interceptors) {
        interceptor(chunk, 'stderr');
      }
    }

    return originalStderrWrite(chunk, encoding, callback);
  };

  return {
    clear: () => {
      interceptors.splice(0, interceptors.length);
    },
    intercept: () => {
      let stderr = '';
      let stdout = '';
      let output = '';

      const interceptor = (chunk: string, descriptorName: DescriptorNameType) => {
        if (descriptorName === 'stdout') {
          stdout += chunk;
        } else {
          stderr += chunk;
        }

        output += chunk;
      };

      interceptors.push(interceptor);

      log.debug('created new output interceptor; there are %d interceptor(s)', interceptors.length);

      return (): string => {
        interceptors.splice(interceptors.indexOf(interceptor), 1);

        let result = '';

        if (configuration.interceptStdout && !configuration.interceptStderr) {
          result = stdout;
        } else if (!configuration.interceptStdout && configuration.interceptStderr) {
          result = stderr;
        } else if (configuration.interceptStdout && configuration.interceptStderr) {
          result = output;
        }

        if (configuration && configuration.stripAnsi) {
          result = stripAnsi(result);
        }

        return result;
      };
    }
  };
};
