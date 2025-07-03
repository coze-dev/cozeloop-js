// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { Command, Option } from 'commander';

import { applySyncIssue } from './sync-issue';
import { applySendMessage } from './send-message';

function createProgram() {
  const program = new Command();

  program.name('lark').description('Lark tools');

  applySendMessage(program);
  applySyncIssue(program);

  // add common options
  program.commands.forEach(it =>
    it
      .addOption(new Option('--app-id [appId]', 'app id').env('LARK_APP_ID'))
      .addOption(
        new Option('--app-secret [appSecret]', 'app secret').env(
          'LARK_APP_SECRET',
        ),
      )
      .addOption(
        new Option('--app-type [appType]', 'app type').env('LARK_APP_TYPE'),
      )
      .addOption(new Option('--domain [domain]', 'domain').env('LARK_DOMAIN')),
  );

  return program;
}

export function applyLarkCommand(program: Command) {
  program.addCommand(createProgram());

  return program;
}
