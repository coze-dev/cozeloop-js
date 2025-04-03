import { config } from 'dotenv';

import { run as runTrace } from './tracer/trace';
import { run as runPromptHub } from './prompt/hub';
import { run as runOAuthJwt } from './auth/oauth-jwt';
import { run as runApiClient } from './api/api-client';

interface Task {
  name: string;
  run: () => Promise<void>;
}

async function run() {
  const tasks: Task[] = [
    { name: 'PromptHub', run: runPromptHub },
    { name: 'ApiClient', run: runApiClient },
    { name: 'OAuthJwt', run: runOAuthJwt },
    { name: 'Tracer', run: runTrace },
  ];

  const runTask = (task: Task) =>
    task
      .run()
      .then(() => console.info(`✅ ${task.name}`))
      .catch(e => console.error(`❌ ${task.name} error=${e}`));

  await Promise.all(tasks.map(it => runTask(it)));
}

config();
run();
