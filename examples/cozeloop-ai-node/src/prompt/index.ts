import { run as runMultiPart } from './with-multi-part';
import { run as runWithLabel } from './with-label';
import { run as runWithJinja } from './with-jinja';
import { run as runBasic } from './hub';

export async function run() {
  await Promise.all([
    runBasic(),
    runWithJinja(),
    runMultiPart(),
    runWithLabel(),
  ]);

  process.exit(0);
}
