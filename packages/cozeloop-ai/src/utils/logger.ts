// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { stringifyVal } from './common';

type LoggerLevel = 'info' | 'debug' | 'warn' | 'error';

export const COZELOOP_LOGGER_TAG = 'CozeLoop';

export interface SimpleLogger {
  (msg: string, level?: LoggerLevel): void;
}

interface PureLogger {
  (...msgs: unknown[]): void;
}

export interface LoopLogger extends PureLogger {
  (...msgs: unknown[]): void;
  info: PureLogger;
  debug: PureLogger;
  warn: PureLogger;
  error: PureLogger;
}

export function createLoopLogger(
  logger?: SimpleLogger,
  tag?: string,
): LoopLogger {
  const infoLogger = buildLogger('info', tag, logger);
  const loopLogger: LoopLogger = (...msgs: unknown[]) => {
    infoLogger(tag, ...msgs);
  };
  loopLogger.info = infoLogger;
  loopLogger.warn = buildLogger('warn', tag, logger);
  loopLogger.error = buildLogger('error', tag, logger);
  loopLogger.debug = buildLogger('debug', tag, logger);

  return loopLogger;
}

function formatMessage(messages: unknown[]) {
  return messages.map(it => stringifyVal(it)).join('');
}

function buildLogger(
  level: LoggerLevel,
  tag?: string,
  logger?: SimpleLogger,
): PureLogger {
  return (...messages: unknown[]) => {
    if (!logger) {
      return;
    }

    const message = `[${COZELOOP_LOGGER_TAG}] ${tag ? `[${tag}] ` : ''}${formatMessage(messages)}`;

    logger(message, level);
  };
}

export const simpleConsoleLogger: SimpleLogger = (message, level) => {
  const TRUNC_SIZE = 512;
  const msg =
    message.length > TRUNC_SIZE
      ? `${message.slice(0, TRUNC_SIZE)}<...>`
      : message;

  switch (level) {
    case 'debug':
      console.debug(msg);
      break;
    case 'error':
      console.error(msg);
      break;
    case 'warn':
      console.warn(msg);
      break;
    case 'info':
    default:
      console.info(msg);
      break;
  }
};

export abstract class LoopLoggable {
  protected _tag: string | undefined;
  protected loopLogger: LoopLogger;

  constructor(logger?: SimpleLogger, tag?: string) {
    this._tag = tag;
    this.loopLogger = createLoopLogger(logger, tag);
  }

  protected updateLogger(logger?: SimpleLogger, tag?: string) {
    this.loopLogger = createLoopLogger(logger, tag ?? this._tag);
  }
}
