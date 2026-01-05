// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { Command } from 'commander';
import { Client } from '@larksuiteoapi/node-sdk';

import { larkOptionSchema, messageReceiverSchema } from './schema';

function makeCRUrl(pr_url?: string) {
  const baseUrl = process.env.PR_CR_BASE_URL;

  if (!pr_url || !baseUrl) {
    return;
  }

  const docUrl = process.env.PR_CR_DOC_URL || '';
  const formData = JSON.stringify([
    { name: 'pr_url', value: pr_url },
    { name: 'doc_url', value: docUrl },
  ]);

  const cr_url = new URL(baseUrl);
  cr_url.searchParams.append('formData', formData);
  cr_url.searchParams.append('autoreg', 'true');
  cr_url.searchParams.append('fromapp', 'GitHub');

  return cr_url.toString();
}

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
  const cr_url = makeCRUrl(pr_url);

  const isOpen = pr_action === 'opened' || pr_action === 'reopened';
  const isMerged = pr_action === 'closed' && pr_merged === 'true';

  const title = isMerged
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
            `${pr_title}  [#${pr_number}](${pr_url})<br />`,
            `发起人：${pr_sender}`,
            `仓库：[${repo_name}](https://github.com/${repo_name})`,
            `来源：\`${pr_source_owner}:${pr_source_ref}\``,
            `目标：\`${pr_target_owner}:${pr_target_ref}\``,
          ].join('\n'),
          text_align: 'left',
          text_size: 'normal_v2',
          margin: '0px 0px 0px 0px',
        },
        {
          tag: 'hr',
          margin: '0px 0px 0px 0px',
        },
        {
          tag: 'column_set',
          columns: [
            {
              tag: 'column',
              width: 'weighted',
              elements: [
                {
                  tag: 'markdown',
                  content: `<a href="${pr_url}">👉 前往查看</a>`,
                  text_align: 'left',
                  text_size: 'normal_v2',
                  margin: '0px 0px 0px 0px',
                },
              ],
              vertical_align: 'top',
              weight: 1,
            },
            isOpen && cr_url
              ? {
                  tag: 'column',
                  width: 'weighted',
                  elements: [
                    {
                      tag: 'markdown',
                      content: `<a href="${cr_url}">🔍 Aime CR</a>`,
                      text_align: 'left',
                      text_size: 'normal_v2',
                      margin: '0px 0px 0px 0px',
                    },
                  ],
                  vertical_align: 'top',
                  weight: 1,
                }
              : undefined,
          ],
        },
      ].filter(v => Boolean(v)),
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
