// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type, type Type } from 'arktype';
import { AppType, Domain } from '@larksuiteoapi/node-sdk';

function withParse<T extends Type>(schema: T) {
  return Object.assign(schema, {
    parse: (data: unknown): T['infer'] => {
      const result = schema(data);
      if (result instanceof type.errors) {
        throw new Error(result.summary);
      }
      return result as T['infer'];
    },
  });
}

export const larkOptionSchema = withParse(
  type({
    appId: type('string').default(process.env.LARK_APP_ID || ''),
    appSecret: type('string').default(process.env.LARK_APP_SECRET || ''),
    appType: type('string | number')
      .pipe(val => Number(val))
      .default(Number(process.env.LARK_APP_TYPE || AppType.SelfBuild)),
    domain: type('string | number')
      .pipe(val => Number(val))
      .default(Number(process.env.LARK_DOMAIN || Domain.Feishu)),
  }),
);

export const messageReceiverSchema = withParse(
  type({
    email: 'string[]',
    chatId: 'string[]',
  }).narrow((v, ctx) => {
    if (!v.chatId.length && !v.email.length) {
      return ctx.reject({
        message: 'Neither email nor chatId is empty',
      });
    }
    return true;
  }),
);
