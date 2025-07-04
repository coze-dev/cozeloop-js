// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { Command } from 'commander';
import { Client } from '@larksuiteoapi/node-sdk';

import { larkOptionSchema, syncIssueOptionsSchema } from './schema';

function makeIssueMessage() {
  const issue_action = process.env.ISSUE_ACTION;
  const issue_number = process.env.ISSUE_NUMBER;
  const issue_url = process.env.ISSUE_URL;
  const issue_title = process.env.ISSUE_TITLE;
  const issue_body = process.env.ISSUE_BODY;
  const repo_name = process.env.REPO_NAME;

  return JSON.stringify({
    schema: '2.0',
    config: {
      update_multi: true,
      style: {
        text_size: {
          normal_v2: {
            default: 'normal',
            pc: 'normal',
            mobile: 'heading',
          },
        },
      },
    },
    body: {
      direction: 'vertical',
      padding: '12px 12px 12px 12px',
      elements: [
        {
          tag: 'markdown',
          content: [
            `> 仓库：[${repo_name}](https://github.com/${repo_name})\n\n`,
            `<br />${issue_title}  [#${issue_number}](${issue_url})<br />`,
            `${issue_body}\n\n`,
            `<a href="${issue_url}">👉 前往处理</a>`,
          ].join('\n'),
          text_align: 'left',
          text_size: 'normal_v2',
          margin: '0px 0px 0px 0px',
        },
        {
          tag: 'markdown',
          content: '',
          text_align: 'left',
          text_size: 'normal_v2',
          margin: '0px 0px 0px 0px',
        },
      ],
    },
    header: {
      title: {
        tag: 'plain_text',
        content: `📢 Issue #${issue_number} ${issue_action}`,
      },
      subtitle: {
        tag: 'plain_text',
        content: '',
      },
      template: 'blue',
      padding: '12px 12px 12px 12px',
    },
  });
}

async function syncIssue(this: Command) {
  const options = syncIssueOptionsSchema.parse(this.opts());
  const clientOptions = larkOptionSchema.parse(this.opts());

  const client = new Client(clientOptions);
  const content = makeIssueMessage();
  let success = 0;
  const errors: string[] = [];

  const sendMessage = async (type: 'email' | 'chat_id', id: string) => {
    const resp = await client.im.message.create({
      params: {
        receive_id_type: type,
      },
      data: {
        receive_id: id,
        content,
        msg_type: 'interactive',
      },
    });

    if (resp.code === 0) {
      success++;
    } else {
      errors.push(`Error send to ${type}#${id}, errMsg=${resp.msg}`);
    }
  };

  const tasks: Promise<void>[] = [];
  options.email.forEach(it => tasks.push(sendMessage('email', it)));
  options.chatId.forEach(it => tasks.push(sendMessage('chat_id', it)));
  await Promise.allSettled(tasks);

  const result =
    success === tasks.length
      ? '✅ All done'
      : `✅ Success ${success}\n❌ Fail ${errors.length}, errMsg=\n${errors.join('\n')}`;

  console.info(result);
}

export function applySyncIssue(program: Command) {
  program.addCommand(
    new Command('sync-issue')
      .description('Synchronize GitHub issue via lark')
      .option('--email [emails...]', 'email list split by `,`', [])
      .option('--chat-id [chat-ids...]', 'chat id list split by `,`', [])
      .action(syncIssue),
  );
}
