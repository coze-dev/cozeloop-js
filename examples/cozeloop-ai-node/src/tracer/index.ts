import { cozeLoopTracer } from '@cozeloop/ai';

import { runRoot } from './root';
import { runMultiModality } from './multi-modality';
import { runModel } from './llm';
import { runLargeText } from './large-text';
import { runCustom } from './basic';

export async function run() {
  // initialize tracer globally
  cozeLoopTracer.initialize({
    /** workspace id, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
    // workspaceId: 'your_workspace_id',
    apiClient: {
      // baseURL: 'https://api.coze.cn',
      // token: 'your_api_token',
    },
    /** Allow ultra long text report */
    ultraLargeReport: true,
  });

  await Promise.all([
    runRoot(),
    runCustom(),
    runModel(),
    runMultiModality(),
    runLargeText(),
  ]);
}
