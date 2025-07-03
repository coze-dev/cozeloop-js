// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { Command } from 'commander';

import { applyLarkCommand } from './lark';

function createProgram() {
  const program = new Command('@cozeloop/ci-tools');

  program
    .name('cozeloop-ci')
    .description('🔧 Cozeloop CI tools.')
    .version(process.env.COZELOOP_VERSION);

  return program;
}

export function run() {
  const program = createProgram();

  applyLarkCommand(program);

  program.parse(process.argv);
}
