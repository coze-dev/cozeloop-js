// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { Command } from 'commander';
import { Client } from '@larksuiteoapi/node-sdk';

import { larkOptionSchema, messageReceiverSchema } from './schema';

// eslint-disable-next-line max-lines-per-function -- skip
function makePrMessage() {
  const repo_name = process.env.REPO_NAME;
  const pr_action = process.env.PR_ACTION;
  const pr_url = process.env.PR_URL;
  const pr_number = process.env.PR_NUMBER;
  const pr_title = process.env.PR_TITLE;
  const pr_sender = process.env.PR_SENDER;
  const pr_source_owner = process.env.PR_SOURCE_OWNER;
  const pr_source_ref = process.env.PR_SOURCE_REF;
  const pr_target_owner = process.env.PR_TARGET_OWNER;
  const pr_target_ref = process.env.PR_TARGET_REF;
  const pr_merged = process.env.PR_MERGED;

  const title =
    pr_action === 'closed' && pr_merged === 'true'
      ? `🎉 PR #${pr_number} merged`
      : `📢 PR #${pr_number} ${pr_action}`;

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
            `<br />${pr_title}  [#${pr_number}](${pr_url})<br />`,
            `发起人：${pr_sender}`,
          ].join('\n'),
          text_align: 'left',
          text_size: 'normal_v2',
          margin: '0px 0px 0px 0px',
        },
        {
          tag: 'column_set',
          horizontal_spacing: '8px',
          horizontal_align: 'left',
          columns: [
            {
              tag: 'column',
              width: 'weighted',
              elements: [
                {
                  tag: 'markdown',
                  content: `\`${pr_source_owner}:${pr_source_ref}\``,
                  text_align: 'left',
                  text_size: 'normal_v2',
                  margin: '0px 0px 0px 0px',
                },
              ],
              vertical_align: 'top',
              weight: 1,
            },
            {
              tag: 'column',
              width: 'weighted',
              elements: [
                {
                  tag: 'div',
                  text: {
                    tag: 'plain_text',
                    content: '→',
                    text_size: 'normal_v2',
                    text_align: 'center',
                    text_color: 'default',
                  },
                  margin: '0px 0px 0px 0px',
                },
              ],
              vertical_align: 'top',
              weight: 1,
            },
            {
              tag: 'column',
              width: 'weighted',
              elements: [
                {
                  tag: 'markdown',
                  content: `\`${pr_target_owner}:${pr_target_ref}\``,
                  text_align: 'left',
                  text_size: 'normal_v2',
                  margin: '0px 0px 0px 0px',
                },
              ],
              vertical_align: 'top',
              weight: 1,
            },
          ],
          margin: '0px 0px 0px 0px',
        },
        {
          tag: 'markdown',
          content: `<a href="${pr_url}">👉 前往查看</a>`,
          text_align: 'left',
          text_size: 'normal_v2',
          margin: '0px 0px 0px 0px',
        },
      ],
    },
    header: {
      title: {
        tag: 'plain_text',
        content: title,
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

async function syncPr(this: Command) {
  const options = messageReceiverSchema.parse(this.opts());
  const clientOptions = larkOptionSchema.parse(this.opts());
  const client = new Client(clientOptions);
  const content = makePrMessage();

  let success = 0;

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

    success += resp.code === 0 ? 1 : 0;
  };

  const tasks: Promise<void>[] = [];
  options.email.forEach(it => tasks.push(sendMessage('email', it)));
  options.chatId.forEach(it => tasks.push(sendMessage('chat_id', it)));
  await Promise.allSettled(tasks);

  console.info(`✅ ${success}/${tasks.length} done`);
}

export function applySyncPr(program: Command) {
  program.addCommand(
    new Command('sync-pr')
      .description('Synchronize GitHub PR via lark')
      .option('--email [emails...]', 'email list split by `,`', [])
      .option('--chat-id [chat-ids...]', 'chat id list split by `,`', [])
      .action(syncPr),
  );
}
