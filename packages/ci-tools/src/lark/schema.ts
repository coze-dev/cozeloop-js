// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { z } from 'zod/v4';
import { AppType, Domain } from '@larksuiteoapi/node-sdk';

export const larkOptionSchema = z.object({
  appId: z.string().prefault(process.env.LARK_APP_ID || ''),
  appSecret: z.string().prefault(process.env.LARK_APP_SECRET || ''),
  appType: z
    .union([z.string(), z.number()])
    .prefault(process.env.LARK_APP_TYPE || AppType.SelfBuild)
    .transform(val => Number(val)),
  domain: z
    .union([z.string(), z.number()])
    .prefault(process.env.LARK_DOMAIN || Domain.Feishu)
    .transform(val => Number(val)),
});

export const syncIssueOptionsSchema = z
  .object({
    email: z.array(z.string()),
    chatId: z.array(z.string()),
  })
  .refine(v => v.chatId.length || v.email.length, {
    error: 'Neither email nor chatId is empty',
  });
