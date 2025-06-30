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
