// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { Command } from 'commander';
import { Client } from '@larksuiteoapi/node-sdk';

import { larkOptionSchema } from './schema';

function safeJsonParse<T>(val: string): T | undefined {
  try {
    return JSON.parse(val) as T;
  } catch {
    // no-catch
    return undefined;
  }
}

async function sendMessage(this: Command) {
  const options = larkOptionSchema.parse(this.opts);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- `im.message.create` does not export param type
  const message = safeJsonParse<any>(this.args[0]);
  if (!message) {
    throw new Error('Invalid message body');
  }
  const client = new Client(options);
  const resp = await await client.im.message.create(message);

  if (resp.code !== 0) {
    throw new Error(resp.msg);
  }
}

export function applySendMessage(program: Command) {
  program.addCommand(
    new Command('send-message')
      .description('Send message in JSON via lark')
      .argument('<string>', 'JSON message body to be sent')
      .action(sendMessage),
  );
}
