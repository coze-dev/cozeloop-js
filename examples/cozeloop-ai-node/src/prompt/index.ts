import { run as runWithJinja } from './with-jinja';
import { run as runBasic } from './hub';

export async function run() {
  await Promise.all([runBasic(), runWithJinja()]);

  process.exit(0);
}
